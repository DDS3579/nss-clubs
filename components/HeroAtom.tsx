"use client";
import React, { useRef, useEffect } from "react";

interface HeroAtomProps {
  progressRef?: React.MutableRefObject<number>;
  rotationOffsetRef?: React.MutableRefObject<number>;
  nucleusSeparationRef?: React.MutableRefObject<number>;
  aboutProgressRef?: React.MutableRefObject<number>;
  activeAboutNodeRef?: React.MutableRefObject<number>;
  className?: string;
  onElectronClick?: (slug: string) => void;
  onElectronHover?: (slug: string | null) => void;
}

const CANVAS_SIZE = 640;
const CX = CANVAS_SIZE / 2;
const CY = CANVAS_SIZE / 2;
const PRIMARY_BLUE = "#023B8E";
const DEEP_BLUE = "#011f5b";
const ACCENT_GOLD = "#D4A373";
const PALE_GOLD = "#fff8c0";

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

// Timeline nodes for about section projector connections
export const TIMELINE_NODES = [
  { label: "Our Origin", targetX: 200, targetY: 110 },
  { label: "Our Vision", targetX: 90, targetY: 110 },
  { label: "The Legacy", targetX: 520, targetY: 110 },
];

const BACKGROUND_STARS = Array.from({ length: 30 }, (_, i) => ({
  x: Math.random() * CANVAS_SIZE,
  y: Math.random() * CANVAS_SIZE,
  size: Math.random() * 1.5 + 0.5,
  speed: Math.random() * 0.02 + 0.008,
  phase: Math.random() * Math.PI * 2,
  color: i % 3 === 0 ? "rgba(255, 248, 192, " : i % 3 === 1 ? "rgba(100, 180, 255, " : "rgba(255, 200, 150, ",
}));

// Planet definitions for the solar system
const PLANET_DEFS = [
  { x: 200, y: 110, r: 16, baseColor: "#4A90D9", accent: "#6BB5FF", name: "Mercury", hasRing: false, glowColor: "rgba(74,144,217,0.3)" },
  { x: 280, y: 110, r: 20, baseColor: "#E27D60", accent: "#FF9E80", name: "Venus", hasRing: false, glowColor: "rgba(226,125,96,0.3)" },
  { x: 360, y: 110, r: 24, baseColor: "#41B3A3", accent: "#6DE0CF", name: "Earth", hasRing: false, glowColor: "rgba(65,179,163,0.3)" },
  { x: 430, y: 110, r: 18, baseColor: "#C38D9E", accent: "#E8B4C4", name: "Mars", hasRing: false, glowColor: "rgba(195,141,158,0.3)" },
  { x: 510, y: 110, r: 30, baseColor: "#E8A87C", accent: "#FFD4B0", name: "Jupiter", hasRing: true, glowColor: "rgba(232,168,124,0.4)" },
  { x: 590, y: 110, r: 14, baseColor: "#5B8DEF", accent: "#8BB4FF", name: "Neptune", hasRing: false, glowColor: "rgba(91,141,239,0.3)" },
];

