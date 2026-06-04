"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Hero from "./Hero";
import HeroAtom, { TIMELINE_NODES } from "./HeroAtom";
import { urlFor } from "@/sanity/lib/image";
import type { HomepageData } from "@/sanity/lib/types";

/* ─── constants ─── */
const HEADER_H = 64;
const TRANSITION_MS = 1600; // duration of the section-to-section transition
const CANVAS_INTRINSIC = 640;

const CLUBS_DETAILS = [
  {
    slug: "stem",
    name: "STEM Club",
    tagline:
      "Innovate, build, and explore the frontiers of science, coding, and technology.",
    color: "#0284c7", // Sky blue
    category: "Science & Technology",
    iconName: "Terminal",
    themes: ["Science", "Tech", "Engineering", "Math"],
    info: [
      { label: "Members", value: "120+" },
      { label: "Meetings", value: "Weekly" },
      { label: "Activity", value: "High" },
    ],
  },
  {
    slug: "sports",
    name: "Sports Club",
    tagline:
      "Unleash your athletic potential, embrace teamwork, and chase victory.",
    color: "#f59e0b", // Amber
    category: "Athletics & Health",
    iconName: "Trophy",
    themes: ["Athletics", "Teamwork", "Tournaments", "Fitness"],
    info: [
      { label: "Members", value: "200+" },
      { label: "Meetings", value: "Bi-Weekly" },
      { label: "Activity", value: "Very High" },
    ],
  },
  {
    slug: "literature",
    name: "Literature Club",
    tagline:
      "Celebrate the power of words, creative writing, poetry, and deep debates.",
    color: "#10b981", // Emerald
    category: "Arts & Letters",
    iconName: "BookOpen",
    themes: ["Creative Writing", "Poetry", "Debate", "Storytelling"],
    info: [
      { label: "Members", value: "80+" },
      { label: "Meetings", value: "Weekly" },
      { label: "Activity", value: "Active" },
    ],
  },
  {
    slug: "arts",
    name: "Arts & Craft Club",
    tagline:
      "Express yourself visually through beautiful paintings, sketches, and manual crafts.",
    color: "#f43f5e", // Rose
    category: "Creative & Design",
    iconName: "Palette",
    themes: ["Painting", "Crafts", "Sketching", "Design"],
    info: [
      { label: "Members", value: "90+" },
      { label: "Meetings", value: "Weekly" },
      { label: "Activity", value: "Active" },
    ],
  },
  {
    slug: "entertainment",
    name: "Entertainment Club",
    tagline: "Bring joy, music, dance, and theater to the main stage of NSS.",
    color: "#8b5cf6", // Violet
    category: "Performing Arts",
    iconName: "Music",
    themes: ["Music", "Dance", "Theater", "Production"],
    info: [
      { label: "Members", value: "150+" },
      { label: "Meetings", value: "Multi-Weekly" },
      { label: "Activity", value: "Very High" },
    ],
  },
  {
    slug: "social",
    name: "Social Club",
    tagline:
      "Make a positive impact on society through volunteering, empathy, and social work.",
    color: "#0d9488", // Teal
    category: "Community Service",
    iconName: "Heart",
    themes: ["Volunteering", "Social Work", "Charity", "Community"],
    info: [
      { label: "Members", value: "250+" },
      { label: "Meetings", value: "Monthly" },
      { label: "Activity", value: "High" },
    ],
  },
  {
    slug: "executive-team",
    name: "Executive Team",
    tagline:
      "Meet the visionary leaders, advisors, and coordinators steering the NSS Clubs towards excellence and impact.",
    color: "#D4A373", // Gold
    category: "Governance & Operations",
    iconName: "Shield",
    isSpecial: true,
    themes: ["Leadership", "Strategy", "Advising", "Operations"],
    info: [
      { label: "Officers", value: "15" },
      { label: "Meetings", value: "Weekly" },
      { label: "Activity", value: "Continuous" },
    ],
  },
];

