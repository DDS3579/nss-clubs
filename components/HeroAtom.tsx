"use client";
import React, { useCallback, useEffect, useRef } from "react";
import { CLUBS, EXECUTIVE_TEAM, ORBIT_ANGLES_DEG, getClubAtSlot } from "@/lib/clubs";
import { clamp01, degToRad, easeInOutQuart, shortestAngle } from "@/lib/math";

/* ═══════════════════════════════════════════════════════════
   The NSS atom: the executive team is the nucleus, the six clubs
   are the electrons. Drawn on a canvas, driven by refs that
   HomeScrollExperience updates every frame.

   What changed from the old version:
   - Removed ~400 lines of dead sun / planet / star drawing
     (the morph amount was hard-coded to 0, so it never ran).
   - Callbacks are read through refs, so a parent re-render no
     longer restarts the whole animation (that was resetting the
     electrons mid-zoom every time a club was clicked).
   - Canvas is 1-2x sharp normally and only goes ultra-sharp while
     a zoom is running (it used to be a fixed 2560x2560 bitmap).
   - Animation speed is time-based, so it is the same on 60/120/144 Hz.
   - Tap targets grow when the atom is small (phones).
   - Keyboard / screen-reader users get real buttons.
   - Respects "reduce motion".
   ═══════════════════════════════════════════════════════════ */

interface HeroAtomProps {
  /** 0 = hero, 1 = clubs section. Electrons settle onto the horizontal axis as it grows. */
  progressRef?: React.MutableRefObject<number>;
  /** Extra rotation (radians) applied to all orbits during the club zoom. */
  rotationOffsetRef?: React.MutableRefObject<number>;
  /** 0-1: slides the orbits away so the nucleus can be zoomed on its own. */
  nucleusSeparationRef?: React.MutableRefObject<number>;
  /** Set true while a zoom is running or open: switches the canvas to extra-sharp. */
  zoomActiveRef?: React.MutableRefObject<boolean>;
  /** @deprecated No longer used. Kept only so HomeScrollExperience still compiles. */
  aboutProgressRef?: React.MutableRefObject<number>;
  /** @deprecated No longer used. Kept only so HomeScrollExperience still compiles. */
  activeAboutNodeRef?: React.MutableRefObject<number>;
  className?: string;
  onElectronClick?: (slug: string) => void;
  onElectronHover?: (slug: string | null) => void;
}

/* ─── geometry (logical canvas units; the canvas is scaled by CSS) ─── */
const CANVAS_SIZE = 640;
const CX = CANVAS_SIZE / 2;
const CY = CANVAS_SIZE / 2;

const ORBIT_RX = 200;
const ORBIT_RY = 67;
const NUCLEUS_RADIUS = 34;
const ELECTRON_RADIUS = 14;

/* ─── colours ─── */
const DEEP_BLUE = "#011f5b";
const ACCENT_GOLD = "#D4A373";

/* ─── interaction ─── */
const ELECTRON_HIT_RADIUS = 30;
const NUCLEUS_HIT_RADIUS = 40;
/** Never let a tap target be smaller than this many CSS pixels (phone-friendly). */
const MIN_TAP_RADIUS_PX = 22;

/* ─── orbit definitions (tilt comes from lib/clubs so it is defined once) ─── */
const ORBIT_ELECTRON_OFFSETS = [
  [0, Math.PI],
  [Math.PI * 0.33, Math.PI * 1.33],
  [Math.PI * 0.66, Math.PI * 1.66],
] as const;
const ORBIT_SPEEDS = [0.016, 0.013, 0.018] as const;

const ORBITS = ORBIT_ANGLES_DEG.map((angleDeg, i) => ({
  rx: ORBIT_RX,
  ry: ORBIT_RY,
  angleDeg,
  offsets: ORBIT_ELECTRON_OFFSETS[i],
  speed: ORBIT_SPEEDS[i],
}));

