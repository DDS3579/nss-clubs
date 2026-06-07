"use client";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import type { FeaturedEvent } from "@/sanity/lib/types";

/* ═══════════════════════════════════════════════════════════
   CONSTELLATION DOT DEFINITIONS — 18 total, hardcoded
   14 background dots (r=1.5), 4 anchor dots (r=2.8), 1 gold dot (r=2)

   The anchor dots are "planet echoes" — they hold the structure.
   The gold dot is the "sun echo" — a single warm callback.
   Background dots are stardust that crystallizes between them.
   ════════════════════════════════════════════════════════════ */

export interface ConstellationDot {
  id: number;
  cx: number; // viewBox x (0–1000)
  cy: number; // viewBox y (0–600)
  r: number;
  opacity: number;
  fill: string;
  kind: "anchor" | "gold" | "bg"; // for animation variants
  isMobileVisible: boolean;
}

// Dots distributed: top 30% (y 0–180), middle 40% (y 180–420), bottom 30% (y 420–600)
// Center column (~330–670 x) is sparser; edges denser
export const DOTS: ConstellationDot[] = [
  // ── ANCHOR DOTS (4) — planet echoes near corners, r=2.8 ──
  { id: 0,  cx: 60,  cy: 80,  r: 2.8, opacity: 0.55, fill: "#1a3378", kind: "anchor", isMobileVisible: true },
  { id: 1,  cx: 920, cy: 60,  r: 2.8, opacity: 0.55, fill: "#1a3378", kind: "anchor", isMobileVisible: true },
  { id: 2,  cx: 70,  cy: 550, r: 2.8, opacity: 0.55, fill: "#1a3378", kind: "anchor", isMobileVisible: true },
  { id: 3,  cx: 910, cy: 560, r: 2.8, opacity: 0.55, fill: "#1a3378", kind: "anchor", isMobileVisible: true },

  // ── GOLD DOT (1) — sun echo, upper-right quadrant, r=2 ──
  { id: 4,  cx: 840, cy: 150, r: 2.0, opacity: 0.75, fill: "#c8903a", kind: "gold",   isMobileVisible: true },

  // ── BACKGROUND DOTS (13) — stardust, r=1.5 ──
  // Top band (y 0–180)
  { id: 5,  cx: 200, cy: 120, r: 1.5, opacity: 0.38, fill: "#1a3378", kind: "bg", isMobileVisible: true },
  { id: 6,  cx: 730, cy: 100, r: 1.5, opacity: 0.38, fill: "#1a3378", kind: "bg", isMobileVisible: true },
  { id: 7,  cx: 120, cy: 190, r: 1.5, opacity: 0.38, fill: "#1a3378", kind: "bg", isMobileVisible: true },
  { id: 8,  cx: 680, cy: 240, r: 1.5, opacity: 0.38, fill: "#1a3378", kind: "bg", isMobileVisible: true },

  // Middle band (y 180–420)
  { id: 9,  cx: 50,  cy: 320, r: 1.5, opacity: 0.38, fill: "#1a3378", kind: "bg", isMobileVisible: true },
  { id: 10, cx: 940, cy: 290, r: 1.5, opacity: 0.38, fill: "#1a3378", kind: "bg", isMobileVisible: true },
  { id: 11, cx: 190, cy: 400, r: 1.5, opacity: 0.38, fill: "#1a3378", kind: "bg", isMobileVisible: false },
  { id: 12, cx: 760, cy: 370, r: 1.5, opacity: 0.38, fill: "#1a3378", kind: "bg", isMobileVisible: true },
  { id: 13, cx: 260, cy: 260, r: 1.5, opacity: 0.38, fill: "#1a3378", kind: "bg", isMobileVisible: true },

  // Bottom band (y 420–600)
  { id: 14, cx: 110, cy: 460, r: 1.5, opacity: 0.38, fill: "#1a3378", kind: "bg", isMobileVisible: true },
  { id: 15, cx: 880, cy: 440, r: 1.5, opacity: 0.38, fill: "#1a3378", kind: "bg", isMobileVisible: false },
  { id: 16, cx: 240, cy: 520, r: 1.5, opacity: 0.38, fill: "#1a3378", kind: "bg", isMobileVisible: false },
  { id: 17, cx: 700, cy: 510, r: 1.5, opacity: 0.38, fill: "#1a3378", kind: "bg", isMobileVisible: false },
];

