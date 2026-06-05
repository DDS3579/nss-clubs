"use client";
import React, { useRef, useEffect } from "react";

interface HeroAtomProps {
  progressRef?: React.MutableRefObject<number>;
  rotationOffsetRef?: React.MutableRefObject<number>;
  nucleusSeparationRef?: React.MutableRefObject<number>;
  className?: string;
  onElectronClick?: (slug: string) => void;
  onElectronHover?: (slug: string | null) => void;
}

const CANVAS_SIZE = 640;
const CX = CANVAS_SIZE / 2;
const CY = CANVAS_SIZE / 2;

const orbits = [
  { rx: 200, ry: 67, angleDeg: -60, offsets: [0, Math.PI], speed: 0.016 },
  {
    rx: 200,
    ry: 67,
    angleDeg: 0,
    offsets: [Math.PI * 0.33, Math.PI * 1.33],
    speed: 0.013,
  },
  {
    rx: 200,
    ry: 67,
    angleDeg: 60,
    offsets: [Math.PI * 0.66, Math.PI * 1.66],
    speed: 0.018,
  },
];

const CLUB_MAPPING = [
  { orbitIdx: 0, electronIdx: 0, slug: "stem", name: "STEM Club" },
  { orbitIdx: 0, electronIdx: 1, slug: "sports", name: "Sports Club" },
  { orbitIdx: 1, electronIdx: 0, slug: "literature", name: "Literature Club" },
  { orbitIdx: 1, electronIdx: 1, slug: "arts", name: "Arts & Craft Club" },
  {
    orbitIdx: 2,
    electronIdx: 0,
    slug: "entertainment",
    name: "Entertainment Club",
  },
  { orbitIdx: 2, electronIdx: 1, slug: "social", name: "Social Club" },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}