function ClubIcon({ name, className }: { name: string; className?: string }) {
  const props = {
    className: className || "w-5 h-5",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.5,
    viewBox: "0 0 24 24",
  };

  switch (name) {
    case "Terminal":
      return (
        <svg {...props}>
          <polyline
            points="4 17 10 11 4 5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="12"
            y1="19"
            x2="20"
            y2="19"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Trophy":
      return (
        <svg {...props}>
          <path
            d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M4 22h16" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 2a6 6 0 0 1 6 6c0 3.6-2 5.5-6 6.5-4-1-6-2.9-6-6.5a6 6 0 0 1 6-6Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "BookOpen":
      return (
        <svg {...props}>
          <path
            d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Palette":
      return (
        <svg {...props}>
          <path
            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.32115 19.4626 5.37256 20.2036 4.97549 20.7256C4.42398 21.4507 3.50428 21.8491 2.5 22C4.52044 22 8.78453 22 12 22Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="7.5" cy="10.5" r="1" fill="currentColor" />
          <circle cx="11.5" cy="7.5" r="1" fill="currentColor" />
          <circle cx="16.5" cy="9.5" r="1" fill="currentColor" />
          <circle cx="15.5" cy="14.5" r="1" fill="currentColor" />
        </svg>
      );
    case "Music":
      return (
        <svg {...props}>
          <path
            d="M9 18V5l12-2v13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      );
    case "Heart":
      return (
        <svg {...props}>
          <path
            d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Shield":
      return (
        <svg {...props}>
          <path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   DNA HELIX — Mathematically precise, premium double helix component
   Uses real sin/cos geometry for each sample point on both strands,
   with depth-sorted rungs, metallic gradients, glow filters, and
   ambient energy field. Responds to activeNode for node highlighting.
   ═══════════════════════════════════════════════════════════════════════════ */
function DNAHelix({ activeNode }: { activeNode: number }) {
  // ── Layout constants (viewBox: 0 0 340 900) ──
  const VW = 340;
  const VH = 900;
  const CX = VW / 2; // 170 — center axis
  const AMP = 72; // horizontal amplitude of each strand
  const STEPS = 180; // samples per strand (smooth curve)
  const Y_TOP = 30;
  const Y_BOT = 870;
  const RUNG_STEP = 18; // samples between rungs

  // Node positions along the helix (in viewBox Y coords)
  const NODE_Y = [180, 450, 720];

  // ── Build strand point arrays ──
  const goldPts: { x: number; y: number; z: number }[] = [];
  const bluePts: { x: number; y: number; z: number }[] = [];

  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const y = Y_TOP + t * (Y_BOT - Y_TOP);
    const angle = t * Math.PI * 5; // 2.5 full rotations
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    // Gold strand: phase 0, Blue strand: phase π (opposite)
    goldPts.push({ x: CX + AMP * cosA, y, z: sinA }); // z for depth
    bluePts.push({
      x: CX + AMP * Math.cos(angle + Math.PI),
      y,
      z: Math.sin(angle + Math.PI),
    });
  }

  // ── Build SVG path string from point array ──
  function toPath(pts: { x: number; y: number }[]) {
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;
    // Catmull-Rom → cubic bezier approximation for smoothness
    for (let i = 1; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[Math.min(pts.length - 1, i + 1)];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p1.x - (p2.x - p0.x) / 6;
      const cp2y = p1.y - (p2.y - p0.y) / 6;
      d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p1.x.toFixed(2)},${p1.y.toFixed(2)}`;
    }
    return d;
  }

  // ── Build rungs between the two strands ──
  // Only draw rungs; colour by depth (z of gold strand at that sample)
  const rungs: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    opacity: number;
    width: number;
    isFront: boolean;
  }[] = [];

  for (let i = 0; i <= STEPS; i += RUNG_STEP) {
    const gp = goldPts[i];
    const bp = bluePts[i];
    const depth = (gp.z + 1) / 2; // 0 = behind, 1 = in front
    const isFront = gp.z > 0;
    rungs.push({
      x1: gp.x,
      y1: gp.y,
      x2: bp.x,
      y2: bp.y,
      opacity: 0.25 + depth * 0.65,
      width: 0.8 + depth * 1.6,
      isFront,
    });
  }

  // Depth sort: back rungs first, front rungs on top
  const backRungs = rungs.filter((r) => !r.isFront);
  const frontRungs = rungs.filter((r) => r.isFront);

  // ── Node highlight ring sizes ──
  function nodeRingR(idx: number) {
    return activeNode === idx ? 26 : 18;
  }
  function nodeRingOpacity(idx: number) {
    return activeNode === idx ? 1 : 0.45;
  }

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox={`0 0 ${VW} ${VH}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ overflow: "visible" }}
    >
      <defs>
        {/* ── Energy field gradient ── */}
        <radialGradient id="dna-energy" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D4A373" stopOpacity="0.18" />
          <stop offset="45%" stopColor="#023B8E" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#023B8E" stopOpacity="0" />
        </radialGradient>

        {/* ── Gold strand gradient (vertical) ── */}
        <linearGradient id="dna-gold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c8893a" stopOpacity="0.85" />
          <stop offset="25%" stopColor="#F5D84A" stopOpacity="1" />
          <stop offset="50%" stopColor="#D4A373" stopOpacity="1" />
          <stop offset="75%" stopColor="#f0c040" stopOpacity="1" />
          <stop offset="100%" stopColor="#b07820" stopOpacity="0.85" />
        </linearGradient>

        {/* ── Blue strand gradient (vertical) ── */}
        <linearGradient id="dna-blue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#023B8E" stopOpacity="0.85" />
          <stop offset="30%" stopColor="#0EA5E9" stopOpacity="1" />
          <stop offset="60%" stopColor="#1d4ed8" stopOpacity="1" />
          <stop offset="100%" stopColor="#023B8E" stopOpacity="0.85" />
        </linearGradient>

        {/* ── Glow filter for strands ── */}
        <filter id="dna-glow" x="-60%" y="-10%" width="220%" height="120%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* ── Soft glow for nodes ── */}
        <filter id="node-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* ── Gold node gradient ── */}
        <radialGradient id="node-gold-active" cx="38%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fff8c0" />
          <stop offset="30%" stopColor="#F5D84A" />
          <stop offset="65%" stopColor="#D4A373" />
          <stop offset="100%" stopColor="#8a5e00" />
        </radialGradient>

        {/* ── Blue node gradient ── */}
        <radialGradient id="node-blue-inactive" cx="38%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#b8d4ff" />
          <stop offset="35%" stopColor="#4a90d9" />
          <stop offset="70%" stopColor="#023B8E" />
          <stop offset="100%" stopColor="#010f2e" />
        </radialGradient>

        {/* ── Clip path to keep energy field contained ── */}
        <clipPath id="dna-clip">
          <rect x="0" y="0" width={VW} height={VH} />
        </clipPath>
      </defs>

      {/* ── 1. Ambient energy field ── */}
      <ellipse
        cx={CX}
        cy={VH / 2}
        rx={AMP + 60}
        ry={VH / 2}
        fill="url(#dna-energy)"
        clipPath="url(#dna-clip)"
        className="animate-[spine-pulse_7s_ease-in-out_infinite]"
      />

      {/* ── 2. Back rungs (behind both strands) ── */}
      <g>
        {backRungs.map((r, i) => (
          <line
            key={`br-${i}`}
            x1={r.x1}
            y1={r.y1}
            x2={r.x2}
            y2={r.y2}
            stroke="#D4A373"
            strokeWidth={r.width}
            opacity={r.opacity * 0.55}
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* ── 3. Gold strand (back half hidden behind blue) ── */}
      <path
        d={toPath(goldPts)}
        fill="none"
        stroke="url(#dna-gold)"
        strokeWidth="5.5"
        strokeLinecap="round"
        filter="url(#dna-glow)"
        opacity="0.95"
        className="animate-[spine-pulse_5s_ease-in-out_infinite]"
      />
      {/* Gold strand shadow/depth layer */}
      <path
        d={toPath(goldPts)}
        fill="none"
        stroke="#D4A373"
        strokeWidth="9"
        strokeLinecap="round"
        opacity="0.12"
      />

      {/* ── 4. Blue strand ── */}
      <path
        d={toPath(bluePts)}
        fill="none"
        stroke="url(#dna-blue)"
        strokeWidth="5.5"
        strokeLinecap="round"
        filter="url(#dna-glow)"
        opacity="0.95"
        className="animate-[spine-pulse_5s_ease-in-out_infinite]"
        style={{ animationDelay: "2.5s" }}
      />
      {/* Blue strand shadow/depth layer */}
      <path
        d={toPath(bluePts)}
        fill="none"
        stroke="#0EA5E9"
        strokeWidth="9"
        strokeLinecap="round"
        opacity="0.10"
      />

      {/* ── 5. Front rungs (in front of both strands) ── */}
      <g>
        {frontRungs.map((r, i) => (
          <line
            key={`fr-${i}`}
            x1={r.x1}
            y1={r.y1}
            x2={r.x2}
            y2={r.y2}
            stroke="#D4A373"
            strokeWidth={r.width}
            opacity={r.opacity}
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* ── 6. Floating particles along strands ── */}
      {[0.15, 0.38, 0.62, 0.85].map((frac, fi) => {
        const idx = Math.round(frac * STEPS);
        const gp = goldPts[Math.min(idx, STEPS)];
        return (
          <circle
            key={`gp-${fi}`}
            cx={gp.x}
            cy={gp.y}
            r="3"
            fill="#F5D84A"
            opacity="0.7"
            className="animate-[spine-pulse_3s_ease-in-out_infinite]"
            style={{ animationDelay: `${fi * 0.75}s` }}
          />
        );
      })}
      {[0.08, 0.3, 0.54, 0.78].map((frac, fi) => {
        const idx = Math.round(frac * STEPS);
        const bp = bluePts[Math.min(idx, STEPS)];
        return (
          <circle
            key={`bp-${fi}`}
            cx={bp.x}
            cy={bp.y}
            r="3"
            fill="#0EA5E9"
            opacity="0.7"
            className="animate-[spine-pulse_3s_ease-in-out_infinite]"
            style={{ animationDelay: `${fi * 0.75 + 0.4}s` }}
          />
        );
      })}

      {/* ── 7. Three node markers (where electrons land) ── */}
      {NODE_Y.map((ny, idx) => {
        const isActive = activeNode === idx;
        const r = nodeRingR(idx);
        const op = nodeRingOpacity(idx);

        return (
          <g key={`node-${idx}`}>
            {/* Outer pulse ring — active only */}
            {isActive && (
              <circle
                cx={CX}
                cy={ny}
                r={r + 14}
                fill="none"
                stroke="#D4A373"
                strokeWidth="1"
                opacity="0.35"
                className="animate-[spin_8s_linear_infinite]"
                strokeDasharray="6 4"
              />
            )}

            {/* Ambient glow halo */}
            {isActive && (
              <circle
                cx={CX}
                cy={ny}
                r={r + 22}
                fill="#D4A373"
                opacity="0.10"
                className="animate-[spine-pulse_4s_ease-in-out_infinite]"
              />
            )}

            {/* Node ring */}
            <circle
              cx={CX}
              cy={ny}
              r={r}
              fill={isActive ? "rgba(212,163,115,0.08)" : "rgba(2,59,142,0.06)"}
              stroke={isActive ? "#D4A373" : "rgba(2,59,142,0.4)"}
              strokeWidth={isActive ? 2 : 1.5}
              opacity={op}
              style={{ transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)" }}
            />

            {/* Node core sphere */}
            <circle
              cx={CX}
              cy={ny}
              r={isActive ? 12 : 9}
              fill={
                isActive ? "url(#node-gold-active)" : "url(#node-blue-inactive)"
              }
              filter={isActive ? "url(#node-glow)" : undefined}
              opacity={op}
              style={{ transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)" }}
            />

            {/* Specular highlight on node */}
            <circle
              cx={CX - (isActive ? 4 : 3)}
              cy={ny - (isActive ? 4 : 3)}
              r={isActive ? 3.5 : 2.5}
              fill="rgba(255,255,240,0.9)"
              opacity={op * 0.85}
            />

            {/* Active horizontal connector beam */}
            {isActive && (
              <line
                x1={CX + 14}
                y1={ny}
                x2={CX + 110}
                y2={ny}
                stroke="#D4A373"
                strokeWidth="1.5"
                opacity="0.5"
                strokeDasharray="5,4"
                className="animate-[spine-pulse_3s_ease-in-out_infinite]"
              />
            )}
          </g>
        );
      })}

      {/* ── 8. Vertical central axis (spine) ── */}
      <line
        x1={CX}
        y1={Y_TOP}
        x2={CX}
        y2={Y_BOT}
        stroke="rgba(212,163,115,0.12)"
        strokeWidth="1"
        strokeDasharray="4,8"
      />
    </svg>
  );
}

/* ─── zoom animation constants ─── */
const ZOOM_DURATION = 2400;
const NUCLEUS_ZOOM_DURATION = 3200; // longer for the dramatic separation + zoom
const ZOOM_SCALE_FACTOR = 5.5;
const ELECTRON_TARGET_X = 520; // CX + orbit rx = 320 + 200
const ELECTRON_TARGET_Y = 320; // CY

/** Rotation offset (radians) to bring each club's electron to the Literature Club position (right-center of horizontal orbit). */
const ROTATION_OFFSETS: Record<string, number> = {
  stem: (60 * Math.PI) / 180,
  sports: (-120 * Math.PI) / 180,
  literature: 0,
  arts: Math.PI,
  entertainment: (-60 * Math.PI) / 180,
  social: (120 * Math.PI) / 180,
  "executive-team": 0,
};

/* ─── helpers ─── */
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}
function easeInOutQuart(t: number) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

/** Find the .hero-atom-origin that has layout (not display:none). */
function getLayoutElement(selector: string): HTMLElement | null {
  const els = document.querySelectorAll<HTMLElement>(selector);
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

type Phase = "hero" | "animating" | "clubs" | "zooming" | "zoomed" | "about";

interface AnimState {
  targetPhase: "hero" | "clubs" | "about";
  startTime: number;
  scrollStart: number;
  scrollEnd: number;
}

interface ZoomAnimState {
  direction: "forward" | "reverse";
  startTime: number;
  slug: string;
  targetRotation: number;
  electronCanvasX: number;
  electronCanvasY: number;
  clubsFloatX: number;
  clubsFloatY: number;
  clubsScale: number;
}

export default function HomeScrollExperience({ data }: { data: HomepageData }) {
  /* ── refs ── */
  const clubsAnchorRef = useRef<HTMLDivElement>(null);
  const desktopAboutAnchorRef = useRef<HTMLDivElement>(null);
  const mobileAboutAnchorRef = useRef<HTMLDivElement>(null);
  const aboutCardRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const phaseRef = useRef<Phase>("hero");
  const animRef = useRef<AnimState | null>(null);
  const atomProgressRef = useRef(0);
  const aboutProgressRef = useRef(0);
  const touchStartRef = useRef<number | null>(null);
  const prevShowTextRef = useRef(false);
  const initializedRef = useRef(false);
  const rotationOffsetRef = useRef(0);
  const nucleusSeparationRef = useRef(0);
  const zoomAnimRef = useRef<ZoomAnimState | null>(null);
  const pendingZoomSlugRef = useRef<string | null>(null);
  const initZoomRef = useRef<(slug: string) => void>(() => {});
  const activeAboutNodeRef = useRef(0);
  const prevActiveNodeRef = useRef(-1);

  const [clubsTextVisible, setClubsTextVisible] = useState(false);
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [cardRevealVisible, setCardRevealVisible] = useState(false);
  const [activeAboutNode, setActiveAboutNode] = useState(0);

  const cardWrapperRef = useRef<HTMLDivElement>(null);
  const [projectorCoords, setProjectorCoords] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    x3: number;
    y3: number;
  } | null>(null);

  /* ── Trigger a section-snap transition ── */
  const startTransition = useCallback(
    (targetPhase: "hero" | "clubs" | "about") => {
      if (phaseRef.current === "animating") return;
      if (phaseRef.current === "zooming" || phaseRef.current === "zoomed")
        return;

      let scrollTarget = 0;
      if (targetPhase === "hero") {
        scrollTarget = 0;
      } else if (targetPhase === "clubs") {
        const clubsSection = document.getElementById("clubs");
        if (clubsSection) {
          scrollTarget =
            clubsSection.getBoundingClientRect().top +
            window.scrollY -
            HEADER_H;
        }
      } else if (targetPhase === "about") {
        const aboutSection = document.getElementById("about");
        if (aboutSection) {
          scrollTarget =
            aboutSection.getBoundingClientRect().top +
            window.scrollY -
            HEADER_H;
        }
      }

      phaseRef.current = "animating";
      animRef.current = {
        targetPhase,
        startTime: performance.now(),
        scrollStart: window.scrollY,
        scrollEnd: scrollTarget,
      };
    },
    [],
  );

  /* ── Zoom initialization (stored in ref for access from rAF tick) ── */
  initZoomRef.current = (slug: string) => {
    const clubsAnchor = clubsAnchorRef.current;
    if (!clubsAnchor) return;
    const clubsRect = clubsAnchor.getBoundingClientRect();

    const clubsCx = clubsRect.left + clubsRect.width / 2;
    const clubsCy = clubsRect.top + clubsRect.height / 2;
    const clubsScale = clubsRect.width / CANVAS_INTRINSIC;
    const clubsFloatX = clubsCx - CANVAS_INTRINSIC / 2;
    const clubsFloatY = clubsCy - CANVAS_INTRINSIC / 2;

    const isNucleus = slug === "executive-team";
    const targetRotation = ROTATION_OFFSETS[slug] ?? 0;
    const electronCanvasX = isNucleus
      ? CANVAS_INTRINSIC / 2
      : ELECTRON_TARGET_X;
    const electronCanvasY = isNucleus
      ? CANVAS_INTRINSIC / 2
      : ELECTRON_TARGET_Y;

    setSelectedClub(slug);
    setCardRevealVisible(false);

    phaseRef.current = "zooming";
    zoomAnimRef.current = {
      direction: "forward",
      startTime: performance.now(),
      slug,
      targetRotation,
      electronCanvasX,
      electronCanvasY,
      clubsFloatX,
      clubsFloatY,
      clubsScale,
    };
  };

  /* ── Electron & Nucleus Click Handler ── */
  const handleElectronClick = useCallback(
    (slug: string) => {
      if (
        phaseRef.current === "zooming" ||
        phaseRef.current === "zoomed" ||
        phaseRef.current === "about"
      )
        return;

      if (phaseRef.current === "hero") {
        startTransition("clubs");
        pendingZoomSlugRef.current = slug;
      } else if (phaseRef.current === "clubs") {
        initZoomRef.current(slug);
      }
    },
    [startTransition],
  );

  /* ── Close club card and reverse zoom ── */
  const handleCloseClub = useCallback(() => {
    if (phaseRef.current !== "zoomed") return;
    const slug = selectedClub;
    if (!slug) return;

    const clubsAnchor = clubsAnchorRef.current;
    if (!clubsAnchor) return;
    const clubsRect = clubsAnchor.getBoundingClientRect();

    const clubsCx = clubsRect.left + clubsRect.width / 2;
    const clubsCy = clubsRect.top + clubsRect.height / 2;
    const clubsScale = clubsRect.width / CANVAS_INTRINSIC;
    const clubsFloatX = clubsCx - CANVAS_INTRINSIC / 2;
    const clubsFloatY = clubsCy - CANVAS_INTRINSIC / 2;

    const isNucleus = slug === "executive-team";
    const targetRotation = ROTATION_OFFSETS[slug] ?? 0;
    const electronCanvasX = isNucleus
      ? CANVAS_INTRINSIC / 2
      : ELECTRON_TARGET_X;
    const electronCanvasY = isNucleus
      ? CANVAS_INTRINSIC / 2
      : ELECTRON_TARGET_Y;

    setCardRevealVisible(false);

    phaseRef.current = "zooming";
    zoomAnimRef.current = {
      direction: "reverse",
      startTime: performance.now(),
      slug,
      targetRotation,
      electronCanvasX,
      electronCanvasY,
      clubsFloatX,
      clubsFloatY,
      clubsScale,
    };
  }, [selectedClub]);

  /* ── Holographic Projector Coordinate Updater ── */
  const updateProjectorCoords = useCallback(() => {
    if (selectedClub && cardWrapperRef.current) {
      const cardRect = cardWrapperRef.current.getBoundingClientRect();
      const x1 = window.innerWidth * 0.18;
      const y1 = window.innerHeight * 0.5;
      const x2 = cardRect.left;
      const y2 = cardRect.top;
      const x3 = cardRect.left;
      const y3 = cardRect.bottom;
      setProjectorCoords({ x1, y1, x2, y2, x3, y3 });
    } else if (phaseRef.current === "about") {
      const isMobile =
        typeof window !== "undefined" && window.innerWidth < 1024;
      const aboutAnchor = isMobile
        ? mobileAboutAnchorRef.current
        : desktopAboutAnchorRef.current;
      if (aboutAnchor) {
        // Calculate active timeline node's screen position
        const anchorRect = aboutAnchor.getBoundingClientRect();
        const anchorCx = anchorRect.left + anchorRect.width / 2;
        const anchorCy = anchorRect.top + anchorRect.height / 2;
        const scale = anchorRect.width / CANVAS_INTRINSIC;
        const halfC = CANVAS_INTRINSIC / 2;

        const nodeIdx = activeAboutNodeRef.current;
        const nodeCanvasY = TIMELINE_NODES[nodeIdx]?.targetY ?? halfC;
        const x1 = anchorCx; // node X = CX = center
        const y1 = anchorCy + (nodeCanvasY - halfC) * scale;

        // Find the active about panel card
        const activeCard = document.querySelector(
          `.about-panel[data-node="${nodeIdx}"]`,
        );
        if (activeCard) {
          const cardRect = activeCard.getBoundingClientRect();
          setProjectorCoords({
            x1,
            y1,
            x2: cardRect.left,
            y2: cardRect.top,
            x3: cardRect.left,
            y3: cardRect.bottom,
          });
        } else {
          setProjectorCoords(null);
        }
      }
    } else {
      setProjectorCoords(null);
    }
  }, [selectedClub]);

  useEffect(() => {
    const active = cardRevealVisible || phaseRef.current === "about";
    if (active) {
      const timer = setTimeout(() => {
        updateProjectorCoords();
      }, 50);

      window.addEventListener("resize", updateProjectorCoords);
      window.addEventListener("scroll", updateProjectorCoords);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", updateProjectorCoords);
        window.removeEventListener("scroll", updateProjectorCoords);
      };
    } else {
      setProjectorCoords(null);
    }
  }, [cardRevealVisible, updateProjectorCoords]);

  /* ── Main animation loop ── */
  useEffect(() => {
    const tick = (now: number) => {
      const heroAnchor = getLayoutElement(".hero-atom-origin");
      const clubsAnchor = clubsAnchorRef.current;
      const floating = floatingRef.current;
      const canvasWrap = canvasWrapRef.current;

      if (!heroAnchor || !clubsAnchor || !floating || !canvasWrap) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (!initializedRef.current) {
        initializedRef.current = true;
        const clubsSection = document.getElementById("clubs");
        const aboutSection = document.getElementById("about");
        if (
          aboutSection &&
          window.scrollY >=
            aboutSection.getBoundingClientRect().top +
              window.scrollY -
              HEADER_H -
              50
        ) {
          phaseRef.current = "about";
          atomProgressRef.current = 1;
          aboutProgressRef.current = 1;
          prevShowTextRef.current = true;
          setClubsTextVisible(true);
        } else if (
          clubsSection &&
          window.scrollY >=
            clubsSection.getBoundingClientRect().top +
              window.scrollY -
              HEADER_H -
              50
        ) {
          phaseRef.current = "clubs";
          atomProgressRef.current = 1;
          aboutProgressRef.current = 0;
          prevShowTextRef.current = true;
          setClubsTextVisible(true);
        }
        floating.style.opacity = "1";
      }

      /* ── Compute position‑t and atom progress ── */
      let posT = 0;
      let aboutT = 0;

      if (phaseRef.current === "animating" && animRef.current) {
        const anim = animRef.current;
        const elapsed = now - anim.startTime;
        const rawT = clamp01(elapsed / TRANSITION_MS);
        const easedT = easeInOutQuart(rawT);

        if (anim.targetPhase === "clubs") {
          if (anim.scrollStart < anim.scrollEnd) {
            // Hero -> Clubs
            posT = easedT;
            aboutT = 0;
          } else {
            // About -> Clubs
            posT = 1;
            aboutT = 1 - easedT;
          }
        } else if (anim.targetPhase === "hero") {
          // Clubs -> Hero
          posT = 1 - easedT;
          aboutT = 0;
        } else if (anim.targetPhase === "about") {
          // Clubs -> About
          posT = 1;
          aboutT = easedT;
        }

        atomProgressRef.current = posT;
        aboutProgressRef.current = aboutT;

        // Programmatic scroll
        window.scrollTo(0, lerp(anim.scrollStart, anim.scrollEnd, easedT));

        // Finished?
        if (rawT >= 1) {
          phaseRef.current = anim.targetPhase;
          animRef.current = null;
          updateProjectorCoords(); // Update projector coords on transition finish

          // Trigger pending zoom after transition
          if (phaseRef.current === "clubs" && pendingZoomSlugRef.current) {
            const slug = pendingZoomSlugRef.current;
            pendingZoomSlugRef.current = null;
            initZoomRef.current(slug);
          }
        }
      } else if (
        phaseRef.current === "zooming" ||
        phaseRef.current === "zoomed"
      ) {
        posT = 1;
        aboutT = 0;
        atomProgressRef.current = 1;
        aboutProgressRef.current = 0;
      } else {
        // Normal scroll tracking (when not animating snap transitions or zoomed)
        const clubsSection = document.getElementById("clubs");
        const aboutSection = document.getElementById("about");
        if (clubsSection && aboutSection) {
          const clubsScrollY =
            clubsSection.getBoundingClientRect().top +
            window.scrollY -
            HEADER_H;
          const aboutScrollY =
            aboutSection.getBoundingClientRect().top +
            window.scrollY -
            HEADER_H;
          const sy = window.scrollY;

          if (sy < clubsScrollY) {
            phaseRef.current = "hero";
            posT = clamp01(sy / Math.max(clubsScrollY, 1));
            aboutT = 0;
          } else if (sy < aboutScrollY) {
            phaseRef.current = "clubs";
            posT = 1;
            aboutT = clamp01(
              (sy - clubsScrollY) / Math.max(aboutScrollY - clubsScrollY, 1),
            );
          } else {
            phaseRef.current = "about";
            posT = 1;
            aboutT = 1;

            // Track scroll within About section for active timeline node
            const aRect = aboutSection.getBoundingClientRect();
            const sectionScrolled = -(aRect.top - HEADER_H);
            const scrollableH = aboutSection.offsetHeight - window.innerHeight;
            const subProg = clamp01(sectionScrolled / Math.max(scrollableH, 1));
            const nodeIdx = subProg < 0.33 ? 0 : subProg < 0.66 ? 1 : 2;
            activeAboutNodeRef.current = nodeIdx;

            if (nodeIdx !== prevActiveNodeRef.current) {
              prevActiveNodeRef.current = nodeIdx;
              setActiveAboutNode(nodeIdx);
              updateProjectorCoords();
            }
          }
        }
        atomProgressRef.current = posT;
        aboutProgressRef.current = aboutT;
      }

      /* ── Interpolate atom position between hero & clubs & about anchors ── */
      const heroRect = heroAnchor.getBoundingClientRect();
      const clubsRect = clubsAnchor.getBoundingClientRect();
      const isMobile =
        typeof window !== "undefined" && window.innerWidth < 1024;
      const aboutAnchor = isMobile
        ? mobileAboutAnchorRef.current
        : desktopAboutAnchorRef.current;

      let cx = 0;
      let cy = 0;
      let size = 0;

      if (aboutProgressRef.current > 0.001 && aboutAnchor) {
        const aboutRect = aboutAnchor.getBoundingClientRect();
        const fromCx = clubsRect.left + clubsRect.width / 2;
        const fromCy = clubsRect.top + clubsRect.height / 2;
        const toCx = aboutRect.left + aboutRect.width / 2;
        const toCy = aboutRect.top + aboutRect.height / 2;

        cx = lerp(fromCx, toCx, aboutProgressRef.current);
        cy = lerp(fromCy, toCy, aboutProgressRef.current);
        size = lerp(clubsRect.width, aboutRect.width, aboutProgressRef.current);
      } else {
        const fromCx = heroRect.left + heroRect.width / 2;
        const fromCy = heroRect.top + heroRect.height / 2;
        const toCx = clubsRect.left + clubsRect.width / 2;
        const toCy = clubsRect.top + clubsRect.height / 2;

        cx = lerp(fromCx, toCx, atomProgressRef.current);
        cy = lerp(fromCy, toCy, atomProgressRef.current);
        size = lerp(heroRect.width, clubsRect.width, atomProgressRef.current);
      }

      floating.style.transform = `translate(${cx - CANVAS_INTRINSIC / 2}px, ${cy - CANVAS_INTRINSIC / 2}px)`;
      canvasWrap.style.transform = `scale(${size / CANVAS_INTRINSIC})`;

      /* ── Zoom phase overrides ── */
      if (
        (phaseRef.current === "zooming" || phaseRef.current === "zoomed") &&
        zoomAnimRef.current
      ) {
        const zoom = zoomAnimRef.current;
        const isNucleusZoom = zoom.slug === "executive-team";
        const duration = isNucleusZoom ? NUCLEUS_ZOOM_DURATION : ZOOM_DURATION;

        // Compute zoomed-state target transforms
        // canvasWrap uses transform-origin: center, so a canvas point (ex,ey) maps to
        // viewport as: vpX = floatX + halfC + (ex - halfC) * scale
        const zTargetScale = zoom.clubsScale * ZOOM_SCALE_FACTOR;
        const zTargetVpX = window.innerWidth * 0.18;
        const zTargetVpY = window.innerHeight * 0.5;
        const halfC = CANVAS_INTRINSIC / 2;
        const zoomedFloatX =
          zTargetVpX - halfC - (zoom.electronCanvasX - halfC) * zTargetScale;
        const zoomedFloatY =
          zTargetVpY - halfC - (zoom.electronCanvasY - halfC) * zTargetScale;

        if (phaseRef.current === "zoomed") {
          // Maintain final zoomed state
          rotationOffsetRef.current = zoom.targetRotation;
          if (isNucleusZoom) nucleusSeparationRef.current = 1;
          floating.style.transform = `translate(${zoomedFloatX}px, ${zoomedFloatY}px)`;
          canvasWrap.style.transform = `scale(${zTargetScale})`;
        } else {
          const zElapsed = now - zoom.startTime;
          const totalT = clamp01(zElapsed / duration);

          if (zoom.direction === "forward") {
            if (isNucleusZoom) {
              /* ═══ SPECIAL NUCLEUS SEPARATION ANIMATION ═══ */

              /* Phase 1 — Separation (0 → 0.30): orbits slide right, nucleus stays */
              const sepT = clamp01(totalT / 0.3);
              nucleusSeparationRef.current = easeInOutQuart(sepT);

              /* Phase 2 — Zoom into isolated nucleus (0.22 → 0.78) */
              const zoomT = clamp01((totalT - 0.22) / 0.56);
              const zEased = easeInOutQuart(zoomT);

              const curFloatX = lerp(zoom.clubsFloatX, zoomedFloatX, zEased);
              const curFloatY = lerp(zoom.clubsFloatY, zoomedFloatY, zEased);
              const curScale = lerp(zoom.clubsScale, zTargetScale, zEased);

              floating.style.transform = `translate(${curFloatX}px, ${curFloatY}px)`;
              canvasWrap.style.transform = `scale(${curScale})`;

              /* Phase 3 — Card reveal (0.72 → 1.0) */
              if (totalT > 0.72) {
                setCardRevealVisible(true);
              }

              if (totalT >= 1) {
                phaseRef.current = "zoomed";
              }
            } else {
              /* ═══ STANDARD ELECTRON ZOOM ═══ */

              /* Phase 1 — Rotation (0 → 0.35) */
              const rotT =
                zoom.targetRotation === 0 ? 1 : clamp01(totalT / 0.35);
              rotationOffsetRef.current =
                easeInOutQuart(rotT) * zoom.targetRotation;

              /* Phase 2 — Zoom (0.15 → 0.80) */
              const zoomT = clamp01((totalT - 0.15) / 0.65);
              const zEased = easeInOutQuart(zoomT);

              const curFloatX = lerp(zoom.clubsFloatX, zoomedFloatX, zEased);
              const curFloatY = lerp(zoom.clubsFloatY, zoomedFloatY, zEased);
              const curScale = lerp(zoom.clubsScale, zTargetScale, zEased);

              floating.style.transform = `translate(${curFloatX}px, ${curFloatY}px)`;
              canvasWrap.style.transform = `scale(${curScale})`;

              /* Phase 3 — Card reveal (0.72 → 1.0) */
              if (totalT > 0.72) {
                setCardRevealVisible(true);
              }

              if (totalT >= 1) {
                phaseRef.current = "zoomed";
              }
            }
          } else {
            /* ── REVERSE ── */
            if (isNucleusZoom) {
              /* ═══ REVERSE NUCLEUS SEPARATION ═══ */

              /* Phase 1 — Zoom reverse (0.05 → 0.60) */
              const zoomRevT = clamp01((totalT - 0.05) / 0.55);
              const zRevEased = easeInOutQuart(zoomRevT);

              const curFloatX = lerp(zoomedFloatX, zoom.clubsFloatX, zRevEased);
              const curFloatY = lerp(zoomedFloatY, zoom.clubsFloatY, zRevEased);
              const curScale = lerp(zTargetScale, zoom.clubsScale, zRevEased);

              floating.style.transform = `translate(${curFloatX}px, ${curFloatY}px)`;
              canvasWrap.style.transform = `scale(${curScale})`;

              /* Phase 2 — Rejoin: orbits come back (0.55 → 1.0) */
              const rejoinT = clamp01((totalT - 0.55) / 0.45);
              nucleusSeparationRef.current = 1 - easeInOutQuart(rejoinT);

              if (totalT >= 1) {
                phaseRef.current = "clubs";
                zoomAnimRef.current = null;
                rotationOffsetRef.current = 0;
                nucleusSeparationRef.current = 0;
                setSelectedClub(null);
                setCardRevealVisible(false);
              }
            } else {
              /* ═══ REVERSE STANDARD ═══ */

              /* Phase 1 — Zoom reverse (0.05 → 0.70) */
              const zoomRevT = clamp01((totalT - 0.05) / 0.65);
              const zRevEased = easeInOutQuart(zoomRevT);

              const curFloatX = lerp(zoomedFloatX, zoom.clubsFloatX, zRevEased);
              const curFloatY = lerp(zoomedFloatY, zoom.clubsFloatY, zRevEased);
              const curScale = lerp(zTargetScale, zoom.clubsScale, zRevEased);

              floating.style.transform = `translate(${curFloatX}px, ${curFloatY}px)`;
              canvasWrap.style.transform = `scale(${curScale})`;

              /* Phase 2 — Rotation reverse (0.50 → 1.0) */
              const rotRevT =
                zoom.targetRotation === 0 ? 1 : clamp01((totalT - 0.5) / 0.5);
              rotationOffsetRef.current =
                (1 - easeInOutQuart(rotRevT)) * zoom.targetRotation;

              if (totalT >= 1) {
                phaseRef.current = "clubs";
                zoomAnimRef.current = null;
                rotationOffsetRef.current = 0;
                setSelectedClub(null);
                setCardRevealVisible(false);
              }
            }
          }
        }
      }

      /* ── Clubs text visibility ── */
      const showText = posT > 0.55;
      if (showText !== prevShowTextRef.current) {
        prevShowTextRef.current = showText;
        setClubsTextVisible(showText);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  /* ── Wheel & touch handlers for section-snap ── */
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (
        phaseRef.current === "animating" ||
        phaseRef.current === "zooming" ||
        phaseRef.current === "zoomed"
      ) {
        e.preventDefault();
        return;
      }

      const clubsSection = document.getElementById("clubs");
      const aboutSection = document.getElementById("about");
      if (!clubsSection) return;

      const clubsAbsTop =
        clubsSection.getBoundingClientRect().top + window.scrollY;
      const clubsScrollY = clubsAbsTop - HEADER_H;

      // Hero → Clubs
      if (e.deltaY > 0 && phaseRef.current === "hero") {
        e.preventDefault();
        if (Math.abs(e.deltaY) >= 10) startTransition("clubs");
        return;
      }

      // Clubs → Hero / Clubs → About
      if (phaseRef.current === "clubs") {
        if (e.deltaY < 0) {
          if (window.scrollY <= clubsScrollY + 15) {
            e.preventDefault();
            if (Math.abs(e.deltaY) >= 10) startTransition("hero");
          }
        } else if (e.deltaY > 0) {
          e.preventDefault();
          if (Math.abs(e.deltaY) >= 10) startTransition("about");
        }
        return;
      }

      // About → Clubs
      if (e.deltaY < 0 && phaseRef.current === "about" && aboutSection) {
        const aRect = aboutSection.getBoundingClientRect();
        const sectionScrolled = -(aRect.top - HEADER_H);

        // 👇 FIX: Only snap back if we're at the very top edge (within 5px)
        if (sectionScrolled <= 5) {
          e.preventDefault();
          if (Math.abs(e.deltaY) >= 10) startTransition("clubs");
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = e.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartRef.current === null) return;
      const deltaY = touchStartRef.current - (e.touches[0]?.clientY ?? 0);

      if (
        phaseRef.current === "animating" ||
        phaseRef.current === "zooming" ||
        phaseRef.current === "zoomed"
      ) {
        e.preventDefault();
        return;
      }

      const clubsSection = document.getElementById("clubs");
      const aboutSection = document.getElementById("about");
      if (!clubsSection) return;

      const clubsAbsTop =
        clubsSection.getBoundingClientRect().top + window.scrollY;
      const clubsScrollY = clubsAbsTop - HEADER_H;

      if (deltaY > 0 && phaseRef.current === "hero") {
        e.preventDefault();
        if (Math.abs(deltaY) >= 20) {
          startTransition("clubs");
          touchStartRef.current = null;
        }
      } else if (phaseRef.current === "clubs") {
        if (deltaY < 0) {
          if (window.scrollY <= clubsScrollY + 15) {
            e.preventDefault();
            if (Math.abs(deltaY) >= 20) {
              startTransition("hero");
              touchStartRef.current = null;
            }
          }
        } else if (deltaY > 0) {
          e.preventDefault();
          if (Math.abs(deltaY) >= 20) {
            startTransition("about");
            touchStartRef.current = null;
          }
        }
      } else if (deltaY < 0 && phaseRef.current === "about" && aboutSection) {
        const aRect = aboutSection.getBoundingClientRect();
        const sectionScrolled = -(aRect.top - HEADER_H);

        // 👇 FIX: Only snap back if we're at the very top edge (within 5px)
        if (sectionScrolled <= 5) {
          e.preventDefault();
          if (Math.abs(deltaY) >= 20) {
            startTransition("clubs");
            touchStartRef.current = null;
          }
        }
      }
    };

    const opts: AddEventListenerOptions = { capture: true, passive: false };
    window.addEventListener("wheel", handleWheel, opts);
    window.addEventListener("mousewheel", handleWheel as EventListener, opts);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, opts);

    return () => {
      window.removeEventListener("wheel", handleWheel, opts);
      window.removeEventListener(
        "mousewheel",
        handleWheel as EventListener,
        opts,
      );
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove, opts);
    };
  }, [startTransition]);

  /* ═══ FLAWLESS SCROLL OBSERVER FOR ABOUT SECTION ═══ */
  useEffect(() => {
    const panels = document.querySelectorAll(".about-panel");
    if (panels.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const node = parseInt(
              entry.target.getAttribute("data-node") || "0",
              10,
            );
            setActiveAboutNode(node);
          }
        });
      },
      {
        threshold: 0.5, // Triggers when 50% of the panel is visible
        rootMargin: "-10% 0px -10% 0px", // Tightens the trigger zone to the center of the screen
      },
    );

    panels.forEach((panel) => observer.observe(panel));

    return () => {
      panels.forEach((panel) => observer.unobserve(panel));
      observer.disconnect();
    };
  }, []);

  return (
    <div className="home-scroll-experience bg-bg">
      {/* ═══ CSS ANIMATIONS & DEBOSSED CARVED TEXT ═══ */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes flicker-in {
          0% { opacity: 0; }
          10% { opacity: 0.4; }
          15% { opacity: 0.1; }
          25% { opacity: 0.85; }
          35% { opacity: 0.2; }
          50% { opacity: 0.95; }
          60% { opacity: 0.45; }
          70% { opacity: 0.8; }
          80% { opacity: 0.6; }
          90% { opacity: 0.9; }
          100% { opacity: 1; }
        }
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(16px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-in-card {
          0% {
            opacity: 0;
            transform: translateX(-80px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-flicker-in {
          animation: flicker-in 1.4s ease-out forwards;
        }
        .animate-fade-in-delayed {
          opacity: 0;
          animation: fade-in-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 1.4s;
        }
        .animate-slide-in-card {
          animation: slide-in-card 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        /* Debossed/Carved Text Effects */
        .text-carved-dark {
          color: rgba(255, 255, 255, 0.9);
          text-shadow: -1px -1px 0.5px rgba(0, 0, 0, 0.9), 1px 1px 0.5px rgba(255, 255, 255, 0.15);
        }
        .text-carved-light {
          color: rgba(1, 31, 91, 0.9);
          text-shadow: -1px -1px 0.5px rgba(0, 0, 0, 0.3), 1px 1px 0.5px rgba(255, 255, 255, 0.6);
        }
        
        /* Premium Metallic Card Styling */
        .metallic-card {
          position: relative;
          overflow: hidden;
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .metallic-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: -150%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0) 10%,
            rgba(255, 255, 255, 0.08) 35%,
            rgba(255, 255, 255, 0.18) 50%,
            rgba(255, 255, 255, 0.08) 65%,
            rgba(255, 255, 255, 0) 90%,
            transparent
          );
          transform: skewX(-25deg);
          transition: left 0.85s cubic-bezier(0.25, 1, 0.5, 1);
          pointer-events: none;
          z-index: 10;
        }
        
        .metallic-card:hover::before {
          left: 150%;
        }

        .metallic-card-gold {
          border: 1px solid rgba(255, 255, 255, 0.45);
          box-shadow: 
            inset 0 1.5px 0.5px rgba(255, 255, 255, 0.5),
            inset 0 -1.5px 1px rgba(0, 0, 0, 0.12),
            0 12px 28px -4px rgba(0, 0, 0, 0.15),
            0 20px 40px -15px rgba(212, 163, 115, 0.25);
        }

        .metallic-card-standard {
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 
            inset 0 1.5px 0.5px rgba(255, 255, 255, 0.22),
            inset 0 -1.5px 1px rgba(0, 0, 0, 0.3),
            0 12px 28px -4px rgba(0, 0, 0, 0.25);
        }

        @keyframes projector-flicker {
          0%, 100% { opacity: 0.85; }
          5% { opacity: 0.70; }
          10% { opacity: 0.90; }
          17% { opacity: 0.75; }
          25% { opacity: 0.95; }
          30% { opacity: 0.80; }
          45% { opacity: 0.98; }
          55% { opacity: 0.82; }
          68% { opacity: 0.90; }
          75% { opacity: 0.78; }
          85% { opacity: 0.95; }
          92% { opacity: 0.85; }
        }
        .projector-beam {
          animation: projector-flicker 4s ease-in-out infinite;
          mix-blend-mode: screen;
          transform-origin: left center;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes edge-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .projector-edge-line {
          animation: edge-glow 2s ease-in-out infinite;
        }

        /* ═══ About Section Panel Animations ═══ */
        .about-panel-active {
          opacity: 1;
          transform: translateY(0) scale(1);
          transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .about-panel-inactive {
          opacity: 0.08;
          transform: translateY(20px) scale(0.97);
          transition: opacity 0.5s ease-out, transform 0.5s ease-out;
        }
        @keyframes about-heading-glow {
          0%, 100% { text-shadow: 0 0 20px rgba(120, 180, 255, 0.2); }
          50% { text-shadow: 0 0 35px rgba(120, 180, 255, 0.35); }
        }
        .about-heading-glow {
          animation: about-heading-glow 3s ease-in-out infinite;
        }

        /* ═══ KINETIC SPINE: Premium About Section Animations ═══ */
@keyframes spine-pulse {
  0%, 100% { opacity: 0.3; transform: scaleY(1); }
  50% { opacity: 0.6; transform: scaleY(1.05); }
}

@keyframes node-glow {
  0%, 100% { box-shadow: 0 0 15px rgba(212, 163, 115, 0.3), 0 0 30px rgba(212, 163, 115, 0.1); }
  50% { box-shadow: 0 0 25px rgba(212, 163, 115, 0.6), 0 0 50px rgba(212, 163, 115, 0.2); }
}

@keyframes draw-line {
  to { stroke-dashoffset: 0; }
}

.kinetic-spine-node {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.kinetic-spine-node.active {
  transform: scale(1.15);
}

.kinetic-spine-node.active .node-core {
  background: linear-gradient(135deg, #fff8c0 0%, #D4A373 50%, #b07d10 100%);
  box-shadow: 0 0 20px rgba(212, 163, 115, 0.6), 0 0 40px rgba(212, 163, 115, 0.3);
  border-color: #fff8c0;
}

.kinetic-spine-node.active .node-label {
  color: #D4A373;
  font-weight: 700;
  transform: translateX(8px);
}

.connector-line {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  transition: stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
  opacity: 0;
}

.connector-line.active {
  stroke-dashoffset: 0;
  opacity: 1;
}
      `,
        }}
      />

      {/* ═══ HERO ═══ */}
      <div className="[&_.hero-atom-origin]:invisible">
        <Hero />
      </div>

      {/* ═══ CLUBS SECTION ═══ */}
      <section
        id="clubs"
        className="relative flex min-h-[calc(100svh-4rem)] scroll-mt-16 overflow-hidden bg-white px-6 py-12 sm:px-8 lg:px-10"
      >
        <div className="mx-auto grid w-full max-w-7xl grid-rows-[1fr_auto] items-center gap-8 lg:grid-cols-2 lg:grid-rows-1 lg:gap-10">
          {/* Left column – sizing placeholder for atom */}
          <div className="flex min-h-[42svh] items-center justify-center lg:min-h-0">
            <div
              ref={clubsAnchorRef}
              className="relative flex aspect-square w-[min(78vw,25rem)] items-center justify-center sm:w-[30rem] lg:w-[34rem]"
            />
          </div>

          {/* Right column – dynamic interactive area */}
          <div
            className={`relative flex min-h-[34svh] items-center justify-center lg:min-h-0 transition-all duration-700 ease-out ${
              selectedClub ? "z-[60]" : "z-10"
            } ${
              clubsTextVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            {/* 1. Default Heading - Fades out slowly and moves to the right when a club is selected */}
            <div
              className={`flex flex-col items-center justify-center text-center transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${
                selectedClub
                  ? "opacity-0 translate-x-[80px] pointer-events-none absolute"
                  : "opacity-100 translate-x-0"
              }`}
            >
              <h2 className="font-display text-[clamp(3.5rem,11vw,8.5rem)] font-black leading-[0.88] text-primary">
                Our
                <span className="block text-accent">Clubs.</span>
              </h2>
              <p className="mt-4 font-body text-slate-400 text-sm font-medium animate-pulse">
                Click any electron node or the nucleus to explore
              </p>
            </div>

            {/* 2. Selected Club Details - Premium Credit Card Aesthetic (Spacious & Clean Layout) */}
            <div
              ref={cardWrapperRef}
              className={`transition-all duration-500 ease-out ${
                cardRevealVisible
                  ? "opacity-100 translate-x-0 scale-100"
                  : "opacity-0 translate-x-10 scale-[0.97] pointer-events-none"
              }`}
              style={{ willChange: "transform, opacity" }}
            >
              {CLUBS_DETAILS.map((club) => {
                const isActive = selectedClub === club.slug;
                if (!isActive) return null;

                // Special Luxury Golden Executive Card (Nucleus) - Simplified Clean gold background
                if (club.isSpecial) {
                  return (
                    <div
                      key={club.slug}
                      className="animate-slide-in-card metallic-card metallic-card-gold relative flex flex-col justify-between pt-10 pb-6 px-10 sm:pt-12 sm:pb-8 sm:px-12 rounded-3xl bg-accent w-full max-w-lg min-h-[460px] overflow-hidden"
                    >
                      {/* Left connection indicator - emerges from the orbit */}
                      <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-primary/20" />

                      {/* Close / Dismiss button at top right */}
                      <button
                        onClick={handleCloseClub}
                        className="absolute top-6 right-6 p-2 rounded-full text-primary/60 hover:text-primary hover:bg-primary/5 transition-all duration-200 z-20"
                        aria-label="Back to clubs"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>

                      <div className="flex flex-col h-full justify-between gap-6">
                        {/* Header Area */}
                        <div>
                          {/* Category Indicator & Icon */}
                          <div className="flex items-center gap-2 mb-2.5 opacity-90 animate-flicker-in">
                            <ClubIcon
                              name={club.iconName}
                              className="w-4 h-4 text-primary/70"
                            />
                            <span className="text-[11px] font-bold tracking-[0.2em] text-primary/75 uppercase font-body">
                              {club.category}
                            </span>
                          </div>

                          {/* Large Title */}
                          <h3 className="animate-flicker-in text-carved-light font-display text-4xl sm:text-5xl font-black mb-6 tracking-tight">
                            {club.name}
                          </h3>

                          {/* Club Tags / Themes */}
                          <div className="animate-fade-in-delayed flex flex-wrap gap-x-2 gap-y-1 text-xs font-semibold text-slate-800/80 font-body">
                            {club.themes.map((theme, i) => (
                              <span key={theme} className="flex items-center">
                                {theme}
                                {i < club.themes.length - 1 && (
                                  <span className="ml-2 mr-0.5 opacity-60">
                                    •
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Description */}
                        <div className="flex-grow flex items-center">
                          <p className="animate-fade-in-delayed font-body text-slate-800 text-sm sm:text-base leading-relaxed max-w-md font-medium">
                            {club.tagline}
                          </p>
                        </div>

                        {/* Club Information Row */}
                        <div className="animate-fade-in-delayed border-t border-primary/10 pt-5 mt-auto">
                          <div className="grid grid-cols-3 gap-4">
                            {club.info.map((item) => (
                              <div key={item.label}>
                                <div className="text-[10px] uppercase tracking-wider text-primary/65 font-body font-semibold">
                                  {item.label}
                                </div>
                                <div className="text-sm sm:text-base font-black font-display text-slate-900 mt-0.5">
                                  {item.value}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action Area */}
                        <div className="animate-fade-in-delayed w-full mt-0">
                          <Link
                            href="#executive-team"
                            className="inline-flex items-center justify-center w-full bg-primary hover:bg-primary/95 text-white text-sm font-bold tracking-wide px-8 py-3.5 rounded-xl transition-all duration-300 active:scale-95 shadow-[0_4px_12px_rgba(2,59,142,0.15)] font-body"
                          >
                            Meet the Executive Team
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Standard Club Cards - Simplified Clean primary deep navy background
                return (
                  <div
                    key={club.slug}
                    className="animate-slide-in-card metallic-card metallic-card-standard relative flex flex-col justify-between pt-10 pb-6 px-10 sm:pt-12 sm:pb-8 sm:px-12 rounded-3xl bg-primary w-full max-w-lg min-h-[460px] overflow-hidden"
                    style={{
                      boxShadow: `inset 0 1.5px 0.5px rgba(255, 255, 255, 0.22), inset 0 -1.5px 1px rgba(0, 0, 0, 0.3), 0 12px 28px -4px rgba(0, 0, 0, 0.25), 0 15px 35px -5px ${club.color}25`,
                    }}
                  >
                    {/* Left connection indicator - emerges from the orbit */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-[4px]"
                      style={{ backgroundColor: club.color }}
                    />

                    {/* Close / Dismiss button at top right */}
                    <button
                      onClick={handleCloseClub}
                      className="absolute top-6 right-6 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/8 transition-all duration-200 z-20"
                      aria-label="Back to clubs"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>

                    <div className="flex flex-col h-full justify-between gap-6">
                      {/* Header Area */}
                      <div>
                        {/* Category Indicator & Icon */}
                        <div className="flex items-center gap-2 mb-2.5 opacity-90 animate-flicker-in">
                          <ClubIcon
                            name={club.iconName}
                            className="w-4 h-4 text-white/70"
                          />
                          <span className="text-[11px] font-bold tracking-[0.2em] text-white/60 uppercase font-body">
                            {club.category}
                          </span>
                        </div>

                        {/* Large Title */}
                        <h3 className="animate-flicker-in text-carved-dark font-display text-4xl sm:text-5xl font-black mb-6 tracking-tight">
                          {club.name}
                        </h3>

                        {/* Club Tags / Themes */}
                        <div className="animate-fade-in-delayed flex flex-wrap gap-x-2 gap-y-1 text-xs font-medium text-slate-300/80 font-body">
                          {club.themes.map((theme, i) => (
                            <span key={theme} className="flex items-center">
                              {theme}
                              {i < club.themes.length - 1 && (
                                <span className="ml-2 mr-0.5 opacity-60">
                                  •
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Description */}
                      <div className="flex-grow flex items-center">
                        <p className="animate-fade-in-delayed font-body text-slate-200/90 text-sm sm:text-base leading-relaxed max-w-md">
                          {club.tagline}
                        </p>
                      </div>

                      {/* Club Information Row */}
                      <div className="animate-fade-in-delayed border-t border-white/10 pt-5 mt-auto">
                        <div className="grid grid-cols-3 gap-4">
                          {club.info.map((item) => (
                            <div key={item.label}>
                              <div className="text-[10px] uppercase tracking-wider text-white/45 font-body font-semibold">
                                {item.label}
                              </div>
                              <div className="text-sm sm:text-base font-bold font-display text-white mt-0.5">
                                {item.value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Area */}
                      <div className="animate-fade-in-delayed w-full mt-0">
                        <Link
                          href={`/clubs/${club.slug}`}
                          className="inline-flex items-center justify-center w-full bg-white hover:bg-slate-100 text-primary text-sm font-bold tracking-wide px-8 py-3.5 rounded-xl transition-all duration-300 active:scale-95 shadow-[0_4px_12px_rgba(255,255,255,0.15)] font-body"
                        >
                          Explore Club Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ABOUT SECTION: Kinetic Spine ═══ */}
      <section id="about" className="relative bg-white overflow-hidden">
        <div className="mx-auto w-full max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-0 lg:gap-16">
            {/* ── LEFT COLUMN: Sticky Kinetic Spine ── */}
            <div className="hidden lg:flex sticky top-16 h-[calc(100svh-4rem)] items-center justify-center px-6">
              <div className="relative flex flex-col items-center w-full max-w-md h-full py-20">
                {/* ═══ PREMIUM DNA DOUBLE HELIX — Mathematically Precise ═══ */}
                <DNAHelix activeNode={activeAboutNode} />

                {/* 3 Interactive Nodes (Aligned perfectly with Canvas TIMELINE_NODES) */}
                <div className="relative z-10 flex flex-col justify-between h-full w-full py-10">
                  {["Our Origin", "Our Vision", "The Legacy"].map(
                    (label, idx) => (
                      <div
                        key={label}
                        className={`kinetic-spine-node flex items-center gap-4 ${activeAboutNode === idx ? "active" : ""}`}
                      >
                        {/* Node Core (Matches Canvas drawTimelineNode) */}
                        <div className="node-core relative w-5 h-5 rounded-full border-2 border-slate-300 bg-white transition-all duration-500" />

                        {/* Node Label */}
                        <span className="node-label text-sm font-display font-semibold text-slate-400 tracking-wide transition-all duration-500">
                          {label}
                        </span>

                        {/* Animated Connector Line */}
                        <svg className="absolute left-6 top-2.5 w-40 h-4 pointer-events-none overflow-visible">
                          <line
                            x1="0"
                            y1="0"
                            x2="150"
                            y2="0"
                            stroke="#D4A373"
                            strokeWidth="2"
                            className={`connector-line ${activeAboutNode === idx ? "active" : ""}`}
                          />
                          <circle
                            cx="150"
                            cy="0"
                            r="3"
                            fill="#D4A373"
                            className={`transition-opacity duration-500 ${activeAboutNode === idx ? "opacity-100" : "opacity-0"}`}
                          />
                        </svg>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Scrollable Narrative Panels ── */}
            <div className="flex flex-col px-6 sm:px-8 lg:px-4">
              {/* Panel 0: Our Origin */}
              <div
                data-node="0"
                className="about-panel min-h-[calc(100svh-4rem)] flex items-center justify-center py-16"
              >
                <div
                  className={`metallic-card metallic-card-standard relative flex flex-col justify-between pt-10 pb-8 px-8 sm:px-10 rounded-3xl bg-primary w-full max-w-xl min-h-[420px] overflow-hidden transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${activeAboutNode === 0 ? "opacity-100 translate-y-0 scale-100" : "opacity-40 translate-y-8 scale-[0.98]"}`}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-white/20" />
                  <div className="flex flex-col h-full justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2 opacity-95">
                        <ClubIcon
                          name="BookOpen"
                          className="w-4 h-4 text-white/70"
                        />
                        <span className="text-[11px] font-bold tracking-[0.2em] text-white/60 uppercase font-body">
                          History & Heritage
                        </span>
                      </div>
                      <h3
                        className={`font-display text-3xl sm:text-4xl font-black mb-2 tracking-tight text-carved-dark ${activeAboutNode === 0 ? "about-heading-glow" : ""}`}
                      >
                        Our Origin
                      </h3>
                      <p className="text-sm text-white/50 font-body font-semibold mb-6">
                        Where It All Began
                      </p>
                      <p className="font-body text-slate-200/90 text-sm sm:text-base leading-relaxed font-medium">
                        Founded in the heart of our institution, NSS Clubs began
                        as a small group of passionate students with a shared
                        dream — to create a vibrant community where every talent
                        finds its stage.
                      </p>
                    </div>
                    <div className="border-t border-white/10 pt-5 mt-auto">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-white/45 font-body font-semibold">
                            Founded
                          </div>
                          <div className="text-sm sm:text-base font-black font-display text-white mt-0.5">
                            2018
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-white/45 font-body font-semibold">
                            Founders
                          </div>
                          <div className="text-sm sm:text-base font-black font-display text-white mt-0.5">
                            12
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-white/45 font-body font-semibold">
                            First Event
                          </div>
                          <div className="text-sm sm:text-base font-black font-display text-white mt-0.5">
                            2019
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel 1: Our Vision */}
              <div
                data-node="1"
                className="about-panel min-h-[calc(100svh-4rem)] flex items-center justify-center py-16"
              >
                <div
                  className={`metallic-card metallic-card-standard relative flex flex-col justify-between pt-10 pb-8 px-8 sm:px-10 rounded-3xl bg-primary w-full max-w-xl min-h-[420px] overflow-hidden transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${activeAboutNode === 1 ? "opacity-100 translate-y-0 scale-100" : "opacity-40 translate-y-8 scale-[0.98]"}`}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-white/20" />
                  <div className="flex flex-col h-full justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2 opacity-95">
                        <ClubIcon
                          name="Heart"
                          className="w-4 h-4 text-white/70"
                        />
                        <span className="text-[11px] font-bold tracking-[0.2em] text-white/60 uppercase font-body">
                          Mission & Purpose
                        </span>
                      </div>
                      <h3
                        className={`font-display text-3xl sm:text-4xl font-black mb-2 tracking-tight text-carved-dark ${activeAboutNode === 1 ? "about-heading-glow" : ""}`}
                      >
                        Our Vision
                      </h3>
                      <p className="text-sm text-white/50 font-body font-semibold mb-6">
                        What Drives Us Forward
                      </p>
                      <p className="font-body text-slate-200/90 text-sm sm:text-base leading-relaxed font-medium">
                        We envision a campus where creativity knows no
                        boundaries, where a scientist can paint, a dancer can
                        code, and a writer can score goals. NSS Clubs exist to
                        blur the lines between disciplines.
                      </p>
                    </div>
                    <div className="border-t border-white/10 pt-5 mt-auto">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-white/45 font-body font-semibold">
                            Clubs
                          </div>
                          <div className="text-sm sm:text-base font-black font-display text-white mt-0.5">
                            6
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-white/45 font-body font-semibold">
                            Events/Year
                          </div>
                          <div className="text-sm sm:text-base font-black font-display text-white mt-0.5">
                            50+
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-white/45 font-body font-semibold">
                            Impact
                          </div>
                          <div className="text-sm sm:text-base font-black font-display text-white mt-0.5">
                            1000+
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel 2: The Legacy */}
              <div
                data-node="2"
                className="about-panel min-h-[calc(100svh-4rem)] flex items-center justify-center py-16"
              >
                <div
                  className={`metallic-card metallic-card-standard relative flex flex-col justify-between pt-10 pb-8 px-8 sm:px-10 rounded-3xl bg-primary w-full max-w-xl min-h-[420px] overflow-hidden transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${activeAboutNode === 2 ? "opacity-100 translate-y-0 scale-100" : "opacity-40 translate-y-8 scale-[0.98]"}`}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-white/20" />
                  <div className="flex flex-col h-full justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2 opacity-95">
                        <ClubIcon
                          name="Shield"
                          className="w-4 h-4 text-white/70"
                        />
                        <span className="text-[11px] font-bold tracking-[0.2em] text-white/60 uppercase font-body">
                          Leadership & Vision
                        </span>
                      </div>
                      <h3
                        className={`font-display text-3xl sm:text-4xl font-black mb-2 tracking-tight text-carved-dark ${activeAboutNode === 2 ? "about-heading-glow" : ""}`}
                      >
                        The Legacy
                      </h3>
                      <p className="text-sm text-white/50 font-body font-semibold mb-6">
                        Building Tomorrow's Leaders
                      </p>

                      {/* President's Message & Photo (OPTIMIZED) */}
                      <div className="flex flex-col sm:flex-row gap-6 items-start">
                        {data?.presidentPhoto && (
                          <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 overflow-hidden rounded-2xl border border-white/15 shadow-sm bg-white/10">
                            <Image
                              src={urlFor(data.presidentPhoto)
                                .width(256)
                                .height(256)
                                .fit("crop")
                                .auto("format")
                                .url()}
                              alt="President Photo"
                              width={128}
                              height={128}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}
                        <p className="font-body text-slate-200/90 text-sm sm:text-base leading-relaxed font-medium italic whitespace-pre-wrap">
                          &ldquo;{data?.presidentMessage}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Legacy Stats Grid */}
                    {data?.legacyStats && data.legacyStats.length > 0 && (
                      <div className="border-t border-white/10 pt-6 mt-auto">
                        <div className="grid grid-cols-3 gap-4 text-center sm:text-left">
                          {data.legacyStats.map((stat) => (
                            <div key={stat._key}>
                              <div className="text-[10px] uppercase tracking-wider text-white/45 font-body font-semibold">
                                {stat.label}
                              </div>
                              <div className="text-xl sm:text-2xl font-black font-display text-white mt-0.5">
                                {stat.value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SINGLE FLOATING ATOM ═══ */}
      <div
        ref={floatingRef}
        className="fixed top-0 left-0 z-50 pointer-events-none"
        style={{
          width: CANVAS_INTRINSIC,
          height: CANVAS_INTRINSIC,
          willChange: "transform",
          opacity: 0,
        }}
      >
        <div
          ref={canvasWrapRef}
          className="origin-center"
          style={{
            width: CANVAS_INTRINSIC,
            height: CANVAS_INTRINSIC,
            willChange: "transform",
          }}
        >
          {/* pointer-events-auto so listeners on canvas work! */}
          <div className="pointer-events-auto">
            <HeroAtom
              progressRef={atomProgressRef}
              rotationOffsetRef={rotationOffsetRef}
              nucleusSeparationRef={nucleusSeparationRef}
              aboutProgressRef={aboutProgressRef}
              activeAboutNodeRef={activeAboutNodeRef}
              onElectronClick={handleElectronClick}
            />
          </div>
        </div>
      </div>

      {/* ═══ PROJECTOR BEAM EFFECT ═══ */}
      {projectorCoords &&
        (cardRevealVisible || phaseRef.current === "about") &&
        (() => {
          const activeClubData = CLUBS_DETAILS.find(
            (c) => c.slug === selectedClub,
          );
          const connectorColor = activeClubData
            ? activeClubData.color
            : "#023B8E";
          const isAboutProjector = phaseRef.current === "about";
          return (
            <svg
              className="fixed top-0 left-0 w-full h-full pointer-events-none z-40 transition-opacity duration-700 ease-out animate-flicker-in"
              style={{ opacity: cardRevealVisible || isAboutProjector ? 1 : 0 }}
            >
              <defs>
                <linearGradient
                  id="projector-beam-grad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop
                    offset="0%"
                    stopColor={connectorColor}
                    stopOpacity="0.22"
                  />
                  <stop
                    offset="40%"
                    stopColor={connectorColor}
                    stopOpacity="0.08"
                  />
                  <stop
                    offset="100%"
                    stopColor={connectorColor}
                    stopOpacity="0.02"
                  />
                </linearGradient>
              </defs>
              {/* Holographic Light Cone */}
              <polygon
                points={`${projectorCoords.x1},${projectorCoords.y1} ${projectorCoords.x2},${projectorCoords.y2} ${projectorCoords.x3},${projectorCoords.y3}`}
                fill="url(#projector-beam-grad)"
                className="projector-beam"
              />
              {/* Glowing Laser Border at the Card Edge */}
              <line
                x1={projectorCoords.x2}
                y1={projectorCoords.y2}
                x2={projectorCoords.x3}
                y2={projectorCoords.y3}
                stroke={connectorColor}
                strokeWidth="2"
                className="projector-edge-line"
                opacity="0.85"
              />
              {/* Glowing origin circle at the electron / nucleus */}
              <circle
                cx={projectorCoords.x1}
                cy={projectorCoords.y1}
                r="5"
                fill={connectorColor}
                opacity="0.9"
              />
              <circle
                cx={projectorCoords.x1}
                cy={projectorCoords.y1}
                r="10"
                stroke={connectorColor}
                strokeWidth="1"
                fill="none"
                className="animate-ping"
                style={{
                  transformOrigin: `${projectorCoords.x1}px ${projectorCoords.y1}px`,
                }}
              />
            </svg>
          );
        })()}

      <span className="sr-only" aria-live="polite">
        {phaseRef.current === "animating" ? "Moving between sections" : ""}
      </span>
    </div>
  );
}