/* ═══════════════════════════════════════════════════════════
   CONSTELLATION LINE DEFINITIONS — 11 total
   4 dots remain isolated (ids 8, 10, 16, 17): distant stars
   ════════════════════════════════════════════════════════════ */

interface ConstellationLine {
  from: number;
  to: number;
  isMobileVisible: boolean;
}

const LINES: ConstellationLine[] = [
  // Left chain
  { from: 0, to: 5,  isMobileVisible: true },
  { from: 5, to: 7,  isMobileVisible: true },
  { from: 7, to: 9,  isMobileVisible: true },
  { from: 9, to: 13, isMobileVisible: true },
  { from: 13, to: 11, isMobileVisible: false },
  { from: 11, to: 14, isMobileVisible: false },
  { from: 14, to: 16, isMobileVisible: false },
  { from: 16, to: 2,  isMobileVisible: false },
  // Left mobile connector (connecting 14 to 2 on mobile since 16 is not mobile visible)
  { from: 14, to: 2,  isMobileVisible: true },

  // Right chain
  { from: 1, to: 6,  isMobileVisible: true },
  { from: 6, to: 4,  isMobileVisible: true },
  { from: 4, to: 8,  isMobileVisible: true },
  { from: 8, to: 10, isMobileVisible: true },
  { from: 10, to: 12, isMobileVisible: true },
  { from: 12, to: 15, isMobileVisible: false },
  { from: 15, to: 17, isMobileVisible: false },
  { from: 17, to: 3,  isMobileVisible: false },
  // Right mobile connector (connecting 12 to 3 on mobile since 15, 17 are not mobile visible)
  { from: 12, to: 3,  isMobileVisible: true },
];

// Pre-compute line lengths for stroke-dasharray
const LINE_LENGTHS = LINES.map((line) => {
  const from = DOTS[line.from];
  const to = DOTS[line.to];
  return Math.sqrt((to.cx - from.cx) ** 2 + (to.cy - from.cy) ** 2);
});

/* ═══════════════════════════════════════════════════════════
   DELAY COMPUTATION — Y-position-based for "exhale" cascade
   Top dots (nearest the solar system above) emerge first,
   cascading downward like planetary energy dispersing.
   ════════════════════════════════════════════════════════════ */

// Sort dot indices by Y position (ascending = top-first)
const SORTED_INDICES = DOTS
  .map((d, i) => ({ idx: i, cy: d.cy }))
  .sort((a, b) => a.cy - b.cy)
  .map(({ idx }) => idx);

// Assign delays: each 120ms stagger, ordered by Y position
const DOT_DELAYS: number[] = new Array(DOTS.length);
SORTED_INDICES.forEach((dotIdx, sortedPos) => {
  DOT_DELAYS[dotIdx] = sortedPos * 0.12; // 120ms stagger
});

// Mobile delays: only mobile-visible dots, 60ms stagger
const MOBILE_VISIBLE_SORTED = SORTED_INDICES.filter(i => DOTS[i].isMobileVisible);
const DOT_MOBILE_DELAYS: number[] = new Array(DOTS.length).fill(0);
MOBILE_VISIBLE_SORTED.forEach((dotIdx, sortedPos) => {
  DOT_MOBILE_DELAYS[dotIdx] = sortedPos * 0.06; // 60ms stagger
});

// Line delays: start after 60% of dots visible
// Desktop: 60% of 18 = ~11 dots. 11th sorted dot starts at 10 × 120ms = 1.2s
const LINE_START_DESKTOP = 1.2;
const LINE_START_MOBILE = 0.6; // 60% of 10 mobile dots = 6th, at 5×60ms = 0.3s + buffer

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════════════ */

interface EventsConstellationProps {
  events: FeaturedEvent[];
  morphedDotIds?: number[];
}