function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function shortestAngle(start: number, end: number) {
  let diff = (end - start) % (Math.PI * 2);
  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

const HeroAtom: React.FC<HeroAtomProps> = ({
  progressRef,
  rotationOffsetRef,
  nucleusSeparationRef,
  className,
  onElectronClick,
  onElectronHover,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const electronCoordsRef = useRef<
    { x: number; y: number; slug: string; name: string }[]
  >([]);
  const hoveredSlugRef = useRef<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DPR = 3;
    canvas.width = CANVAS_SIZE * DPR;
    canvas.height = CANVAS_SIZE * DPR;
    canvas.style.width = `${CANVAS_SIZE}px`;
    canvas.style.height = `${CANVAS_SIZE}px`;
    ctx.scale(DPR, DPR);

    let animationId: number;
    let elapsed = 0;

    function drawOrbit(
      rx: number,
      ry: number,
      angleDeg: number,
      orbitFade: number,
    ) {
      const a = (angleDeg * Math.PI) / 180 + (rotationOffsetRef?.current ?? 0);
      ctx!.save();
      ctx!.translate(CX, CY);
      ctx!.rotate(a);
      ctx!.beginPath();
      ctx!.ellipse(0, 0, rx, ry, 0, 0, 2 * Math.PI);
      ctx!.strokeStyle = "#023B8E";
      ctx!.lineWidth = 0.9;
      ctx!.globalAlpha = orbitFade;
      ctx!.stroke();
      ctx!.restore();
    }

    function getPos(rx: number, ry: number, angleDeg: number, theta: number) {
      const a = (angleDeg * Math.PI) / 180 + (rotationOffsetRef?.current ?? 0);
      const ex = rx * Math.cos(theta);
      const ey = ry * Math.sin(theta);
      return {
        x: CX + ex * Math.cos(a) - ey * Math.sin(a),
        y: CY + ex * Math.sin(a) + ey * Math.cos(a),
      };
    }

    function drawElectron(x: number, y: number) {
      const r = 14;
      const shadow = ctx!.createRadialGradient(
        x + 1.5,
        y + 2,
        0,
        x + 1.5,
        y + 2,
        r * 1.4,
      );
      shadow.addColorStop(0, "rgba(0,10,40,0.38)");
      shadow.addColorStop(1, "rgba(0,0,0,0)");
      ctx!.beginPath();
      ctx!.arc(x, y, r * 1.4, 0, 2 * Math.PI);
      ctx!.fillStyle = shadow;
      ctx!.fill();

      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, 2 * Math.PI);
      ctx!.fillStyle = "#011f5b";
      ctx!.fill();

      const metal = ctx!.createLinearGradient(x - r, y - r, x + r, y + r);
      metal.addColorStop(0, "rgba(160,195,255,0.0)");
      metal.addColorStop(0.08, "rgba(160,195,255,0.0)");
      metal.addColorStop(0.18, "rgba(190,220,255,0.55)");
      metal.addColorStop(0.3, "rgba(80,130,220,0.30)");
      metal.addColorStop(0.48, "rgba(10,50,140,0.15)");
      metal.addColorStop(0.62, "rgba(5,30,100,0.0)");
      metal.addColorStop(0.75, "rgba(100,150,230,0.25)");
      metal.addColorStop(0.88, "rgba(180,210,255,0.18)");
      metal.addColorStop(1, "rgba(180,210,255,0.0)");
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, 2 * Math.PI);
      ctx!.fillStyle = metal;
      ctx!.fill();

      const hl = ctx!.createRadialGradient(
        x - r * 0.38,
        y - r * 0.42,
        0,
        x - r * 0.38,
        y - r * 0.42,
        r * 0.62,
      );
      hl.addColorStop(0, "rgba(235,248,255,0.95)");
      hl.addColorStop(0.35, "rgba(180,220,255,0.45)");
      hl.addColorStop(1, "rgba(255,255,255,0)");
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, 2 * Math.PI);
      ctx!.fillStyle = hl;
      ctx!.fill();

      ctx!.beginPath();
      ctx!.arc(x - r * 0.32, y - r * 0.36, r * 0.17, 0, 2 * Math.PI);
      ctx!.fillStyle = "rgba(255,255,240,0.97)";
      ctx!.fill();
    }

    function drawNucleus() {
      const r = 34;
      ctx!.beginPath();
      ctx!.arc(CX, CY, r, 0, 2 * Math.PI);
      ctx!.fillStyle = "#7a5000";
      ctx!.fill();

      const metal = ctx!.createLinearGradient(CX - r, CY - r, CX + r, CY + r);
      metal.addColorStop(0, "#fff8c0");
      metal.addColorStop(0.08, "#f5d84a");
      metal.addColorStop(0.22, "#D4A373");
      metal.addColorStop(0.38, "#8a5e00");
      metal.addColorStop(0.5, "#b07d10");
      metal.addColorStop(0.62, "#D4A373");
      metal.addColorStop(0.72, "#e8c050");
      metal.addColorStop(0.82, "#c49520");
      metal.addColorStop(0.9, "#f0d060");
      metal.addColorStop(1, "#a06800");
      ctx!.beginPath();
      ctx!.arc(CX, CY, r, 0, 2 * Math.PI);
      ctx!.fillStyle = metal;
      ctx!.fill();

      const rim = ctx!.createRadialGradient(CX, CY, r * 0.55, CX, CY, r);
      rim.addColorStop(0, "rgba(0,0,0,0)");
      rim.addColorStop(1, "rgba(60,30,0,0.6)");
      ctx!.beginPath();
      ctx!.arc(CX, CY, r, 0, 2 * Math.PI);
      ctx!.fillStyle = rim;
      ctx!.fill();

      const blob = ctx!.createRadialGradient(
        CX - r * 0.3,
        CY - r * 0.34,
        0,
        CX - r * 0.3,
        CY - r * 0.34,
        r * 0.7,
      );
      blob.addColorStop(0, "rgba(255,255,210,0.82)");
      blob.addColorStop(0.5, "rgba(255,245,160,0.25)");
      blob.addColorStop(1, "rgba(255,255,255,0)");
      ctx!.beginPath();
      ctx!.arc(CX, CY, r, 0, 2 * Math.PI);
      ctx!.fillStyle = blob;
      ctx!.fill();

      ctx!.beginPath();
      ctx!.arc(CX - r * 0.28, CY - r * 0.3, r * 0.16, 0, 2 * Math.PI);
      ctx!.fillStyle = "rgba(255,255,240,0.97)";
      ctx!.fill();

      ctx!.beginPath();
      ctx!.arc(CX - r * 0.46, CY - r * 0.14, r * 0.065, 0, 2 * Math.PI);
      ctx!.fillStyle = "rgba(255,255,255,0.75)";
      ctx!.fill();
    }

    function frame() {
      if (!ctx || !canvas || !container) return;
      const p = clamp01(progressRef?.current ?? 0);
      const eased = easeInOut(p);
      const settle = easeInOut(clamp01((p - 0.56) / 0.44));
      const sep = clamp01(nucleusSeparationRef?.current ?? 0);

      if (p > 0.001) {
        const rotY = eased * 360;
        const rotX = Math.sin(Math.PI * eased) * 12;
        const rotZ = Math.sin(Math.PI * eased) * -15;
        const pulse = 1 + Math.sin(Math.PI * p) * 0.15;
        container.style.transform = `perspective(1000px) rotateY(${rotY}deg) rotateX(${rotX}deg) rotateZ(${rotZ}deg) scale(${pulse})`;
      } else {
        container.style.transform = "";
      }

      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      const orbitShiftX = sep * -700;
      const orbitFade = 1 - sep;

      if (sep > 0.001) {
        ctx.save();
        ctx.globalAlpha = orbitFade;
        ctx.translate(orbitShiftX, 0);
      }

      orbits.forEach((o) => drawOrbit(o.rx, o.ry, o.angleDeg, orbitFade));

      if (sep > 0.001) {
        ctx.restore();
      }

      ctx.save();
      ctx.globalAlpha = 1;
      drawNucleus();
      ctx.restore();

      const newCoords: { x: number; y: number; slug: string; name: string }[] =
        [];

      if (sep > 0.001) {
        ctx.save();
        ctx.globalAlpha = orbitFade;
        ctx.translate(orbitShiftX, 0);
      }

      orbits.forEach((o, orbitIdx) => {
        o.offsets.forEach((off, idx) => {
          const movingTheta = off + elapsed * o.speed;
          let theta = movingTheta;

          if (p > 0.001) {
            const target = idx === 0 ? 0 : Math.PI;
            theta = movingTheta + shortestAngle(movingTheta, target) * settle;
          }

          const pos = getPos(o.rx, o.ry, o.angleDeg, theta);
          const drawX = pos.x;
          const drawY = pos.y;

          const map = CLUB_MAPPING.find(
            (m) => m.orbitIdx === orbitIdx && m.electronIdx === idx,
          );
          const isHovered = map && map.slug === hoveredSlugRef.current;

          if (isHovered && sep < 0.01) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(
              drawX,
              drawY,
              22 + Math.sin(elapsed * 0.15) * 3,
              0,
              2 * Math.PI,
            );
            ctx.fillStyle = "rgba(2, 59, 142, 0.2)";
            ctx.fill();
            ctx.restore();
          }

          drawElectron(drawX, drawY);

          if (map) {
            const visualX = sep > 0.001 ? drawX + orbitShiftX : drawX;
            newCoords.push({
              x: visualX,
              y: drawY,
              slug: map.slug,
              name: map.name,
            });
          }
        });
      });

      if (sep > 0.001) ctx.restore();

      electronCoordsRef.current = newCoords;

      if (hoveredSlugRef.current) {
        let text = "";
        let tx = CX;
        let ty = CY;
        if (hoveredSlugRef.current === "executive-team") {
          text = "Executive Team";
          tx = CX;
          ty = CY;
        } else {
          const hoveredEc = newCoords.find(
            (ec) => ec.slug === hoveredSlugRef.current,
          );
          if (hoveredEc) {
            text = hoveredEc.name;
            tx = hoveredEc.x;
            ty = hoveredEc.y;
          }
        }

        if (text) {
          ctx.save();
          ctx.font = "bold 12px sans-serif";
          const textWidth = ctx.measureText(text).width;
          const padX = 10;
          const rectW = textWidth + padX * 2;
          const rectH = 24;
          const rectX = tx - rectW / 2;
          const rectY = ty - 42;
          ctx.shadowColor = "rgba(0, 10, 40, 0.18)";
          ctx.shadowBlur = 8;
          ctx.shadowOffsetY = 4;
          ctx.fillStyle =
            hoveredSlugRef.current === "executive-team" ? "#D4A373" : "#011f5b";
          ctx.beginPath();
          ctx.roundRect
            ? ctx.roundRect(rectX, rectY, rectW, rectH, 6)
            : ctx.rect(rectX, rectY, rectW, rectH);
          ctx.fill();
          ctx.shadowColor = "transparent";
          ctx.beginPath();
          ctx.moveTo(tx - 6, rectY + rectH);
          ctx.lineTo(tx + 6, rectY + rectH);
          ctx.lineTo(tx, rectY + rectH + 5);
          ctx.closePath();
          ctx.fillStyle =
            hoveredSlugRef.current === "executive-team" ? "#D4A373" : "#011f5b";
          ctx.fill();
          ctx.fillStyle =
            hoveredSlugRef.current === "executive-team" ? "#011f5b" : "#ffffff";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(text, tx, rectY + rectH / 2);
          ctx.restore();
        }
      }

      elapsed++;
      animationId = requestAnimationFrame(frame);
    }

    const handleMouseMove = (e: MouseEvent) => {
      const canvasEl = canvasRef.current;
      if (!canvasEl) return;
      const rect = canvasEl.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      const x = (clientX / rect.width) * CANVAS_SIZE;
      const y = (clientY / rect.height) * CANVAS_SIZE;

      let hoveredSlug: string | null = null;
      const minDistance = 30;
      const ndx = x - CX;
      const ndy = y - CY;
      const ndist = Math.sqrt(ndx * ndx + ndy * ndy);

      if (ndist < 40) {
        hoveredSlug = "executive-team";
      } else {
        for (const ec of electronCoordsRef.current) {
          const dx = x - ec.x;
          const dy = y - ec.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDistance) {
            hoveredSlug = ec.slug;
            break;
          }
        }
      }

      if (hoveredSlug !== hoveredSlugRef.current) {
        hoveredSlugRef.current = hoveredSlug;
        if (onElectronHover) onElectronHover(hoveredSlug);
      }

      if (hoveredSlug) {
        canvasEl.style.cursor = "pointer";
      } else {
        canvasEl.style.cursor = "";
      }
    };

    const handleClick = (e: MouseEvent) => {
      const canvasEl = canvasRef.current;
      if (!canvasEl) return;
      const rect = canvasEl.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      const x = (clientX / rect.width) * CANVAS_SIZE;
      const y = (clientY / rect.height) * CANVAS_SIZE;

      let clickedSlug: string | null = null;
      const minDistance = 30;
      const ndx = x - CX;
      const ndy = y - CY;
      const ndist = Math.sqrt(ndx * ndx + ndy * ndy);

      if (ndist < 40) {
        clickedSlug = "executive-team";
      } else {
        for (const ec of electronCoordsRef.current) {
          const dx = x - ec.x;
          const dy = y - ec.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDistance) {
            clickedSlug = ec.slug;
            break;
          }
        }
      }

      if (clickedSlug && onElectronClick) {
        onElectronClick(clickedSlug);
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);
    animationId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
    };
  }, [
    progressRef,
    rotationOffsetRef,
    nucleusSeparationRef,
    onElectronClick,
    onElectronHover,
  ]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="block"
      />
    </div>
  );
};

export default HeroAtom;
