"use client";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import type { FeaturedEvent } from "@/sanity/lib/types";

/* ═══════════════════════════════════════════════════════════
   CONSTELLATION DOT DEFINITIONS — 18 total, hardcoded
   14 background dots (r=1.5), 4 anchor dots (r=2.8), 1 gold dot (r=2)
   ════════════════════════════════════════════════════════════ */

interface ConstellationDot {
  id: number;
  cx: number; // viewBox x (0–1000)
  cy: number; // viewBox y (0–600)
  r: number;
  opacity: number;
  fill: string;
  isAnchor: boolean;
  isMobileVisible: boolean;
}

// Dots distributed: top 30% (y 0–180), middle 40% (y 180–420), bottom 30% (y 420–600)
// Center column (~330–670 x) is sparser; edges denser
const DOTS: ConstellationDot[] = [
  // ── ANCHOR DOTS (4) — near corners, r=2.8 ──
  { id: 0,  cx: 80,  cy: 72,  r: 2.8, opacity: 0.32, fill: "#1a3378", isAnchor: true,  isMobileVisible: true },
  { id: 1,  cx: 910, cy: 48,  r: 2.8, opacity: 0.32, fill: "#1a3378", isAnchor: true,  isMobileVisible: true },
  { id: 2,  cx: 60,  cy: 528, r: 2.8, opacity: 0.32, fill: "#1a3378", isAnchor: true,  isMobileVisible: true },
  { id: 3,  cx: 930, cy: 546, r: 2.8, opacity: 0.32, fill: "#1a3378", isAnchor: true,  isMobileVisible: true },

  // ── GOLD DOT (1) — upper-right quadrant, r=2 ──
  { id: 4,  cx: 780, cy: 108, r: 2.0, opacity: 0.4,  fill: "#c8903a", isAnchor: false, isMobileVisible: true },

  // ── BACKGROUND DOTS (13) — r=1.5, spread across section ──
  // Top band (y 0–180)
  { id: 5,  cx: 220, cy: 36,  r: 1.5, opacity: 0.18, fill: "#1a3378", isAnchor: false, isMobileVisible: true },
  { id: 6,  cx: 680, cy: 24,  r: 1.5, opacity: 0.18, fill: "#1a3378", isAnchor: false, isMobileVisible: true },
  { id: 7,  cx: 140, cy: 144, r: 1.5, opacity: 0.18, fill: "#1a3378", isAnchor: false, isMobileVisible: true },
  { id: 8,  cx: 850, cy: 132, r: 1.5, opacity: 0.18, fill: "#1a3378", isAnchor: false, isMobileVisible: false },

  // Middle band (y 180–420)
  { id: 9,  cx: 40,  cy: 288, r: 1.5, opacity: 0.18, fill: "#1a3378", isAnchor: false, isMobileVisible: true },
  { id: 10, cx: 960, cy: 252, r: 1.5, opacity: 0.18, fill: "#1a3378", isAnchor: false, isMobileVisible: false },
  { id: 11, cx: 180, cy: 348, r: 1.5, opacity: 0.18, fill: "#1a3378", isAnchor: false, isMobileVisible: false },
  { id: 12, cx: 820, cy: 372, r: 1.5, opacity: 0.18, fill: "#1a3378", isAnchor: false, isMobileVisible: false },
  { id: 13, cx: 250, cy: 240, r: 1.5, opacity: 0.18, fill: "#1a3378", isAnchor: false, isMobileVisible: true },

  // Bottom band (y 420–600)
  { id: 14, cx: 120, cy: 456, r: 1.5, opacity: 0.18, fill: "#1a3378", isAnchor: false, isMobileVisible: false },
  { id: 15, cx: 880, cy: 468, r: 1.5, opacity: 0.18, fill: "#1a3378", isAnchor: false, isMobileVisible: false },
  { id: 16, cx: 300, cy: 552, r: 1.5, opacity: 0.18, fill: "#1a3378", isAnchor: false, isMobileVisible: false },
  { id: 17, cx: 720, cy: 510, r: 1.5, opacity: 0.18, fill: "#1a3378", isAnchor: false, isMobileVisible: false },
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
  { from: 0, to: 5,  isMobileVisible: true },   // top-left anchor → nearby star
  { from: 5, to: 7,  isMobileVisible: true },   // left edge chain
  { from: 7, to: 13, isMobileVisible: true },   // descend left
  { from: 13, to: 9, isMobileVisible: true },   // across to far left
  { from: 9, to: 2,  isMobileVisible: true },   // down to bottom-left anchor
  { from: 1, to: 4,  isMobileVisible: true },   // top-right anchor → gold dot
  { from: 4, to: 6,  isMobileVisible: false },  // gold → nearby top star
  { from: 6, to: 1,  isMobileVisible: false },  // triangle top-right
  { from: 12, to: 3, isMobileVisible: false },  // right mid → bottom-right anchor
  { from: 11, to: 14, isMobileVisible: false }, // left mid → left bottom
  { from: 15, to: 3, isMobileVisible: false },  // right bottom → anchor
];

