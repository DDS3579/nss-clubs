"use client";

import React, { useRef, useEffect } from "react";

interface HeroAtomProps {
  /**
   * Mutable ref containing transition progress (0→1).
   * 0 = normal orbiting electrons.
   * 0→1 = spins 360°, electrons settle to stationary.
   * 1 = fully settled.
   */
  progressRef?: React.MutableRefObject<number>;
  /** Global rotation offset in radians. Applied uniformly to all orbits. */
  rotationOffsetRef?: React.MutableRefObject<number>;
  /**
   * Nucleus separation progress (0→1).
   * 0 = normal atom. 1 = orbits/electrons have slid away, nucleus isolated.
   */
  nucleusSeparationRef?: React.MutableRefObject<number>;
  /** About section transition progress (0→1). Drives the orbit→timeline morph. */
  aboutProgressRef?: React.MutableRefObject<number>;
  /** Which timeline node is active (0, 1, 2). -1 = none. */
  activeAboutNodeRef?: React.MutableRefObject<number>;
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

/** The 3 timeline nodes that electrons merge into during the About morph. */
export const TIMELINE_NODES = [
  { label: "Our Origin", targetY: CY - 180 },
  { label: "Our Vision", targetY: CY },
  { label: "The Legacy", targetY: CY + 180 },
];

// 🧬 DNA HELIX CONSTANTS — Full 640px canvas
const DNA_AMP = 60; // Half-width of each strand's swing (px)
const DNA_TOP_Y = 28; // Y of top of helix
const DNA_BOT_Y = 612; // Y of bottom of helix
const DNA_TURNS = 2.5; // Number of full helix rotations
const DNA_STEPS = 220; // Sample count (smoothness)

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

    // High-DPI canvas for crisp rendering at zoom levels
    const DPR = 3;
    canvas.width = CANVAS_SIZE * DPR;
    canvas.height = CANVAS_SIZE * DPR;
    canvas.style.width = `${CANVAS_SIZE}px`;
    canvas.style.height = `${CANVAS_SIZE}px`;
    ctx.scale(DPR, DPR);

    let animationId: number;
    let elapsed = 0;

    /* ═══════════════════════════════════════════════════════════
       DRAW: Orbit
       Simple elliptical orbit with no morphing logic.
       ═══════════════════════════════════════════════════════════ */
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

    /* ═══════════════════════════════════════════════════════════
       DRAW helpers: getPos, drawElectron, drawNucleus
       ═══════════════════════════════════════════════════════════ */
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

      // Shadow
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

