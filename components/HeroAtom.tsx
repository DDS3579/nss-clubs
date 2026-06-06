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

// Updated to point to the new vertical Solar System layout
export const TIMELINE_NODES = [
  { label: "Our Origin", targetX: 240, targetY: 120 }, // Points to Planet 2
  { label: "Our Vision", targetX: 320, targetY: 120 }, // Points to the Sun (Centerpiece)
  { label: "The Legacy", targetX: 400, targetY: 120 }, // Points to Planet 3
];

export const MINOR_NODES = [
  { targetX: CX + 64, targetY: CY - 198 },
  { targetX: CX - 182, targetY: CY - 8 },
  { targetX: CX + 156, targetY: CY + 116 },
];

const BACKGROUND_STARS = Array.from({ length: 22 }, (_, i) => ({
  x: Math.random() * CANVAS_SIZE,
  y: Math.random() * CANVAS_SIZE,
  size: Math.random() * 1.5 + 0.6,
  speed: Math.random() * 0.02 + 0.01,
  phase: Math.random() * Math.PI * 2,
  color: i % 2 === 0 ? "rgba(255, 248, 192, " : "rgba(0, 180, 255, ",
}));

// 🎬 Premium Easing Functions
function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}
function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}
function easeInOutQuart(t: number) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
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

    const DPR = 3; // Crisp rendering
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
      ctx!.strokeStyle = PRIMARY_BLUE;
      ctx!.lineWidth = 1.2;
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

    function drawElectron(x: number, y: number, alpha = 1) {
      const r = 14;
      ctx!.save();
      ctx!.globalAlpha = alpha;

      // Shadow
      const shadow = ctx!.createRadialGradient(
        x + 1.5,
        y + 2,
        0,
        x + 1.5,
        y + 2,
        r * 1.5,
      );
      shadow.addColorStop(0, "rgba(0,10,40,0.4)");
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
      metal.addColorStop(0.3, "rgba(190,220,255,0.6)");
      metal.addColorStop(0.7, "rgba(10,50,140,0.2)");
      metal.addColorStop(1, "rgba(180,210,255,0.1)");
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, 2 * Math.PI);
      ctx!.fillStyle = metal;
      ctx!.fill();

      // Highlight
      const hl = ctx!.createRadialGradient(
        x - r * 0.4,
        y - r * 0.4,
        0,
        x - r * 0.4,
        y - r * 0.4,
        r * 0.6,
      );
      hl.addColorStop(0, "rgba(255,255,255,0.9)");
      hl.addColorStop(1, "rgba(255,255,255,0)");
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, 2 * Math.PI);
      ctx!.fillStyle = hl;
      ctx!.fill();

      ctx!.restore();
    }

    function drawNucleus(glowIntensity: number) {
      const r = 34;
      ctx!.save();

      // Dynamic Glow based on constellation formation
      if (glowIntensity > 0.01) {
        ctx!.shadowColor = ACCENT_GOLD;
        ctx!.shadowBlur = 34 * glowIntensity;
      }

      ctx!.beginPath();
      ctx!.arc(CX, CY, r, 0, 2 * Math.PI);
      ctx!.fillStyle = "#7a5000";
      ctx!.fill();

      const metal = ctx!.createLinearGradient(CX - r, CY - r, CX + r, CY + r);
      metal.addColorStop(0, PALE_GOLD);
      metal.addColorStop(0.2, "#f5d84a");
      metal.addColorStop(0.5, ACCENT_GOLD);
      metal.addColorStop(0.8, "#e8c050");
      metal.addColorStop(1, "#a06800");
      ctx!.beginPath();
      ctx!.arc(CX, CY, r, 0, 2 * Math.PI);
      ctx!.fillStyle = metal;
      ctx!.fill();

      const rim = ctx!.createRadialGradient(CX, CY, r * 0.6, CX, CY, r);
      rim.addColorStop(0, "rgba(0,0,0,0)");
      rim.addColorStop(1, "rgba(60,30,0,0.5)");
      ctx!.beginPath();
      ctx!.arc(CX, CY, r, 0, 2 * Math.PI);
      ctx!.fillStyle = rim;
      ctx!.fill();

      const blob = ctx!.createRadialGradient(
        CX - r * 0.3,
        CY - r * 0.3,
        0,
        CX - r * 0.3,
        CY - r * 0.3,
        r * 0.7,
      );
      blob.addColorStop(0, "rgba(255,255,220,0.9)");
      blob.addColorStop(1, "rgba(255,255,255,0)");
      ctx!.beginPath();
      ctx!.arc(CX, CY, r, 0, 2 * Math.PI);
      ctx!.fillStyle = blob;
      ctx!.fill();

      ctx!.restore();
    }

    /* ═══════════════════════════════════════════════════════════
       THE SUN (Morphed Nucleus)
    ════════════════════════════════════════════════════════════ */
    function drawSun(x: number, y: number, r: number, morphT: number) {
      ctx!.save();

      // Subtle pulsing effect
      const pulse = 1 + Math.sin(elapsed * 0.05) * 0.03;
      const drawR = r * pulse;

      // Massive Solar Glow
      ctx!.shadowColor = "#FF8C00";
      ctx!.shadowBlur = 60 + morphT * 40;

      // Sun Gradient
      const sunGrad = ctx!.createRadialGradient(
        x - drawR * 0.3,
        y - drawR * 0.3,
        0,
        x,
        y,
        drawR,
      );
      sunGrad.addColorStop(0, "#FFF5E1");
      sunGrad.addColorStop(0.3, "#FFD700");
      sunGrad.addColorStop(0.7, "#FF8C00");
      sunGrad.addColorStop(1, "#D35400");

      ctx!.beginPath();
      ctx!.arc(x, y, drawR, 0, 2 * Math.PI);
      ctx!.fillStyle = sunGrad;
      ctx!.fill();

      // Solar Corona Spikes
      if (morphT > 0.5) {
        const spikeAlpha = (morphT - 0.5) * 2;
        ctx!.save();
        ctx!.translate(x, y);
        ctx!.rotate(elapsed * 0.002);
        for (let i = 0; i < 12; i++) {
          ctx!.rotate(Math.PI / 6);
          ctx!.beginPath();
          ctx!.moveTo(0, -drawR * 0.9);
          ctx!.lineTo(4, -drawR * 1.4);
          ctx!.lineTo(-4, -drawR * 1.4);
          ctx!.closePath();
          ctx!.fillStyle = `rgba(255, 200, 50, ${spikeAlpha * 0.6})`;
          ctx!.fill();
        }
        ctx!.restore();
      }

      // Specular Highlight
      ctx!.shadowBlur = 0;
      ctx!.beginPath();
      ctx!.arc(x - drawR * 0.3, y - drawR * 0.3, drawR * 0.25, 0, 2 * Math.PI);
      ctx!.fillStyle = "rgba(255,255,255,0.8)";
      ctx!.fill();

      ctx!.restore();
    }

    /* ═══════════════════════════════════════════════════════════
       THE PLANETS (Morphed Electrons)
    ════════════════════════════════════════════════════════════ */
    function drawPlanet(
      x: number,
      y: number,
      r: number,
      color: string,
      alpha: number,
      hasRing: boolean = false,
    ) {
      ctx!.save();
      ctx!.globalAlpha = alpha;

      // Deep space shadow
      ctx!.shadowColor = "rgba(0,0,0,0.6)";
      ctx!.shadowBlur = 20;
      ctx!.shadowOffsetY = 8;

      // Base Planet Color
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, 2 * Math.PI);
      ctx!.fillStyle = color;
      ctx!.fill();

      // 3D Spherical Shading
      ctx!.shadowColor = "transparent";
      const shade = ctx!.createRadialGradient(
        x - r * 0.4,
        y - r * 0.4,
        0,
        x,
        y,
        r,
      );
      shade.addColorStop(0, "rgba(255,255,255,0.35)");
      shade.addColorStop(0.4, "rgba(255,255,255,0.05)");
      shade.addColorStop(1, "rgba(0,0,0,0.65)");
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, 2 * Math.PI);
      ctx!.fillStyle = shade;
      ctx!.fill();

      // Saturn-like Ring for Jupiter
      if (hasRing) {
        ctx!.save();
        ctx!.translate(x, y);
        ctx!.rotate(-Math.PI / 8);
        ctx!.beginPath();
        ctx!.ellipse(0, 0, r * 1.7, r * 0.35, 0, 0, 2 * Math.PI);
        ctx!.strokeStyle = `rgba(232, 168, 124, ${alpha * 0.8})`;
        ctx!.lineWidth = 3;
        ctx!.stroke();

        ctx!.beginPath();
        ctx!.ellipse(0, 0, r * 1.4, r * 0.25, 0, 0, 2 * Math.PI);
        ctx!.strokeStyle = `rgba(255, 220, 180, ${alpha * 0.5})`;
        ctx!.lineWidth = 1.5;
        ctx!.stroke();
        ctx!.restore();
      }

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
        const starAlpha =
          alpha * twinkle * (star.color.includes("0, 180") ? 0.18 : 0.34);
        ctx!.fillStyle = `${star.color}${starAlpha})`;
        ctx!.beginPath();
        ctx!.arc(star.x, star.y, star.size, 0, 2 * Math.PI);
        ctx!.fill();
      });
      ctx!.restore();
    }

    /* ═══════════════════════════════════════════════════════════
       STAR SPIKES / LENS FLARE (Active Nodes)
    ════════════════════════════════════════════════════════════ */
    function drawStarSpikes(x: number, y: number, r: number, alpha: number) {
      ctx!.save();
      ctx!.strokeStyle = `rgba(255, 248, 192, ${alpha * 0.85})`;
      ctx!.lineWidth = 0.9;

      // Draw a vertical and horizontal cross
      ctx!.beginPath();
      ctx!.moveTo(x, y - r);
      ctx!.lineTo(x, y + r);
      ctx!.moveTo(x - r, y);
      ctx!.lineTo(x + r, y);
      ctx!.stroke();

      // Draw subtle diagonal glow lines
      ctx!.beginPath();
      ctx!.strokeStyle = `rgba(255, 248, 192, ${alpha * 0.45})`;
      ctx!.lineWidth = 0.55;
      ctx!.moveTo(x - r * 0.6, y - r * 0.6);
      ctx!.lineTo(x + r * 0.6, y + r * 0.6);
      ctx!.moveTo(x + r * 0.6, y - r * 0.6);
      ctx!.lineTo(x - r * 0.6, y + r * 0.6);
      ctx!.stroke();

      // Diamond glow backing
      ctx!.beginPath();
      ctx!.moveTo(x, y - r * 0.3);
      ctx!.lineTo(x + r * 0.3, y);
      ctx!.lineTo(x, y + r * 0.3);
      ctx!.lineTo(x - r * 0.3, y);
      ctx!.closePath();
      ctx!.fillStyle = `rgba(255, 248, 192, ${alpha * 0.12})`;
      ctx!.fill();

      ctx!.restore();
    }

    /* ═══════════════════════════════════════════════════════════
       PREMIUM CONSTELLATION NODE (The "Star")
    ════════════════════════════════════════════════════════════ */
    function drawConstellationNode(
      x: number,
      y: number,
      nodeIdx: number,
      morphProgress: number,
    ) {
      const activeIdx = activeAboutNodeRef?.current ?? -1;
      const isActive = activeIdx === nodeIdx && morphProgress > 0.8;
      const pulse = Math.sin(elapsed * 0.06) * 0.15 + 0.85; // Subtle breathing effect

      ctx!.save();

      // 1. Soft star glow
      const haloR = isActive ? 42 * pulse : 26;
      const halo = ctx!.createRadialGradient(x, y, 0, x, y, haloR);
      halo.addColorStop(
        0,
        isActive ? "rgba(212, 163, 115, 0.36)" : "rgba(212, 163, 115, 0.13)",
      );
      halo.addColorStop(
        0.5,
        isActive ? "rgba(2, 59, 142, 0.08)" : "rgba(2, 59, 142, 0.03)",
      );
      halo.addColorStop(1, "rgba(2, 59, 142, 0)");
      ctx!.fillStyle = halo;
      ctx!.beginPath();
      ctx!.arc(x, y, haloR, 0, 2 * Math.PI);
      ctx!.fill();

      // 2. Fine active ring
      if (isActive) {
        ctx!.save();
        ctx!.translate(x, y);
        ctx!.rotate(elapsed * 0.015);
        ctx!.beginPath();
        ctx!.arc(0, 0, 20, 0, 2 * Math.PI);
        ctx!.strokeStyle = "rgba(212, 163, 115, 0.42)";
        ctx!.lineWidth = 0.9;
        ctx!.setLineDash([3, 5]);
        ctx!.stroke();
        ctx!.setLineDash([]);
        ctx!.restore();
      }

      // 3. Star core
      const coreR = lerp(14, 8.5, morphProgress);
      ctx!.shadowColor = isActive ? PALE_GOLD : ACCENT_GOLD;
      ctx!.shadowBlur = isActive ? 18 : 8;

      ctx!.beginPath();
      ctx!.arc(x, y, coreR, 0, 2 * Math.PI);
      const coreGrad = ctx!.createRadialGradient(
        x - coreR * 0.3,
        y - coreR * 0.3,
        0,
        x,
        y,
        coreR,
      );
      coreGrad.addColorStop(0, "#ffffff");
      coreGrad.addColorStop(0.3, PALE_GOLD);
      coreGrad.addColorStop(0.68, ACCENT_GOLD);
      coreGrad.addColorStop(1, "#8a5e00");
      ctx!.fillStyle = coreGrad;
      ctx!.fill();

      // 4. Specular Highlight
      ctx!.shadowBlur = 0;
      ctx!.beginPath();
      ctx!.arc(x - coreR * 0.3, y - coreR * 0.3, coreR * 0.25, 0, 2 * Math.PI);
      ctx!.fillStyle = "rgba(255,255,255,0.95)";
      ctx!.fill();

      // 5. Active Star Spikes / Lens Flare
      if (isActive) {
        drawStarSpikes(x, y, 25 * pulse, pulse);
      }

      ctx!.restore();
    }

    /* ═══════════════════════════════════════════════════════════
       PREMIUM MINOR CONSTELLATION NODE (twinkling star)
    ════════════════════════════════════════════════════════════ */
    function drawMinorConstellationNode(
      x: number,
      y: number,
      nodeIdx: number,
      morphProgress: number,
    ) {
      const pulse = Math.sin(elapsed * 0.04 + nodeIdx) * 0.12 + 0.88;
      ctx!.save();

      // Outer soft halo
      const haloR = 15 * pulse;
      const halo = ctx!.createRadialGradient(x, y, 0, x, y, haloR);
      halo.addColorStop(0, "rgba(212, 163, 115, 0.2)");
      halo.addColorStop(0.52, "rgba(2, 59, 142, 0.04)");
      halo.addColorStop(1, "rgba(2, 59, 142, 0)");
      ctx!.fillStyle = halo;
      ctx!.beginPath();
      ctx!.arc(x, y, haloR, 0, 2 * Math.PI);
      ctx!.fill();

      // Small Core
      const coreR = lerp(14, 4.5, morphProgress);
      ctx!.shadowColor = ACCENT_GOLD;
      ctx!.shadowBlur = 5;
      ctx!.beginPath();
      ctx!.arc(x, y, coreR, 0, 2 * Math.PI);
      ctx!.fillStyle = PALE_GOLD;
      ctx!.fill();

      ctx!.restore();
    }

    /* ═══════════════════════════════════════════════════════════
       LIGHTWEIGHT CONSTELLATION LINES
    ════════════════════════════════════════════════════════════ */
    function drawConstellationLines(
      majors: { x: number; y: number }[],
      minors: { x: number; y: number }[],
      morphProgress: number,
    ) {
      if (morphProgress < 0.1) return;
      const lineAlpha = easeOutExpo(clamp01((morphProgress - 0.1) / 0.75));
      const activeIdx = activeAboutNodeRef?.current ?? -1;

      ctx!.save();
      ctx!.lineCap = "round";

      const path = [
        majors[0],
        minors[0],
        majors[1],
        minors[2],
        majors[2],
        minors[1],
      ];

      ctx!.beginPath();
      ctx!.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        const p1 = path[i - 1];
        const p2 = path[i];
        const drawX = lerp(p1.x, p2.x, lineAlpha);
        const drawY = lerp(p1.y, p2.y, lineAlpha);
        ctx!.lineTo(drawX, drawY);
      }
      ctx!.strokeStyle = `rgba(2, 59, 142, ${lineAlpha * 0.34})`;
      ctx!.lineWidth = 0.9;
      ctx!.shadowColor = "transparent";
      ctx!.stroke();

      // A tiny gold trace gives the line warmth without making it feel engineered.
      ctx!.beginPath();
      ctx!.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        const p1 = path[i - 1];
        const p2 = path[i];
        const drawX = lerp(p1.x, p2.x, lineAlpha);
        const drawY = lerp(p1.y, p2.y, lineAlpha);
        ctx!.lineTo(drawX, drawY);
      }
      ctx!.strokeStyle = `rgba(212, 163, 115, ${lineAlpha * 0.34})`;
      ctx!.lineWidth = 0.55;
      ctx!.stroke();

      if (activeIdx >= 0 && majors[activeIdx]) {
        const activeNode = majors[activeIdx];
        ctx!.beginPath();
        ctx!.moveTo(CX, CY);
        ctx!.lineTo(
          lerp(CX, activeNode.x, lineAlpha),
          lerp(CY, activeNode.y, lineAlpha),
        );
        ctx!.strokeStyle = `rgba(212, 163, 115, ${lineAlpha * 0.42})`;
        ctx!.lineWidth = 1;
        ctx!.stroke();
      }

      ctx!.restore();
    }

    /* ═══════════════════════════════════════════════════════════
       DYNAMIC NODE LABELS
    ════════════════════════════════════════════════════════════ */
    function drawNodeLabel(
      nodeIdx: number,
      x: number,
      y: number,
      alpha: number,
    ) {
      const node = TIMELINE_NODES[nodeIdx];
      const activeIdx = activeAboutNodeRef?.current ?? -1;
      const isActive = activeIdx === nodeIdx;

      ctx!.save();
      ctx!.globalAlpha = alpha;
      ctx!.font = `700 15px 'Space Grotesk', sans-serif`;
      ctx!.fillStyle = isActive ? ACCENT_GOLD : "rgba(2, 59, 142, 0.78)";

      const alignLeft = x < CX;
      ctx!.textAlign = alignLeft ? "left" : "right";
      ctx!.textBaseline = "middle";

      const labelX = x + (alignLeft ? 30 : -30);
      if (isActive) {
        ctx!.shadowColor = "rgba(212, 163, 115, 0.5)";
        ctx!.shadowBlur = 10;
      }
      ctx!.fillText(node.label, labelX, y);

      if (isActive) {
        const tw = ctx!.measureText(node.label).width;
        ctx!.beginPath();
        const startX = alignLeft ? labelX : labelX - tw;
        ctx!.moveTo(startX, y + 12);
        ctx!.lineTo(startX + tw, y + 12);
        ctx!.strokeStyle = ACCENT_GOLD;
        ctx!.lineWidth = 2;
        ctx!.shadowBlur = 4;
        ctx!.stroke();
      }
      ctx!.restore();
    }

    /* ═══════════════════════════════════════════════════════════
       FRAME LOOP
    ════════════════════════════════════════════════════════════ */
    function frame() {
      if (!ctx || !canvas || !container) return;
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

      // Cinematic Morph Timing: Starts at 10%, fully formed by 85%
      const morphT = easeOutExpo(clamp01((abP - 0.1) / 0.75));

      if (sep > 0.001) {
        ctx.save();
        ctx.globalAlpha = orbitFade;
        ctx.translate(orbitShiftX, 0);
      }

      // 1. Orbits elegantly fade out as solar system forms
      const orbitAlphaAbout = 1 - easeInOutQuart(clamp01((abP - 0.05) / 0.3));
      if (orbitAlphaAbout > 0.01) {
        orbits.forEach((o) =>
          drawOrbit(o.rx, o.ry, o.angleDeg, orbitFade * orbitAlphaAbout),
        );
      }

      if (sep > 0.001) ctx.restore();

      // 2. Nucleus -> Sun Morphing (Horizontal Centerpiece)
      if (morphT > 0.01) {
        const sunX = lerp(CX, 320, morphT); // Stays centered horizontally
        const sunY = lerp(CY, 120, morphT); // Moves to the top
        const sunR = lerp(34, 55, morphT); // Enlarges slightly less to fit horizontally
        drawSun(sunX, sunY, sunR, morphT);
      } else {
        drawNucleus(0);
      }

      // 2b. Twinkling background stars
      drawBackgroundStars(morphT);

      const newCoords: { x: number; y: number; slug: string; name: string }[] =
        [];

      if (sep > 0.001) {
        ctx.save();
        ctx.globalAlpha = orbitFade;
        ctx.translate(orbitShiftX, 0);
      }

      // 3. Draw Electrons / Morphing Nodes
      orbits.forEach((o, orbitIdx) => {
        o.offsets.forEach((off, idx) => {
          const movingTheta = off + elapsed * o.speed;
          let theta = movingTheta;

          if (p > 0.001 && abP < 0.15) {
            const target = idx === 0 ? 0 : Math.PI;
            theta = movingTheta + shortestAngle(movingTheta, target) * settle;
          }

          const pos = getPos(o.rx, o.ry, o.angleDeg, theta);
          let drawX = pos.x;
          let drawY = pos.y;

          // Map to Horizontal Planet Targets (Fanning out from the center Sun)
          const planetIdx = orbitIdx * 2 + idx;
          const planetTargets = [
            { x: 80, y: 120, r: 20, color: "#E27D60", hasRing: false }, // Far Left
            { x: 170, y: 120, r: 24, color: "#41B3A3", hasRing: false }, // Mid Left
            { x: 240, y: 120, r: 28, color: "#8E44AD", hasRing: false }, // Inner Left (Origin)
            { x: 400, y: 120, r: 22, color: "#C38D9E", hasRing: false }, // Inner Right (Legacy)
            { x: 490, y: 120, r: 34, color: "#E8A87C", hasRing: true }, // Mid Right (Jupiter)
            { x: 580, y: 120, r: 18, color: "#3498DB", hasRing: false }, // Far Right
          ];
          const target = planetTargets[planetIdx];

          if (morphT > 0.01) {
            // Morph into Solar System
            drawX = lerp(pos.x, target.x, morphT);
            drawY = lerp(pos.y, target.y, morphT);
            const drawR = lerp(14, target.r, morphT);

            // Crossfade: Electron fades out, Planet fades in
            if (morphT < 0.5) {
              drawElectron(drawX, drawY, 1 - morphT * 2);
            }
            if (morphT > 0.3) {
              const planetAlpha = clamp01((morphT - 0.3) / 0.4);
              drawPlanet(
                drawX,
                drawY,
                drawR,
                target.color,
                planetAlpha,
                target.hasRing,
              );
            }
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

      // Tooltip Logic
      if (hoveredSlugRef.current) {
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