export default function EventsConstellation({
  events,
  morphedDotIds = [],
}: EventsConstellationProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const morphedDotSet = new Set(morphedDotIds);

  /* ── IntersectionObserver: trigger once at threshold 0.15 ── */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <section
      ref={sectionRef}
      id="events"
      className={`events-constellation-section${hasAnimated ? " ec-animated" : ""}`}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        /* ═══════════════════════════════════════════════════════════
           EVENTS CONSTELLATION — ALL STYLES SCOPED TO #events
           Solar System → Constellation transition motif
        ════════════════════════════════════════════════════════════ */
        #events.events-constellation-section {
          position: relative;
          overflow: hidden;
          background: #f8fafc;
          padding: 100px 0 80px;
        }

        /* ── Constellation SVG Container ── */
        #events .ec-constellation-svg {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          z-index: 0;
          pointer-events: none;
        }

        /* ═══════════════════════════════════════
           DOT ENTRANCE ANIMATIONS
           Three variants for the "exhale" feeling:
           - Anchor dots: dramatic pop (planet echoes)
           - Gold dot: warm glow pulse (sun echo)  
           - Background dots: quiet crystallization
           Uses transform: scale() for cross-browser SVG support.
        ═══════════════════════════════════════ */

        /* Background dots — quiet fade + scale from nothing */
        @keyframes ec-bg-emerge {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: calc(var(--ec-target-op) * 0.7);
          }
          100% {
            opacity: var(--ec-target-op);
            transform: scale(1);
          }
        }

        /* Anchor dots — planet echo, dramatic scale with overshoot */
        @keyframes ec-anchor-emerge {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          35% {
            opacity: calc(var(--ec-target-op) * 0.5);
            transform: scale(0.4);
          }
          65% {
            opacity: var(--ec-target-op);
            transform: scale(1.4);
          }
          85% {
            transform: scale(0.9);
          }
          100% {
            opacity: var(--ec-target-op);
            transform: scale(1);
          }
        }

        /* Gold dot — sun echo, warm glow pulse */
        @keyframes ec-gold-emerge {
          0% {
            opacity: 0;
            transform: scale(0);
            filter: drop-shadow(0 0 0px rgba(200, 144, 58, 0));
          }
          30% {
            opacity: 0.2;
            transform: scale(0.5);
          }
          55% {
            opacity: var(--ec-target-op);
            transform: scale(1.6);
            filter: drop-shadow(0 0 8px rgba(200, 144, 58, 0.6));
          }
          80% {
            transform: scale(0.85);
            filter: drop-shadow(0 0 3px rgba(200, 144, 58, 0.2));
          }
          100% {
            opacity: var(--ec-target-op);
            transform: scale(1);
            filter: drop-shadow(0 0 0px rgba(200, 144, 58, 0));
          }
        }

        /* Default state: invisible, centered transform origin for SVG */
        #events .ec-dot {
          opacity: 0;
          transform-origin: center;
          transform-box: fill-box;
          will-change: opacity, transform;
        }
        #events .ec-dot-pre-visible {
          opacity: var(--ec-target-op);
          transform: scale(1);
          animation: none !important;
        }

        /* ── Triggered state: run entrance once ── */
        #events.ec-animated .ec-dot-bg {
          animation: ec-bg-emerge 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        #events.ec-animated .ec-dot-anchor {
          animation: ec-anchor-emerge 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        #events.ec-animated .ec-dot-gold {
          animation: ec-gold-emerge 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* ═══════════════════════════════════════
           LINE DRAW ANIMATION
           stroke-dashoffset from full dash to 0
        ═══════════════════════════════════════ */
        @keyframes ec-line-draw {
          from { stroke-dashoffset: var(--ec-dash-len); opacity: 0.22; }
          to   { stroke-dashoffset: 0; opacity: 0.22; }
        }

        #events .ec-line {
          opacity: 0;
          will-change: stroke-dashoffset, opacity;
        }
        #events.ec-animated .ec-line {
          animation: ec-line-draw 0.65s ease-out forwards;
        }

        /* ═══════════════════════════════════════
           MOBILE OVERRIDES — quieter, faster
        ═══════════════════════════════════════ */
        @media (max-width: 767px) {
          #events .ec-desktop-only { display: none; }

          /* Lines quieter on mobile */
          @keyframes ec-line-draw-mobile {
            from { stroke-dashoffset: var(--ec-dash-len); opacity: 0.14; }
            to   { stroke-dashoffset: 0; opacity: 0.14; }
          }
          #events.ec-animated .ec-line {
            animation-name: ec-line-draw-mobile;
            animation-duration: 0.45s;
          }

          /* Dots faster on mobile */
          #events.ec-animated .ec-dot-bg {
            animation-duration: 0.4s;
          }
          #events.ec-animated .ec-dot-anchor {
            animation-duration: 0.5s;
          }
          #events.ec-animated .ec-dot-gold {
            animation-duration: 0.6s;
          }

          #events.events-constellation-section {
            padding: 60px 0 48px;
          }
        }

        /* ── Title ── */
        #events .ec-title {
          text-align: center;
          margin: 0 auto 56px;
          max-width: 700px;
          padding: 0 24px;
          position: relative;
          z-index: 1;
        }
        #events .ec-title h2 {
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 900;
          color: #0d2460;
          line-height: 1.1;
          margin: 0;
          letter-spacing: -0.02em;
        }
        #events .ec-title h2 em {
          font-style: italic;
          color: #c8903a;
        }
        #events .ec-title-sub {
          margin-top: 14px;
          font-size: 14px;
          color: #94a3b8;
          line-height: 1.6;
        }

        /* ── Events Grid ── */
        #events .ec-grid {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }

        @media (max-width: 1024px) {
          #events .ec-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 22px;
            padding: 0 24px;
          }
        }
        @media (max-width: 640px) {
          #events .ec-grid {
            grid-template-columns: 1fr;
            gap: 18px;
            padding: 0 16px;
          }
        }

        /* ── Event Cards ── */
        #events .ec-card {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(13, 36, 96, 0.06);
          box-shadow: 0 2px 12px rgba(13, 36, 96, 0.06);
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        #events .ec-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 28px rgba(13, 36, 96, 0.12);
        }

        #events .ec-card-img {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background: #e2e8f0;
        }
        #events .ec-card-img img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
        }

        #events .ec-card-body {
          padding: 20px 22px;
        }
        #events .ec-card-date {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #c8903a;
          margin-bottom: 8px;
        }
        #events .ec-card-title {
          font-size: 18px;
          font-weight: 800;
          color: #0d2460;
          line-height: 1.25;
          margin: 0;
          letter-spacing: -0.01em;
        }

        @media (max-width: 640px) {
          #events .ec-card-body { padding: 16px 18px; }
          #events .ec-card-title { font-size: 16px; }
          #events .ec-card-date { font-size: 10px; }
        }

        /* ── View All Link ── */
        #events .ec-view-all {
          display: flex;
          justify-content: center;
          margin-top: 40px;
          position: relative;
          z-index: 1;
        }
        #events .ec-view-all a {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 700;
          color: #0d2460;
          text-decoration: none;
          padding: 12px 28px;
          border-radius: 12px;
          border: 1.5px solid rgba(13, 36, 96, 0.12);
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(4px);
          transition: all 0.3s ease;
          letter-spacing: 0.02em;
        }
        #events .ec-view-all a:hover {
          background: #0d2460;
          color: #fff;
          border-color: #0d2460;
          box-shadow: 0 4px 16px rgba(13, 36, 96, 0.18);
        }
        #events .ec-view-all a svg {
          width: 16px; height: 16px;
          transition: transform 0.3s ease;
        }
        #events .ec-view-all a:hover svg {
          transform: translateX(3px);
        }
      ` }} />

      {/* ── Constellation SVG Background ── */}
      <svg
        className="ec-constellation-svg"
        viewBox="0 0 1000 600"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Lines — drawn after 60% of dots have started their entrance
            Desktop: line start at ~1.2s, each +70ms. Line animation 0.65s.
            Last line finishes at 1.2 + 10×0.07 + 0.65 = 2.55s (visual tail, main impact by 2.2s)
            Mobile: line start at 0.6s, each +40ms. */}
        {LINES.map((line, i) => {
          const from = DOTS[line.from];
          const to = DOTS[line.to];
          const len = LINE_LENGTHS[i];

          const desktopDelay = LINE_START_DESKTOP + i * 0.07;

          return (
            <line
              key={`line-${i}`}
              data-line-id={i}
              x1={from.cx}
              y1={from.cy}
              x2={to.cx}
              y2={to.cy}
              stroke="#1a3378"
              strokeWidth="0.6"
              strokeDasharray={len}
              className={`ec-line${!line.isMobileVisible ? " ec-desktop-only" : ""}`}
              style={{
                "--ec-dash-len": len,
                animationDelay: `${desktopDelay}s`,
              } as React.CSSProperties}
            />
          );
        })}

        {/* Dots — staggered by Y position (top-first = solar system exhale)
            Each dot uses a variant animation based on its kind:
            - anchor: dramatic pop with overshoot (planet echoes)
            - gold: warm glow pulse (sun echo)
            - bg: quiet crystallization (stardust) */}
        {DOTS.map((dot, i) => {
          const desktopDelay = DOT_DELAYS[i];
          const kindClass = dot.kind === "anchor" ? "ec-dot-anchor"
            : dot.kind === "gold" ? "ec-dot-gold"
            : "ec-dot-bg";
          const isMorphed = morphedDotSet.has(dot.id);

          return (
            <circle
              key={`dot-${dot.id}`}
              data-dot-id={dot.id}
              cx={dot.cx}
              cy={dot.cy}
              r={dot.r}
              fill={dot.fill}
              className={`ec-dot ${kindClass}${isMorphed ? " ec-dot-pre-visible" : ""}${!dot.isMobileVisible ? " ec-desktop-only" : ""}`}
              style={{
                "--ec-target-op": dot.opacity,
                animationDelay: `${desktopDelay}s`,
              } as React.CSSProperties}
            />
          );
        })}
      </svg>

      {/* ── Title ── */}
      <div className="ec-title">
        <h2 className="font-display">
          Upcoming <em>Events</em>
        </h2>
        <p className="ec-title-sub font-body">
          Mark your calendar for the experiences that shape our community.
        </p>
      </div>

      {/* ── Events Grid ── */}
      <div className="ec-grid">
        {events && events.length > 0 ? (
          events.slice(0, 6).map((event, idx) => (
            <div key={idx} className="ec-card">
              {event.coverImage && (
                <div className="ec-card-img">
                  <Image
                    src={urlFor(event.coverImage).width(640).height(360).fit("crop").auto("format").url()}
                    alt={event.title}
                    width={640}
                    height={360}
                    className="object-cover"
                  />
                </div>
              )}
              <div className="ec-card-body">
                {event.eventDate && (
                  <div className="ec-card-date font-body">
                    {new Date(event.eventDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                )}
                <h3 className="ec-card-title font-display">{event.title}</h3>
              </div>
            </div>
          ))
        ) : (
          /* Placeholder cards when no events are available */
          [1, 2, 3].map((i) => (
            <div key={i} className="ec-card">
              <div className="ec-card-img" style={{ background: "linear-gradient(135deg, #e2e8f0, #f1f5f9)" }} />
              <div className="ec-card-body">
                <div className="ec-card-date font-body">Coming Soon</div>
                <h3 className="ec-card-title font-display">Stay Tuned for Updates</h3>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── View All ── */}
      <div className="ec-view-all">
        <Link href="/events" className="font-body">
          View All Events
          <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>

      {/* ── Mobile animation delay overrides (faster timings) ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 767px) {
          ${DOTS.filter(d => d.isMobileVisible).map(d =>
            `#events .ec-dot[data-dot-id="${d.id}"] { animation-delay: ${DOT_MOBILE_DELAYS[d.id]}s; }`
          ).join("\n          ")}
          ${LINES.filter(l => l.isMobileVisible).map((l, mi) =>
            `#events .ec-line[data-line-id="${LINES.indexOf(l)}"] { animation-delay: ${LINE_START_MOBILE + mi * 0.04}s; }`
          ).join("\n          ")}
        }
      ` }} />
    </section>
  );
}