      // Base blue
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, 2 * Math.PI);
      ctx!.fillStyle = "#011f5b";
      ctx!.fill();

      // Metallic sheen
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

      // Highlight
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

      // Speck
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

    /* ═══════════════════════════════════════════════════════════
       DRAW: Timeline Node (Premium Metallic Sphere)
       morphProgress 0→1 interpolates size from electron (r=14) to node (r=20).
       ═══════════════════════════════════════════════════════════ */
    function drawTimelineNode(
      x: number,
      y: number,
      nodeIdx: number,
      morphProgress: number,
    ) {
      const r = lerp(14, 20, morphProgress);
      const activeIdx = activeAboutNodeRef?.current ?? -1;
      const isActive = activeIdx === nodeIdx && morphProgress > 0.7;

      // ── Active node: golden glow + pulsing halo + horizontal beam ──
      if (isActive) {
        const pulseR = 26 + Math.sin(elapsed * 0.06) * 5;

        // Radial glow
        ctx!.save();
        ctx!.globalAlpha = 0.55;
        const glow = ctx!.createRadialGradient(x, y, 0, x, y, pulseR);
        glow.addColorStop(0, "rgba(212, 163, 115, 0.55)");
        glow.addColorStop(0.45, "rgba(212, 163, 115, 0.15)");
        glow.addColorStop(1, "rgba(212, 163, 115, 0)");
        ctx!.fillStyle = glow;
        ctx!.beginPath();
        ctx!.arc(x, y, pulseR, 0, 2 * Math.PI);
        ctx!.fill();
        ctx!.restore();

        // Outer ring
        ctx!.save();
        ctx!.globalAlpha = 0.5 + Math.sin(elapsed * 0.06) * 0.3;
        ctx!.strokeStyle = "#D4A373";
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        ctx!.arc(x, y, 22, 0, 2 * Math.PI);
        ctx!.stroke();
        ctx!.restore();

        // Horizontal light beam projecting to the right
        ctx!.save();
        ctx!.globalAlpha = 0.35 + Math.sin(elapsed * 0.05) * 0.12;
        const beamGrad = ctx!.createLinearGradient(x + 22, y, x + 280, y);
        beamGrad.addColorStop(0, "rgba(212, 163, 115, 0.6)");
        beamGrad.addColorStop(0.3, "rgba(212, 163, 115, 0.18)");
        beamGrad.addColorStop(1, "rgba(212, 163, 115, 0)");
        ctx!.strokeStyle = beamGrad;
        ctx!.lineWidth = 2;
        ctx!.beginPath();
        ctx!.moveTo(x + 22, y);
        ctx!.lineTo(x + 280, y);
        ctx!.stroke();
        ctx!.restore();
      }

      // ── Node body shadow ──
      ctx!.save();
      const shadow = ctx!.createRadialGradient(
        x + 1.5,
        y + 2,
        0,
        x + 1.5,
        y + 2,
        r * 1.4,
      );
      shadow.addColorStop(0, "rgba(0,10,40,0.35)");
      shadow.addColorStop(1, "rgba(0,0,0,0)");
      ctx!.beginPath();
      ctx!.arc(x, y, r * 1.4, 0, 2 * Math.PI);
      ctx!.fillStyle = shadow;
      ctx!.fill();
      ctx!.restore();

      // ── Node body fill ──
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, 2 * Math.PI);
      if (isActive) {
        const goldGrad = ctx!.createLinearGradient(x - r, y - r, x + r, y + r);
        goldGrad.addColorStop(0, "#fff8c0");
        goldGrad.addColorStop(0.15, "#f5d84a");
        goldGrad.addColorStop(0.35, "#D4A373");
        goldGrad.addColorStop(0.55, "#b07d10");
        goldGrad.addColorStop(0.75, "#e8c050");
        goldGrad.addColorStop(1, "#D4A373");
        ctx!.fillStyle = goldGrad;
      } else {
        ctx!.fillStyle = "#011f5b";
      }
      ctx!.fill();

      // Metallic sheen
      const metal = ctx!.createLinearGradient(x - r, y - r, x + r, y + r);
      if (isActive) {
        metal.addColorStop(0, "rgba(255,255,210,0.0)");
        metal.addColorStop(0.2, "rgba(255,245,180,0.5)");
        metal.addColorStop(0.5, "rgba(180,120,30,0.15)");
        metal.addColorStop(0.8, "rgba(255,230,150,0.3)");
        metal.addColorStop(1, "rgba(255,255,200,0.0)");
      } else {
        metal.addColorStop(0, "rgba(160,195,255,0.0)");
        metal.addColorStop(0.18, "rgba(190,220,255,0.55)");
        metal.addColorStop(0.48, "rgba(10,50,140,0.15)");
        metal.addColorStop(0.75, "rgba(100,150,230,0.25)");
        metal.addColorStop(1, "rgba(180,210,255,0.0)");
      }
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, 2 * Math.PI);
      ctx!.fillStyle = metal;
      ctx!.fill();

      // Highlight
      const hl = ctx!.createRadialGradient(
        x - r * 0.35,
        y - r * 0.4,
        0,
        x - r * 0.35,
        y - r * 0.4,
        r * 0.6,
      );
      hl.addColorStop(
        0,
        isActive ? "rgba(255,255,210,0.9)" : "rgba(235,248,255,0.9)",
      );
      hl.addColorStop(
        0.35,
        isActive ? "rgba(255,245,160,0.4)" : "rgba(180,220,255,0.4)",
      );
      hl.addColorStop(1, "rgba(255,255,255,0)");
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, 2 * Math.PI);
      ctx!.fillStyle = hl;
      ctx!.fill();

      // Specular speck
      ctx!.beginPath();
      ctx!.arc(x - r * 0.3, y - r * 0.34, r * 0.15, 0, 2 * Math.PI);
      ctx!.fillStyle = "rgba(255,255,240,0.95)";
      ctx!.fill();
    }

    /* ═══════════════════════════════════════════════════════════
       DRAW: Node Label (drawn next to each timeline node)
       ═══════════════════════════════════════════════════════════ */
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
      ctx!.font = `bold 13px 'Space Grotesk', sans-serif`;
      ctx!.fillStyle = isActive ? "#D4A373" : "rgba(2, 59, 142, 0.65)";
      ctx!.textAlign = "left";
      ctx!.textBaseline = "middle";

      const labelX = x + 30;
      ctx!.fillText(node.label, labelX, y);

      // Active underline
      if (isActive) {
        const tw = ctx!.measureText(node.label).width;
        ctx!.beginPath();
        ctx!.moveTo(labelX, y + 11);
        ctx!.lineTo(labelX + tw, y + 11);
        ctx!.strokeStyle = "rgba(212, 163, 115, 0.45)";
        ctx!.lineWidth = 1;
        ctx!.stroke();
      }

      ctx!.restore();
    }
    /* ═══════════════════════════════════════════════════════════
       DRAW: Premium Canvas DNA Helix (renders when abP > 0)
       Drawn BEHIND the electrons/nodes — provides the helix
       strands and rungs directly on the canvas layer.
       ═══════════════════════════════════════════════════════════ */
    function buildDNAPoints(phaseOffset: number) {
      const pts: { x: number; y: number; z: number }[] = [];
      for (let i = 0; i <= DNA_STEPS; i++) {
        const t = i / DNA_STEPS;
        const y = DNA_TOP_Y + t * (DNA_BOT_Y - DNA_TOP_Y);
        const angle = t * Math.PI * 2 * DNA_TURNS + phaseOffset;
        pts.push({ x: CX + DNA_AMP * Math.cos(angle), y, z: Math.sin(angle) });
      }
      return pts;
    }

    function drawDNAStrand(
      pts: { x: number; y: number }[],
      gradient: CanvasGradient,
      alpha: number,
    ) {
      if (pts.length < 2) return;
      ctx!.save();
      ctx!.globalAlpha = alpha;

      // Glow layer (wide, soft)
      ctx!.beginPath();
      ctx!.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const curr = pts[i];
        const mx = (prev.x + curr.x) / 2;
        const my = (prev.y + curr.y) / 2;
        ctx!.quadraticCurveTo(prev.x, prev.y, mx, my);
      }
      ctx!.strokeStyle = gradient;
      ctx!.lineWidth = 10;
      ctx!.globalAlpha = alpha * 0.15;
      ctx!.stroke();

      // Main strand
      ctx!.beginPath();
      ctx!.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const curr = pts[i];
        const mx = (prev.x + curr.x) / 2;
        const my = (prev.y + curr.y) / 2;
        ctx!.quadraticCurveTo(prev.x, prev.y, mx, my);
      }
      ctx!.strokeStyle = gradient;
      ctx!.lineWidth = 5;
      ctx!.lineJoin = "round";
      ctx!.globalAlpha = alpha;
      ctx!.stroke();
      ctx!.restore();
    }

    function drawDNARungs(
      goldPts: { x: number; y: number; z: number }[],
      bluePts: { x: number; y: number; z: number }[],
      alpha: number,
      isFrontPass: boolean,
    ) {
      const RUNG_STEP = 9;
      ctx!.save();
      for (let i = 0; i <= DNA_STEPS; i += RUNG_STEP) {
        const gp = goldPts[i];
        const bp = bluePts[i];
        const isFront = gp.z > 0;
        if (isFront !== isFrontPass) continue;

        const depth = (gp.z + 1) / 2; // 0 = back, 1 = front
        const rungAlpha = (0.22 + depth * 0.6) * alpha;
        const rungWidth = 0.8 + depth * 1.6;

        const rungGrad = ctx!.createLinearGradient(gp.x, gp.y, bp.x, bp.y);
        rungGrad.addColorStop(0, "rgba(212,163,115,1)");
        rungGrad.addColorStop(0.5, "rgba(240,200,80,0.9)");
        rungGrad.addColorStop(1, "rgba(2,59,142,0.8)");

        ctx!.globalAlpha = rungAlpha;
        ctx!.beginPath();
        ctx!.moveTo(gp.x, gp.y);
        ctx!.lineTo(bp.x, bp.y);
        ctx!.strokeStyle = rungGrad;
        ctx!.lineWidth = rungWidth;
        ctx!.lineCap = "round";
        ctx!.stroke();
      }
      ctx!.restore();
    }

    function drawDNA(abP: number) {
      if (abP < 0.01) return;
      const alpha = easeInOut(clamp01((abP - 0.35) / 0.45));
      if (alpha < 0.005) return;

      const goldPts = buildDNAPoints(0);
      const bluePts = buildDNAPoints(Math.PI); // opposite phase

      // Build gradient for gold strand
      const goldGrad = ctx!.createLinearGradient(CX, DNA_TOP_Y, CX, DNA_BOT_Y);
      goldGrad.addColorStop(0, "rgba(200,137,58,0.85)");
      goldGrad.addColorStop(0.25, "rgba(245,216,74,1)");
      goldGrad.addColorStop(0.5, "rgba(212,163,115,1)");
      goldGrad.addColorStop(0.75, "rgba(240,192,64,1)");
      goldGrad.addColorStop(1, "rgba(176,120,32,0.85)");

      // Build gradient for blue strand
      const blueGrad = ctx!.createLinearGradient(CX, DNA_TOP_Y, CX, DNA_BOT_Y);
      blueGrad.addColorStop(0, "rgba(2,59,142,0.85)");
      blueGrad.addColorStop(0.3, "rgba(14,165,233,1)");
      blueGrad.addColorStop(0.65, "rgba(29,78,216,1)");
      blueGrad.addColorStop(1, "rgba(2,59,142,0.85)");

      // Ambient energy glow between strands
      ctx!.save();
      const energyGrad = ctx!.createRadialGradient(CX, CY, 0, CX, CY, 180);
      energyGrad.addColorStop(0, `rgba(212,163,115,${0.14 * alpha})`);
      energyGrad.addColorStop(0.5, `rgba(2,59,142,${0.08 * alpha})`);
      energyGrad.addColorStop(1, "rgba(2,59,142,0)");
      ctx!.fillStyle = energyGrad;
      ctx!.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx!.restore();

      // Back rungs
      drawDNARungs(goldPts, bluePts, alpha, false);

      // Gold strand
      drawDNAStrand(goldPts, goldGrad, alpha);

      // Blue strand
      drawDNAStrand(bluePts, blueGrad, alpha);

      // Front rungs (on top of both strands)
      drawDNARungs(goldPts, bluePts, alpha, true);

      // Floating particles
      const t = elapsed * 0.012;
      [0.12, 0.35, 0.6, 0.84].forEach((frac, fi) => {
        const phase = (frac + t * 0.25) % 1;
        const pidx = Math.min(Math.round(phase * DNA_STEPS), DNA_STEPS);
        const gp = goldPts[pidx];
        ctx!.save();
        ctx!.globalAlpha =
          alpha * (0.55 + 0.35 * Math.sin(elapsed * 0.08 + fi));
        ctx!.beginPath();
        ctx!.arc(gp.x, gp.y, 3, 0, Math.PI * 2);
        ctx!.fillStyle = "#F5D84A";
        ctx!.shadowColor = "#F5D84A";
        ctx!.shadowBlur = 6;
        ctx!.fill();
        ctx!.restore();

        const phase2 = (frac + 0.08 + t * 0.25) % 1;
        const pidx2 = Math.min(Math.round(phase2 * DNA_STEPS), DNA_STEPS);
        const bp = bluePts[pidx2];
        ctx!.save();
        ctx!.globalAlpha =
          alpha * (0.55 + 0.35 * Math.sin(elapsed * 0.08 + fi + 1.2));
        ctx!.beginPath();
        ctx!.arc(bp.x, bp.y, 3, 0, Math.PI * 2);
        ctx!.fillStyle = "#0EA5E9";
        ctx!.shadowColor = "#0EA5E9";
        ctx!.shadowBlur = 6;
        ctx!.fill();
        ctx!.restore();
      });
    }

    /* ═══════════════════════════════════════════════════════════
       FRAME LOOP
       ═══════════════════════════════════════════════════════════ */
    function frame() {
      if (!ctx || !canvas || !container) return;

      const p = clamp01(progressRef?.current ?? 0);
      const eased = easeInOut(p);
      const settle = easeInOut(clamp01((p - 0.56) / 0.44));
      const sep = clamp01(nucleusSeparationRef?.current ?? 0);

      /* ── Container 3D spin (hero→clubs only) ── */
      if (p > 0.001) {
        const rotY = eased * 360;
        const rotX = Math.sin(Math.PI * eased) * 12;
        const rotZ = Math.sin(Math.PI * eased) * -15;
        const pulse = 1 + Math.sin(Math.PI * p) * 0.15;
        container.style.transform = `perspective(1000px) rotateY(${rotY}deg) rotateX(${rotX}deg) rotateZ(${rotZ}deg) scale(${pulse})`;
      } else {
        container.style.transform = "";
      }

      /* ── Draw ── */
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Nucleus separation: shift orbits LEFT so nucleus/atom appears to slide RIGHT
      const orbitShiftX = sep * -700;
      const orbitFade = 1 - sep;

      // Read aboutProgress early — needed for fade calculations below
      const abP = clamp01(aboutProgressRef?.current ?? 0);

      if (sep > 0.001) {
        ctx.save();
        ctx.globalAlpha = orbitFade;
        ctx.translate(orbitShiftX, 0);
      }

      // Draw orbits — fade out as DNA emerges
      const orbitAlphaAbout = 1 - easeInOut(clamp01((abP - 0.05) / 0.35));
      if (orbitAlphaAbout > 0.01) {
        orbits.forEach((o) =>
          drawOrbit(o.rx, o.ry, o.angleDeg, orbitFade * orbitAlphaAbout),
        );
      }

      if (sep > 0.001) {
        ctx.restore();
      }

      // Draw nucleus — fades out as DNA emerges
      const nucleusAlpha = 1 - easeInOut(clamp01((abP - 0.15) / 0.4));
      if (nucleusAlpha > 0.01) {
        ctx.save();
        ctx.globalAlpha = nucleusAlpha;
        drawNucleus();
        ctx.restore();
      }

      // 🧬 DRAW DNA HELIX — canvas layer behind morphed nodes
      if (abP > 0.01) {
        drawDNA(abP);
      }
      /* ── Draw electrons / timeline nodes (The Two-Way Morph) ── */
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

          // Settle electrons during hero→clubs
          if (p > 0.001 && abP < 0.1) {
            const target = idx === 0 ? 0 : Math.PI;
            theta = movingTheta + shortestAngle(movingTheta, target) * settle;
          }

          const pos = getPos(o.rx, o.ry, o.angleDeg, theta);
          let drawX = pos.x;
          let drawY = pos.y;

          // 🧬 TWO-WAY MORPH LOGIC: Electrons fly to Spine Nodes
          if (abP > 0.05) {
            const targetX = CX;
            const targetY = TIMELINE_NODES[orbitIdx].targetY;
            const easeAb = easeInOut(abP);

            drawX = lerp(pos.x, targetX, easeAb);
            drawY = lerp(pos.y, targetY, easeAb);

            if (idx === 1) {
              // Second electron fades out and merges into the first
              const fadeProg = easeInOut(clamp01((abP - 0.15) / 0.4));
              if (fadeProg < 0.99) {
                ctx.save();
                ctx.globalAlpha =
                  (sep > 0.001 ? orbitFade : 1) * (1 - fadeProg);
                drawElectron(drawX, drawY);
                ctx.restore();
              }
            } else {
              // First electron morphs into the premium Timeline Node
              const nodeProg = easeInOut(clamp01((abP - 0.3) / 0.5));

              if (nodeProg < 0.01) {
                // Still a regular electron
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
              } else {
                // Morphed into premium Timeline Node
                drawTimelineNode(drawX, drawY, orbitIdx, nodeProg);

                // Label fades in
                const labelAlpha = clamp01((abP - 0.6) / 0.4);
                if (labelAlpha > 0.01) {
                  drawNodeLabel(orbitIdx, drawX, drawY, labelAlpha);
                }
              }
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

          // Track coordinates for hit testing
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

      // Draw tooltip
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

    /* ═══════════════════════════════════════════════════════════
       Mouse/Touch handlers (unchanged from original)
       ═══════════════════════════════════════════════════════════ */
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

      // Check nucleus
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