/** Everything you can click, in the order screen readers announce it. */
const NODES = [...CLUBS, EXECUTIVE_TEAM];

interface ElectronCoord {
  x: number;
  y: number;
  slug: string;
  name: string;
}

const HeroAtom: React.FC<HeroAtomProps> = ({
  progressRef,
  rotationOffsetRef,
  nucleusSeparationRef,
  zoomActiveRef,
  className,
  onElectronClick,
  onElectronHover,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const electronCoordsRef = useRef<ElectronCoord[]>([]);
  const nucleusCoordsRef = useRef({ x: CX, y: CY });
  const hoveredSlugRef = useRef<string | null>(null);

  /* Latest callbacks live in refs. The animation effect never depends on them,
     so the parent re-rendering can't restart the animation. */
  const onClickRef = useRef(onElectronClick);
  const onHoverRef = useRef(onElectronHover);
  useEffect(() => {
    onClickRef.current = onElectronClick;
    onHoverRef.current = onElectronHover;
  });

  const setHovered = useCallback((slug: string | null) => {
    if (hoveredSlugRef.current === slug) return;
    hoveredSlugRef.current = slug;
    onHoverRef.current?.(slug);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* ── resolution ──
       normal: up to 2x (sharp on retina, light on phones)
       zoom:   up to 4x (3x on narrow screens) only while a zoom is open */
    const deviceDpr = window.devicePixelRatio || 1;
    const BASE_DPR = Math.min(Math.max(deviceDpr, 1), 2);
    const ZOOM_DPR = Math.min(
      Math.max(deviceDpr, 2) * 2,
      window.innerWidth < 768 ? 3 : 4,
    );
    let currentDpr = 0;
    const applyResolution = (dpr: number) => {
      currentDpr = dpr;
      canvas.width = Math.round(CANVAS_SIZE * dpr);
      canvas.height = Math.round(CANVAS_SIZE * dpr);
      canvas.style.width = `${CANVAS_SIZE}px`;
      canvas.style.height = `${CANVAS_SIZE}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    applyResolution(BASE_DPR);

    /* The tooltip font: next/font gives Inter a generated name, so the plain
       word 'Inter' never matched. Read the real name from the CSS variable. */
    const fontFamily =
      getComputedStyle(canvas).getPropertyValue("--font-inter").trim() || "sans-serif";

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduceMotion = motionQuery.matches;
    const onMotionChange = (e: MediaQueryListEvent) => {
      reduceMotion = e.matches;
    };
    motionQuery.addEventListener("change", onMotionChange);

    let animationId = 0;
    let elapsed = 0; // measured in "60 fps frames", advances with real time
    let lastTimestamp = 0;

    /* ───────────────────────── drawing ───────────────────────── */

    function drawOrbit(rx: number, ry: number, angleDeg: number, alpha: number) {
      if (alpha <= 0) return;
      const angle = degToRad(angleDeg) + (rotationOffsetRef?.current ?? 0);
      ctx!.save();
      ctx!.translate(CX, CY);
      ctx!.rotate(angle);
      ctx!.beginPath();
      ctx!.ellipse(0, 0, rx, ry, 0, 0, 2 * Math.PI);
      ctx!.strokeStyle = `rgba(2,59,142,${alpha})`;
      ctx!.lineWidth = 1.2;
      ctx!.stroke();
      ctx!.restore();
    }

    function getElectronPos(rx: number, ry: number, angleDeg: number, theta: number) {
      const a = degToRad(angleDeg) + (rotationOffsetRef?.current ?? 0);
      const ex = rx * Math.cos(theta);
      const ey = ry * Math.sin(theta);
      return {
        x: CX + ex * Math.cos(a) - ey * Math.sin(a),
        y: CY + ex * Math.sin(a) + ey * Math.cos(a),
      };
    }

    function drawElectron(x: number, y: number) {
      const r = ELECTRON_RADIUS;
      ctx!.save();
      ctx!.globalAlpha = 1;

      // Soft shadow
      const shadow = ctx!.createRadialGradient(x + 1.5, y + 2, 0, x + 1.5, y + 2, r * 1.5);
      shadow.addColorStop(0, "rgba(0,10,40,0.35)");
      shadow.addColorStop(1, "rgba(0,0,0,0)");
      ctx!.beginPath();
      ctx!.arc(x, y, r * 1.5, 0, 2 * Math.PI);
      ctx!.fillStyle = shadow;
      ctx!.fill();

      // Base
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, 2 * Math.PI);
      ctx!.fillStyle = DEEP_BLUE;
      ctx!.fill();

      // Metallic sheen
      const metal = ctx!.createLinearGradient(x - r, y - r, x + r, y + r);
      metal.addColorStop(0, "rgba(160,195,255,0.1)");
      metal.addColorStop(0.3, "rgba(190,220,255,0.55)");
      metal.addColorStop(0.7, "rgba(10,50,140,0.2)");
      metal.addColorStop(1, "rgba(180,210,255,0.1)");
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, 2 * Math.PI);
      ctx!.fillStyle = metal;
      ctx!.fill();

      // Highlight
      const hl = ctx!.createRadialGradient(x - r * 0.4, y - r * 0.4, 0, x - r * 0.4, y - r * 0.4, r * 0.6);
      hl.addColorStop(0, "rgba(255,255,255,0.85)");
      hl.addColorStop(1, "rgba(255,255,255,0)");
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, 2 * Math.PI);
      ctx!.fillStyle = hl;
      ctx!.fill();

      ctx!.restore();
    }

    function drawNucleus(x: number, y: number, r: number) {
      ctx!.save();

      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, 2 * Math.PI);
      ctx!.fillStyle = "#7a5000";
      ctx!.fill();

      const metal = ctx!.createLinearGradient(x - r, y - r, x + r, y + r);
      metal.addColorStop(0, "rgb(255,248,192)");
      metal.addColorStop(0.2, "rgb(245,216,74)");
      metal.addColorStop(0.5, ACCENT_GOLD);
      metal.addColorStop(0.8, "rgb(232,192,80)");
      metal.addColorStop(1, "#a06800");
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, 2 * Math.PI);
      ctx!.fillStyle = metal;
      ctx!.fill();

      const rim = ctx!.createRadialGradient(x, y, r * 0.6, x, y, r);
      rim.addColorStop(0, "rgba(0,0,0,0)");
      rim.addColorStop(1, "rgba(60,30,0,0.5)");
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, 2 * Math.PI);
      ctx!.fillStyle = rim;
      ctx!.fill();

      const blob = ctx!.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x - r * 0.3, y - r * 0.3, r * 0.7);
      blob.addColorStop(0, "rgba(255,255,220,0.9)");
      blob.addColorStop(1, "rgba(255,255,255,0)");
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, 2 * Math.PI);
      ctx!.fillStyle = blob;
      ctx!.fill();

      ctx!.restore();
    }

    function drawTooltip(text: string, tx: number, ty: number, isExecutive: boolean) {
      ctx!.save();
      ctx!.font = `bold 12px ${fontFamily}`;
      const padX = 12;
      const rectW = ctx!.measureText(text).width + padX * 2;
      const rectH = 26;
      const rectX = tx - rectW / 2;
      const rectY = ty - 45;

      ctx!.shadowColor = "rgba(0, 10, 40, 0.2)";
      ctx!.shadowBlur = 12;
      ctx!.shadowOffsetY = 4;
      ctx!.fillStyle = isExecutive ? ACCENT_GOLD : "#011f5b";

      ctx!.beginPath();
      if (typeof ctx!.roundRect === "function") {
        ctx!.roundRect(rectX, rectY, rectW, rectH, 8);
      } else {
        ctx!.rect(rectX, rectY, rectW, rectH);
      }
      ctx!.fill();

      // Little pointer under the label
      ctx!.shadowColor = "transparent";
      ctx!.beginPath();
      ctx!.moveTo(tx - 6, rectY + rectH);
      ctx!.lineTo(tx + 6, rectY + rectH);
      ctx!.lineTo(tx, rectY + rectH + 6);
      ctx!.closePath();
      ctx!.fill();

      ctx!.fillStyle = isExecutive ? "#011f5b" : "#ffffff";
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
      ctx!.fillText(text, tx, rectY + rectH / 2 + 1);
      ctx!.restore();
    }

    /* ───────────────────────── frame loop ───────────────────────── */

    function frame(timestamp: number) {
      // Cap at roughly 60 fps (saves battery on 120 Hz phones)
      if (lastTimestamp && timestamp - lastTimestamp < 14) {
        animationId = requestAnimationFrame(frame);
        return;
      }
      // dt is measured in 60 fps frames so the speed is identical on any screen
      const dt = lastTimestamp ? Math.min(timestamp - lastTimestamp, 100) / (1000 / 60) : 1;
      lastTimestamp = timestamp;
      if (!reduceMotion) elapsed += dt;

      // Extra-sharp only while a zoom is running
      const wantedDpr = zoomActiveRef?.current ? ZOOM_DPR : BASE_DPR;
      if (wantedDpr !== currentDpr) applyResolution(wantedDpr);

      const p = clamp01(progressRef?.current ?? 0);
      const eased = easeInOutQuart(p);
      const settle = easeInOutQuart(clamp01((p - 0.56) / 0.44));
      const sep = clamp01(nucleusSeparationRef?.current ?? 0);

      // 3D spin of the whole atom while travelling hero → clubs.
      // (Only during the transition: perspective would distort hit-testing afterwards.)
      if (p > 0.001 && p < 0.999) {
        const rotY = eased * 360;
        const rotX = Math.sin(Math.PI * eased) * 12;
        const rotZ = Math.sin(Math.PI * eased) * -15;
        const pulse = 1 + Math.sin(Math.PI * p) * 0.15;
        container!.style.transform = `perspective(1000px) rotateY(${rotY}deg) rotateX(${rotX}deg) rotateZ(${rotZ}deg) scale(${pulse})`;
      } else {
        container!.style.transform = "";
      }

      ctx!.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // During the executive zoom the orbits slide away to the left and fade
      const orbitShiftX = sep * -700;
      const orbitFade = 1 - sep;
      const shifted = sep > 0.001;

      // 1. Orbit rings
      if (shifted) {
        ctx!.save();
        ctx!.globalAlpha = orbitFade;
        ctx!.translate(orbitShiftX, 0);
      }
      ORBITS.forEach((o) => drawOrbit(o.rx, o.ry, o.angleDeg, orbitFade));
      if (shifted) ctx!.restore();

      // 2. Nucleus (stays put)
      nucleusCoordsRef.current = { x: CX, y: CY };
      drawNucleus(CX, CY, NUCLEUS_RADIUS);

      // 3. Electrons
      const coords: ElectronCoord[] = [];
      if (shifted) {
        ctx!.save();
        ctx!.globalAlpha = orbitFade;
        ctx!.translate(orbitShiftX, 0);
      }

      ORBITS.forEach((o, orbitIdx) => {
        o.offsets.forEach((offset, electronIdx) => {
          const movingTheta = offset + elapsed * o.speed;
          let theta = movingTheta;

          // On the way to the clubs section, electrons glide onto the horizontal axis
          if (p > 0.001) {
            const target = electronIdx === 0 ? 0 : Math.PI;
            theta = movingTheta + shortestAngle(movingTheta, target) * settle;
          }

          const pos = getElectronPos(o.rx, o.ry, o.angleDeg, theta);
          const club = getClubAtSlot(orbitIdx, electronIdx);

          if (club && club.slug === hoveredSlugRef.current && sep < 0.01) {
            ctx!.save();
            ctx!.beginPath();
            ctx!.arc(pos.x, pos.y, 22 + Math.sin(elapsed * 0.15) * 3, 0, 2 * Math.PI);
            ctx!.fillStyle = "rgba(2, 59, 142, 0.2)";
            ctx!.fill();
            ctx!.restore();
          }

          drawElectron(pos.x, pos.y);

          if (club) {
            coords.push({
              x: shifted ? pos.x + orbitShiftX : pos.x,
              y: pos.y,
              slug: club.slug,
              name: club.name,
            });
          }
        });
      });

      if (shifted) ctx!.restore();
      electronCoordsRef.current = coords;

      // 4. Tooltip
      const hovered = hoveredSlugRef.current;
      if (hovered === EXECUTIVE_TEAM.slug) {
        drawTooltip(EXECUTIVE_TEAM.name, CX, CY, true);
      } else if (hovered) {
        const ec = coords.find((c) => c.slug === hovered);
        if (ec) drawTooltip(ec.name, ec.x, ec.y, false);
      }

      animationId = requestAnimationFrame(frame);
    }

    /* ───────────────────────── pointer input ───────────────────────── */

    /** Finds the nucleus/electron under a screen point (closest fit wins). */
    function pickNode(clientX: number, clientY: number): string | null {
      const rect = canvas!.getBoundingClientRect();
      if (!rect.width) return null;
      const scale = rect.width / CANVAS_SIZE; // CSS px per logical unit
      const x = (clientX - rect.left) / scale;
      const y = (clientY - rect.top) / scale;
      const minRadius = MIN_TAP_RADIUS_PX / scale; // keeps phone taps forgiving

      let best: string | null = null;
      let bestScore = Infinity;

      const nucleus = nucleusCoordsRef.current;
      const nucleusReach = Math.max(NUCLEUS_HIT_RADIUS, minRadius);
      const nucleusDist = Math.hypot(x - nucleus.x, y - nucleus.y);
      if (nucleusDist < nucleusReach) {
        best = EXECUTIVE_TEAM.slug;
        bestScore = nucleusDist / nucleusReach;
      }

      const electronReach = Math.max(ELECTRON_HIT_RADIUS, minRadius);
      for (const ec of electronCoordsRef.current) {
        const dist = Math.hypot(x - ec.x, y - ec.y);
        if (dist < electronReach && dist / electronReach < bestScore) {
          best = ec.slug;
          bestScore = dist / electronReach;
        }
      }
      return best;
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return; // touch has no hover
      const slug = pickNode(e.clientX, e.clientY);
      setHovered(slug);
      canvas.style.cursor = slug ? "pointer" : "default";
    };

    const handlePointerLeave = () => {
      setHovered(null);
      canvas.style.cursor = "default";
    };

    const handleClick = (e: MouseEvent) => {
      const slug = pickNode(e.clientX, e.clientY);
      if (slug) onClickRef.current?.(slug);
    };

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    canvas.addEventListener("click", handleClick);
    animationId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animationId);
      motionQuery.removeEventListener("change", onMotionChange);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      canvas.removeEventListener("click", handleClick);
    };
    // Only stable refs/callbacks here on purpose: a parent re-render must never restart the atom.
  }, [progressRef, rotationOffsetRef, nucleusSeparationRef, zoomActiveRef, setHovered]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
      role="group"
      aria-label="NSS Clubs: the executive team and the six clubs"
    >
      <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="block" aria-hidden="true" />

      {/* Keyboard & screen-reader path: real buttons for everything on the canvas.
          Focusing one highlights it on the atom; Enter opens it. */}
      <ul className="sr-only">
        {NODES.map((node) => (
          <li key={node.slug}>
            <button
              type="button"
              onClick={() => onClickRef.current?.(node.slug)}
              onFocus={() => setHovered(node.slug)}
              onBlur={() => setHovered(null)}
            >
              {node.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HeroAtom;