// 🎬 Easing Functions
function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}
function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function easeInOutQuart(t: number) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}
function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4);
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
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
  aboutProgressRef,
  activeAboutNodeRef,
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

    // Optimized: DPR 2 for crisp but performant rendering
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = CANVAS_SIZE * DPR;
    canvas.height = CANVAS_SIZE * DPR;
    canvas.style.width = `${CANVAS_SIZE}px`;
    canvas.style.height = `${CANVAS_SIZE}px`;
    ctx.scale(DPR, DPR);

    let animationId: number;
    let elapsed = 0;
    let lastTime = 0;

    /* ═══════════════════════════════════════════════════════════
       STAGE 1: ATOM — Orbit drawing
    ════════════════════════════════════════════════════════════ */
    function drawOrbit(
      rx: number,
      ry: number,
      angleDeg: number,
      orbitFade: number,
      morphT: number,
    ) {
      // During transition, orbits widen and fade
      const widenFactor = 1 + morphT * 0.8;
      const actualRx = rx * widenFactor;
      const actualRy = ry * widenFactor;
      
      const a = (angleDeg * Math.PI) / 180 + (rotationOffsetRef?.current ?? 0);
      ctx!.save();
      ctx!.translate(CX, CY);
      ctx!.rotate(a);
      ctx!.beginPath();
      ctx!.ellipse(0, 0, actualRx, actualRy, 0, 0, 2 * Math.PI);
      
      // Orbit color transitions from blue to warm gold during morph
      const orbitAlpha = orbitFade * (1 - morphT * 1.2);
      if (orbitAlpha > 0) {
        const r = Math.round(lerp(2, 212, morphT));
        const g = Math.round(lerp(59, 163, morphT));
        const b = Math.round(lerp(142, 115, morphT));
        ctx!.strokeStyle = `rgba(${r},${g},${b},${Math.max(0, orbitAlpha)})`;
        ctx!.lineWidth = lerp(1.2, 0.6, morphT);
        ctx!.stroke();
      }
      ctx!.restore();
    }

    function getPos(rx: number, ry: number, angleDeg: number, theta: number, morphT: number = 0) {
      const widenFactor = 1 + morphT * 0.8;
      const a = (angleDeg * Math.PI) / 180 + (rotationOffsetRef?.current ?? 0);
      const ex = rx * widenFactor * Math.cos(theta);
      const ey = ry * widenFactor * Math.sin(theta);
      return {
        x: CX + ex * Math.cos(a) - ey * Math.sin(a),
        y: CY + ex * Math.sin(a) + ey * Math.cos(a),
      };
    }

    /* ═══════════════════════════════════════════════════════════
       STAGE 1: ATOM — Electron drawing with trail effect
    ════════════════════════════════════════════════════════════ */
    function drawElectron(x: number, y: number, alpha = 1, trailLength = 0, trailAngle = 0) {
      const r = 14;
      ctx!.save();
      ctx!.globalAlpha = alpha;

      // Trail effect during transition
      if (trailLength > 0) {
        const trailGrad = ctx!.createLinearGradient(
          x - Math.cos(trailAngle) * trailLength,
          y - Math.sin(trailAngle) * trailLength,
          x, y
        );
        trailGrad.addColorStop(0, "rgba(2, 59, 142, 0)");
        trailGrad.addColorStop(0.5, `rgba(100, 160, 255, ${alpha * 0.15})`);
        trailGrad.addColorStop(1, `rgba(160, 200, 255, ${alpha * 0.3})`);
        
        ctx!.beginPath();
        ctx!.moveTo(x - Math.cos(trailAngle) * trailLength, y - Math.sin(trailAngle) * trailLength);
        ctx!.lineTo(x, y);
        ctx!.lineWidth = r * 1.5;
        ctx!.lineCap = "round";
        ctx!.strokeStyle = trailGrad;
        ctx!.stroke();
      }

      // Shadow
      const shadow = ctx!.createRadialGradient(
        x + 1.5, y + 2, 0,
        x + 1.5, y + 2, r * 1.5,
      );
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
      const hl = ctx!.createRadialGradient(
        x - r * 0.4, y - r * 0.4, 0,
        x - r * 0.4, y - r * 0.4, r * 0.6,
      );
      hl.addColorStop(0, "rgba(255,255,255,0.85)");
      hl.addColorStop(1, "rgba(255,255,255,0)");
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, 2 * Math.PI);
      ctx!.fillStyle = hl;
      ctx!.fill();

      ctx!.restore();
    }

    /* ═══════════════════════════════════════════════════════════
       STAGE 1: ATOM — Nucleus with brightening
    ════════════════════════════════════════════════════════════ */
    function drawNucleus(brightenT: number) {
      const r = 34;
      ctx!.save();

      // Brightening glow during transition
      if (brightenT > 0.01) {
        ctx!.shadowColor = lerp(0, 1, brightenT) > 0.5 ? "#FF8C00" : ACCENT_GOLD;
        ctx!.shadowBlur = 20 + brightenT * 50;
      }

      ctx!.beginPath();
      ctx!.arc(CX, CY, r, 0, 2 * Math.PI);
      ctx!.fillStyle = "#7a5000";
      ctx!.fill();

      const metal = ctx!.createLinearGradient(CX - r, CY - r, CX + r, CY + r);
      // Nucleus colors shift warmer as it brightens
      const warmShift = brightenT;
      metal.addColorStop(0, `rgb(${Math.round(lerp(255, 255, warmShift))},${Math.round(lerp(248, 250, warmShift))},${Math.round(lerp(192, 225, warmShift))})`);
      metal.addColorStop(0.2, `rgb(${Math.round(lerp(245, 255, warmShift))},${Math.round(lerp(216, 225, warmShift))},${Math.round(lerp(74, 50, warmShift))})`);
      metal.addColorStop(0.5, ACCENT_GOLD);
      metal.addColorStop(0.8, `rgb(${Math.round(lerp(232, 255, warmShift))},${Math.round(lerp(192, 180, warmShift))},${Math.round(lerp(80, 0, warmShift))})`);
      metal.addColorStop(1, "#a06800");
      ctx!.beginPath();
      ctx!.arc(CX, CY, r, 0, 2 * Math.PI);
      ctx!.fillStyle = metal;
      ctx!.fill();

      const rim = ctx!.createRadialGradient(CX, CY, r * 0.6, CX, CY, r);
      rim.addColorStop(0, "rgba(0,0,0,0)");
      rim.addColorStop(1, `rgba(60,30,0,${0.5 - brightenT * 0.3})`);
      ctx!.beginPath();
      ctx!.arc(CX, CY, r, 0, 2 * Math.PI);
      ctx!.fillStyle = rim;
      ctx!.fill();

      const blob = ctx!.createRadialGradient(
        CX - r * 0.3, CY - r * 0.3, 0,
        CX - r * 0.3, CY - r * 0.3, r * 0.7,
      );
      blob.addColorStop(0, `rgba(255,255,220,${0.9 + brightenT * 0.1})`);
      blob.addColorStop(1, "rgba(255,255,255,0)");
      ctx!.beginPath();
      ctx!.arc(CX, CY, r, 0, 2 * Math.PI);
      ctx!.fillStyle = blob;
      ctx!.fill();

      ctx!.restore();
    }

    /* ═══════════════════════════════════════════════════════════
       STAGE 3: SOLAR SYSTEM — The Sun
    ════════════════════════════════════════════════════════════ */
    function drawSun(x: number, y: number, r: number, morphT: number) {
      ctx!.save();

      const pulse = 1 + Math.sin(elapsed * 0.04) * 0.02;
      const drawR = r * pulse;

      // Outer corona glow (multiple layers for richness)
      if (morphT > 0.4) {
        const coronaAlpha = (morphT - 0.4) * 1.6;
        
        // Outermost soft glow
        const outerGlow = ctx!.createRadialGradient(x, y, drawR * 0.5, x, y, drawR * 3);
        outerGlow.addColorStop(0, `rgba(255, 200, 50, ${coronaAlpha * 0.15})`);
        outerGlow.addColorStop(0.5, `rgba(255, 140, 0, ${coronaAlpha * 0.06})`);
        outerGlow.addColorStop(1, "rgba(255, 100, 0, 0)");
        ctx!.beginPath();
        ctx!.arc(x, y, drawR * 3, 0, 2 * Math.PI);
        ctx!.fillStyle = outerGlow;
        ctx!.fill();
        
        // Inner hot glow
        const innerGlow = ctx!.createRadialGradient(x, y, drawR * 0.8, x, y, drawR * 1.8);
        innerGlow.addColorStop(0, `rgba(255, 220, 100, ${coronaAlpha * 0.2})`);
        innerGlow.addColorStop(1, "rgba(255, 160, 0, 0)");
        ctx!.beginPath();
        ctx!.arc(x, y, drawR * 1.8, 0, 2 * Math.PI);
        ctx!.fillStyle = innerGlow;
        ctx!.fill();
      }

      // Sun surface
      ctx!.shadowColor = "#FF8C00";
      ctx!.shadowBlur = 30 + morphT * 30;

      const sunGrad = ctx!.createRadialGradient(
        x - drawR * 0.25, y - drawR * 0.25, 0,
        x, y, drawR,
      );
      sunGrad.addColorStop(0, "#FFFCE8");
      sunGrad.addColorStop(0.2, "#FFE082");
      sunGrad.addColorStop(0.5, "#FFB300");
      sunGrad.addColorStop(0.75, "#FF8C00");
      sunGrad.addColorStop(1, "#E65100");

      ctx!.beginPath();
      ctx!.arc(x, y, drawR, 0, 2 * Math.PI);
      ctx!.fillStyle = sunGrad;
      ctx!.fill();

      // Solar surface texture (subtle radial bands)
      ctx!.shadowBlur = 0;
      ctx!.shadowColor = "transparent";
      if (morphT > 0.6) {
        const texAlpha = (morphT - 0.6) * 2.5;
        for (let i = 0; i < 3; i++) {
          const bandR = drawR * (0.4 + i * 0.2);
          ctx!.beginPath();
          ctx!.arc(x, y, bandR, 0, 2 * Math.PI);
          ctx!.strokeStyle = `rgba(200, 100, 0, ${texAlpha * 0.08})`;
          ctx!.lineWidth = 2;
          ctx!.stroke();
        }
      }

      // Corona spikes (subtle, elegant)
      if (morphT > 0.6) {
        const spikeAlpha = (morphT - 0.6) * 2.5;
        ctx!.save();
        ctx!.translate(x, y);
        ctx!.rotate(elapsed * 0.001);
        const spikeCount = 16;
        for (let i = 0; i < spikeCount; i++) {
          ctx!.rotate((Math.PI * 2) / spikeCount);
          const spikeLen = drawR * (1.15 + Math.sin(elapsed * 0.03 + i * 0.7) * 0.08);
          ctx!.beginPath();
          ctx!.moveTo(0, -drawR * 0.92);
          ctx!.lineTo(1.5, -spikeLen);
          ctx!.lineTo(-1.5, -spikeLen);
          ctx!.closePath();
          ctx!.fillStyle = `rgba(255, 220, 80, ${spikeAlpha * 0.35})`;
          ctx!.fill();
        }
        ctx!.restore();
      }

      // Specular highlight
      ctx!.beginPath();
      const hlGrad = ctx!.createRadialGradient(
        x - drawR * 0.3, y - drawR * 0.3, 0,
        x - drawR * 0.3, y - drawR * 0.3, drawR * 0.35,
      );
      hlGrad.addColorStop(0, "rgba(255,255,255,0.7)");
      hlGrad.addColorStop(1, "rgba(255,255,255,0)");
      ctx!.arc(x - drawR * 0.25, y - drawR * 0.25, drawR * 0.35, 0, 2 * Math.PI);
      ctx!.fillStyle = hlGrad;
      ctx!.fill();

      ctx!.restore();
    }

    /* ═══════════════════════════════════════════════════════════
       STAGE 3: SOLAR SYSTEM — Planet orbit rings
    ════════════════════════════════════════════════════════════ */
    function drawPlanetOrbitRing(sunX: number, sunY: number, planetX: number, orbitAlpha: number) {
      if (orbitAlpha < 0.01) return;
      ctx!.save();
      const orbitRadius = Math.abs(planetX - sunX);
      ctx!.beginPath();
      ctx!.arc(sunX, sunY, orbitRadius, 0, 2 * Math.PI);
      ctx!.strokeStyle = `rgba(255, 255, 255, ${orbitAlpha * 0.08})`;
      ctx!.lineWidth = 0.8;
      ctx!.setLineDash([4, 8]);
      ctx!.stroke();
      ctx!.setLineDash([]);
      ctx!.restore();
    }

    /* ═══════════════════════════════════════════════════════════
       STAGE 3: SOLAR SYSTEM — Planets
    ════════════════════════════════════════════════════════════ */
    function drawPlanet(
      x: number,
      y: number,
      r: number,
      baseColor: string,
      accent: string,
      alpha: number,
      hasRing: boolean = false,
      glowColor: string = "rgba(100,100,100,0.3)",
    ) {
      ctx!.save();
      ctx!.globalAlpha = alpha;

      // Atmospheric glow
      const atmoGlow = ctx!.createRadialGradient(x, y, r * 0.8, x, y, r * 1.6);
      atmoGlow.addColorStop(0, glowColor);
      atmoGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx!.beginPath();
      ctx!.arc(x, y, r * 1.6, 0, 2 * Math.PI);
      ctx!.fillStyle = atmoGlow;
      ctx!.fill();

      // Planet shadow (soft)
      ctx!.shadowColor = "rgba(0,0,0,0.4)";
      ctx!.shadowBlur = 12;
      ctx!.shadowOffsetY = 4;

      // Base Planet Color
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, 2 * Math.PI);
      ctx!.fillStyle = baseColor;
      ctx!.fill();

      // 3D Spherical Shading
      ctx!.shadowColor = "transparent";
      ctx!.shadowBlur = 0;
      const shade = ctx!.createRadialGradient(
        x - r * 0.35, y - r * 0.35, 0,
        x + r * 0.1, y + r * 0.1, r,
      );
      shade.addColorStop(0, `rgba(255,255,255,0.3)`);
      shade.addColorStop(0.3, "rgba(255,255,255,0.08)");
      shade.addColorStop(0.7, "rgba(0,0,0,0.15)");
      shade.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, 2 * Math.PI);
      ctx!.fillStyle = shade;
      ctx!.fill();

      // Accent band (subtle color variation across the surface)
      ctx!.save();
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, 2 * Math.PI);
      ctx!.clip();
      const bandGrad = ctx!.createLinearGradient(x - r, y - r * 0.3, x + r, y + r * 0.3);
      bandGrad.addColorStop(0, "transparent");
      bandGrad.addColorStop(0.4, `${accent}33`);
      bandGrad.addColorStop(0.6, `${accent}33`);
      bandGrad.addColorStop(1, "transparent");
      ctx!.fillStyle = bandGrad;
      ctx!.fillRect(x - r, y - r, r * 2, r * 2);
      ctx!.restore();

      // Ring for Jupiter-like planet
      if (hasRing) {
        ctx!.save();
        ctx!.translate(x, y);
        ctx!.rotate(-Math.PI / 7);
        
        // Outer ring
        ctx!.beginPath();
        ctx!.ellipse(0, 0, r * 1.8, r * 0.3, 0, 0, 2 * Math.PI);
        const ringGrad = ctx!.createLinearGradient(-r * 1.8, 0, r * 1.8, 0);
        ringGrad.addColorStop(0, `rgba(232, 200, 160, ${alpha * 0.15})`);
        ringGrad.addColorStop(0.3, `rgba(232, 180, 140, ${alpha * 0.6})`);
        ringGrad.addColorStop(0.5, `rgba(255, 220, 180, ${alpha * 0.75})`);
        ringGrad.addColorStop(0.7, `rgba(232, 180, 140, ${alpha * 0.6})`);
        ringGrad.addColorStop(1, `rgba(232, 200, 160, ${alpha * 0.15})`);
        ctx!.strokeStyle = ringGrad;
        ctx!.lineWidth = 3.5;
        ctx!.stroke();

        // Inner ring
        ctx!.beginPath();
        ctx!.ellipse(0, 0, r * 1.5, r * 0.22, 0, 0, 2 * Math.PI);
        ctx!.strokeStyle = `rgba(255, 220, 180, ${alpha * 0.35})`;
        ctx!.lineWidth = 1.5;
        ctx!.stroke();
        ctx!.restore();
      }

      // Small specular highlight
      const specGrad = ctx!.createRadialGradient(
        x - r * 0.3, y - r * 0.35, 0,
        x - r * 0.3, y - r * 0.35, r * 0.3,
      );
      specGrad.addColorStop(0, "rgba(255,255,255,0.6)");
      specGrad.addColorStop(1, "rgba(255,255,255,0)");
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, 2 * Math.PI);
      ctx!.fillStyle = specGrad;
      ctx!.fill();

      ctx!.restore();
    }

    /* ═══════════════════════════════════════════════════════════
       TWINKLING BACKGROUND STARS
    ════════════════════════════════════════════════════════════ */
    function drawBackgroundStars(alpha: number) {
      if (alpha < 0.01) return;
      ctx!.save();
      BACKGROUND_STARS.forEach((star) => {
        const twinkle = Math.sin(elapsed * star.speed + star.phase) * 0.4 + 0.6;
        const starAlpha = alpha * twinkle * 0.3;
        ctx!.fillStyle = `${star.color}${starAlpha})`;
        ctx!.beginPath();
        ctx!.arc(star.x, star.y, star.size, 0, 2 * Math.PI);
        ctx!.fill();
      });
      ctx!.restore();
    }

    /* ═══════════════════════════════════════════════════════════
       TRANSITION: Electron-to-Planet crossfade with color morph
    ════════════════════════════════════════════════════════════ */
    function drawMorphingNode(
      atomX: number, atomY: number,
      planetX: number, planetY: number,
      planetR: number, baseColor: string, accent: string,
      morphT: number, hasRing: boolean, glowColor: string,
      trailLength: number, trailAngle: number,
    ) {
      // Calculate interpolated position
      const x = lerp(atomX, planetX, morphT);
      const y = lerp(atomY, planetY, morphT);
      const r = lerp(14, planetR, morphT);

      // Phase 1 (0-0.3): Electron with growing trail, gaining color tint
      if (morphT < 0.35) {
        const subT = morphT / 0.35;
        // Draw electron with color tinting
        const electronAlpha = 1 - subT * 0.5;
        drawElectron(x, y, electronAlpha, trailLength * subT, trailAngle);
        
        // Overlay planet color hint
        if (subT > 0.15) {
          const hintAlpha = (subT - 0.15) * 0.5;
          ctx!.save();
          ctx!.globalAlpha = hintAlpha;
          ctx!.beginPath();
          ctx!.arc(x, y, r * 0.9, 0, 2 * Math.PI);
          ctx!.fillStyle = baseColor;
          ctx!.fill();
          ctx!.restore();
        }
      }
      // Phase 2 (0.3-0.65): Crossfade — electron fading, planet emerging
      else if (morphT < 0.65) {
        const subT = (morphT - 0.35) / 0.3;
        const electronAlpha = Math.max(0, 1 - subT * 2);
        const planetAlpha = easeOutQuart(subT);
        
        if (electronAlpha > 0.01) {
          drawElectron(x, y, electronAlpha, trailLength * 0.5, trailAngle);
        }
        drawPlanet(x, y, r, baseColor, accent, planetAlpha, hasRing, glowColor);
      }
      // Phase 3 (0.65-1.0): Full planet, settling into position
      else {
        const settleT = easeOutQuart((morphT - 0.65) / 0.35);
        drawPlanet(x, y, r, baseColor, accent, 0.7 + settleT * 0.3, hasRing, glowColor);
      }
    }

    /* ═══════════════════════════════════════════════════════════
       FRAME LOOP
    ════════════════════════════════════════════════════════════ */
    function frame(timestamp: number) {
      if (!ctx || !canvas || !container) return;
      
      // Throttle to ~60fps for performance
      if (lastTime && timestamp - lastTime < 14) {
        animationId = requestAnimationFrame(frame);
        return;
      }
      lastTime = timestamp;
      
      const p = clamp01(progressRef?.current ?? 0);
      const eased = easeInOutQuart(p);
      const settle = easeInOutQuart(clamp01((p - 0.56) / 0.44));
      const sep = clamp01(nucleusSeparationRef?.current ?? 0);

      // 3D Container Spin (Hero -> Clubs)
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
      const abP = clamp01(aboutProgressRef?.current ?? 0);

      /* ── STAGED MORPH TIMING ──
         Stage 1 (abP 0.00-0.15): Electron trails stretch, orbits start widening
         Stage 2 (abP 0.15-0.50): Nucleus brightens, electrons gain colors, orbits dissolve
         Stage 3 (abP 0.50-1.00): Full solar system formation
      */
      const morphT = easeOutExpo(clamp01((abP - 0.05) / 0.85));
      const trailT = easeInOutCubic(clamp01(abP / 0.25)); // Trail stretching (early)
      const brightenT = easeInOutCubic(clamp01((abP - 0.05) / 0.4)); // Nucleus brightening

      if (sep > 0.001) {
        ctx.save();
        ctx.globalAlpha = orbitFade;
        ctx.translate(orbitShiftX, 0);
      }

      // 1. Orbits: widen during transition, then fade
      const orbitAlphaAbout = 1 - easeInOutQuart(clamp01((abP - 0.1) / 0.35));
      if (orbitAlphaAbout > 0.01) {
        orbits.forEach((o) =>
          drawOrbit(o.rx, o.ry, o.angleDeg, orbitFade * orbitAlphaAbout, morphT),
        );
      }

      if (sep > 0.001) ctx.restore();

      // 2. Background stars fade in during transition
      drawBackgroundStars(morphT);

      // 3. Nucleus → Sun transition
      if (morphT > 0.2) {
        // Morph into sun
        const sunMorphT = easeOutExpo(clamp01((morphT - 0.2) / 0.8));
        const sunX = lerp(CX, 90, sunMorphT);
        const sunY = lerp(CY, 110, sunMorphT);
        const sunR = lerp(34, 48, sunMorphT);
        drawSun(sunX, sunY, sunR, sunMorphT);
      } else {
        // Still atom nucleus, but brightening
        drawNucleus(brightenT);
      }

      // 4. Draw planet orbit rings (fade in late)
      if (morphT > 0.7) {
        const orbitRingAlpha = easeOutQuart((morphT - 0.7) / 0.3);
        const sunX = lerp(CX, 90, easeOutExpo(clamp01((morphT - 0.2) / 0.8)));
        const sunY = lerp(CY, 110, easeOutExpo(clamp01((morphT - 0.2) / 0.8)));
        PLANET_DEFS.forEach((planet) => {
          drawPlanetOrbitRing(sunX, sunY, planet.x, orbitRingAlpha);
        });
      }

      const newCoords: { x: number; y: number; slug: string; name: string }[] = [];

      if (sep > 0.001) {
        ctx.save();
        ctx.globalAlpha = orbitFade;
        ctx.translate(orbitShiftX, 0);
      }

      // 5. Draw Electrons / Morphing Nodes
      orbits.forEach((o, orbitIdx) => {
        o.offsets.forEach((off, idx) => {
          const movingTheta = off + elapsed * o.speed;
          let theta = movingTheta;

          if (p > 0.001 && abP < 0.15) {
            const target = idx === 0 ? 0 : Math.PI;
            theta = movingTheta + shortestAngle(movingTheta, target) * settle;
          }

          const pos = getPos(o.rx, o.ry, o.angleDeg, theta, morphT < 0.3 ? morphT : 0);
          const drawX = pos.x;
          const drawY = pos.y;

          const planetIdx = orbitIdx * 2 + idx;
          const planetDef = PLANET_DEFS[planetIdx];

          if (morphT > 0.01) {
            // Calculate trail angle from current movement direction
            const trailAngle = Math.atan2(planetDef.y - drawY, planetDef.x - drawX) + Math.PI;
            const trailLength = 40 * trailT;
            
            drawMorphingNode(
              drawX, drawY,
              planetDef.x, planetDef.y,
              planetDef.r, planetDef.baseColor, planetDef.accent,
              morphT, planetDef.hasRing, planetDef.glowColor,
              trailLength, trailAngle,
            );
          } else {
            // Normal Atom Mode
            const map = CLUB_MAPPING.find(
              (m) => m.orbitIdx === orbitIdx && m.electronIdx === idx,
            );
            const isHovered = map && map.slug === hoveredSlugRef.current;
            if (isHovered && sep < 0.01) {
              ctx.save();
              ctx.beginPath();
              ctx.arc(
                drawX, drawY,
                22 + Math.sin(elapsed * 0.15) * 3,
                0, 2 * Math.PI,
              );
              ctx.fillStyle = "rgba(2, 59, 142, 0.2)";
              ctx.fill();
              ctx.restore();
            }
            drawElectron(drawX, drawY);
          }

          const map = CLUB_MAPPING.find(
            (m) => m.orbitIdx === orbitIdx && m.electronIdx === idx,
          );
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

      // Tooltip Logic (only in atom mode, not during morph)
      if (hoveredSlugRef.current && morphT < 0.1) {
        let text = "";
        let tx = CX;
        let ty = CY;
        if (hoveredSlugRef.current === "executive-team") {
          text = "Executive Team";
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
          ctx.font = "bold 12px 'Inter', sans-serif";
          const textWidth = ctx.measureText(text).width;
          const padX = 12;
          const rectW = textWidth + padX * 2;
          const rectH = 26;
          const rectX = tx - rectW / 2;
          const rectY = ty - 45;

          ctx.shadowColor = "rgba(0, 10, 40, 0.2)";
          ctx.shadowBlur = 12;
          ctx.shadowOffsetY = 4;
          ctx.fillStyle =
            hoveredSlugRef.current === "executive-team" ? "#D4A373" : "#011f5b";

          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(rectX, rectY, rectW, rectH, 8);
          } else {
            ctx.rect(rectX, rectY, rectW, rectH);
          }
          ctx.fill();

          ctx.shadowColor = "transparent";
          ctx.beginPath();
          ctx.moveTo(tx - 6, rectY + rectH);
          ctx.lineTo(tx + 6, rectY + rectH);
          ctx.lineTo(tx, rectY + rectH + 6);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle =
            hoveredSlugRef.current === "executive-team" ? "#011f5b" : "#ffffff";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(text, tx, rectY + rectH / 2 + 1);
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
      const x = ((e.clientX - rect.left) / rect.width) * CANVAS_SIZE;
      const y = ((e.clientY - rect.top) / rect.height) * CANVAS_SIZE;

      let hoveredSlug: string | null = null;
      const ndist = Math.sqrt((x - CX) ** 2 + (y - CY) ** 2);

      if (ndist < 40) {
        hoveredSlug = "executive-team";
      } else {
        for (const ec of electronCoordsRef.current) {
          if (Math.sqrt((x - ec.x) ** 2 + (y - ec.y) ** 2) < 30) {
            hoveredSlug = ec.slug;
            break;
          }
        }
      }

      if (hoveredSlug !== hoveredSlugRef.current) {
        hoveredSlugRef.current = hoveredSlug;
        if (onElectronHover) onElectronHover(hoveredSlug);
      }
      canvasEl.style.cursor = hoveredSlug ? "pointer" : "default";
    };

    const handleClick = (e: MouseEvent) => {
      const canvasEl = canvasRef.current;
      if (!canvasEl) return;
      const rect = canvasEl.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * CANVAS_SIZE;
      const y = ((e.clientY - rect.top) / rect.height) * CANVAS_SIZE;

      let clickedSlug: string | null = null;
      const ndist = Math.sqrt((x - CX) ** 2 + (y - CY) ** 2);

      if (ndist < 40) {
        clickedSlug = "executive-team";
      } else {
        for (const ec of electronCoordsRef.current) {
          if (Math.sqrt((x - ec.x) ** 2 + (y - ec.y) ** 2) < 30) {
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
    aboutProgressRef,
    activeAboutNodeRef,
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