// Pre-compute line lengths for stroke-dasharray
const LINE_LENGTHS = LINES.map((line) => {
  const from = DOTS[line.from];
  const to = DOTS[line.to];
  return Math.sqrt((to.cx - from.cx) ** 2 + (to.cy - from.cy) ** 2);
});

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════════════ */

interface EventsConstellationProps {
  events: FeaturedEvent[];
}

export default function EventsConstellation({ events }: EventsConstellationProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

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

        /* ── Dot entrance animation ── */
        @keyframes ec-dot-fade-in {
          from { opacity: 0; }
          to   { opacity: var(--ec-target-opacity); }
        }

        #events .ec-dot {
          opacity: 0;
        }
        #events.ec-animated .ec-dot {
          animation: ec-dot-fade-in 0.5s ease-out forwards;
        }

        /* ── Line draw animation (stroke-dashoffset) ── */
        @keyframes ec-line-draw {
          from { stroke-dashoffset: var(--ec-dash-length); }
          to   { stroke-dashoffset: 0; }
        }

        #events .ec-line {
          opacity: 0;
        }
        #events.ec-animated .ec-line {
          opacity: 1;
          stroke-dashoffset: var(--ec-dash-length);
          animation: ec-line-draw 0.8s ease-out forwards;
        }

        /* ── Mobile: hide desktop-only elements, quieter lines, faster animation ── */
        @media (max-width: 767px) {
          #events .ec-desktop-only { display: none; }

          #events.ec-animated .ec-line {
            stroke-opacity: 0.05;
            animation-duration: 0.55s;
          }
          #events.ec-animated .ec-dot {
            animation-duration: 0.35s;
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
        {/* Lines — drawn after dots are 60% visible
            Desktop: dots take ~2.16s (18×120ms). 60% ≈ 1.32s. Lines start at 1.32s, each +80ms.
            Mobile: dots take ~0.6s (10×60ms). Lines start at 0.72s, each +40ms.
            Total desktop: ~2.2s. Total mobile: ~1.2s. */}
        {LINES.map((line, i) => {
          const from = DOTS[line.from];
          const to = DOTS[line.to];
          const len = LINE_LENGTHS[i];

          // Desktop: start at 1.32s, stagger 80ms per line
          const desktopDelay = 1.32 + i * 0.08;
          // Mobile: start at 0.72s, stagger 40ms per line (only mobile-visible lines count)
          const mobileVisibleIndex = LINES.slice(0, i + 1).filter(l => l.isMobileVisible).length - 1;
          const mobileDelay = line.isMobileVisible ? 0.72 + mobileVisibleIndex * 0.04 : desktopDelay;

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
              strokeOpacity="0.08"
              strokeDasharray={len}
              className={`ec-line${!line.isMobileVisible ? " ec-desktop-only" : ""}`}
              style={{
                "--ec-dash-length": len,
                animationDelay: `${desktopDelay}s`,
              } as React.CSSProperties}
            />
          );
        })}

        {/* Dots — staggered fade-in, each 120ms apart (60ms on mobile) */}
        {DOTS.map((dot, i) => {
          const desktopDelay = i * 0.12;
          const mobileVisibleIndex = DOTS.slice(0, i + 1).filter(d => d.isMobileVisible).length - 1;
          const mobileDelay = dot.isMobileVisible ? mobileVisibleIndex * 0.06 : desktopDelay;

          return (
            <circle
              key={`dot-${dot.id}`}
              data-dot-id={dot.id}
              cx={dot.cx}
              cy={dot.cy}
              r={dot.r}
              fill={dot.fill}
              className={`ec-dot${!dot.isMobileVisible ? " ec-desktop-only" : ""}`}
              style={{
                "--ec-target-opacity": dot.opacity,
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

      {/* ── Mobile animation delay overrides ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 767px) {
          ${DOTS.filter(d => d.isMobileVisible).map((d, mi) => {
            return `#events .ec-dot[data-dot-id="${d.id}"] { animation-delay: ${mi * 0.06}s; }`;
          }).join("\n          ")}
          ${LINES.map((l, i) => {
            if (!l.isMobileVisible) return "";
            const mi = LINES.slice(0, i + 1).filter(x => x.isMobileVisible).length - 1;
            return `#events .ec-line[data-line-id="${i}"] { animation-delay: ${0.72 + mi * 0.04}s; }`;
          }).filter(Boolean).join("\n          ")}
        }
      ` }} />
    </section>
  );
}
