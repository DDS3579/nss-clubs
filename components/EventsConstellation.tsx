"use client";
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatEventDate } from "@/lib/dates";
import { urlFor } from "@/sanity/lib/image";
import type { FeaturedEvent } from "@/sanity/lib/types";
import "./home/events-constellation.css";

/* ═══════════════════════════════════════════════════════════
   CONSTELLATION DOT DEFINITIONS — 18 total, hardcoded
   14 background dots, 4 anchor dots, 1 gold dot.

   The anchor dots are "planet echoes" — they hold the structure.
   The gold dot is the "sun echo" — a single warm callback.
   Background dots are stardust that crystallizes between them.

   cx / cy are positions on a 1000 x 600 design grid. The component maps
   them to the real size of the section, so shapes never get squashed.
   (useMorphCoordinates also reads this list, so the flying planets land
   exactly on these dots.)
   ════════════════════════════════════════════════════════════ */

export interface ConstellationDot {
  id: number;
  cx: number; // design grid x (0–1000)
  cy: number; // design grid y (0–600)
  r: number;
  opacity: number;
  fill: string;
  kind: "anchor" | "gold" | "bg"; // for animation variants
  isMobileVisible: boolean;
}

export const DOTS: ConstellationDot[] = [
  // ── ANCHOR DOTS (4) — planet echoes near corners ──
  { id: 0,  cx: 60,  cy: 80,  r: 2.8, opacity: 0.55, fill: "#1a3378", kind: "anchor", isMobileVisible: true },
  { id: 1,  cx: 920, cy: 60,  r: 2.8, opacity: 0.55, fill: "#1a3378", kind: "anchor", isMobileVisible: true },
  { id: 2,  cx: 70,  cy: 550, r: 2.8, opacity: 0.55, fill: "#1a3378", kind: "anchor", isMobileVisible: true },
  { id: 3,  cx: 910, cy: 560, r: 2.8, opacity: 0.55, fill: "#1a3378", kind: "anchor", isMobileVisible: true },

  // ── GOLD DOT (1) — sun echo, upper-right quadrant ──
  { id: 4,  cx: 840, cy: 150, r: 2.0, opacity: 0.75, fill: "#c8903a", kind: "gold",   isMobileVisible: true },

  // ── BACKGROUND DOTS (13) — stardust ──
  { id: 5,  cx: 200, cy: 120, r: 1.5, opacity: 0.38, fill: "#1a3378", kind: "bg", isMobileVisible: true },
  { id: 6,  cx: 730, cy: 100, r: 1.5, opacity: 0.38, fill: "#1a3378", kind: "bg", isMobileVisible: true },
  { id: 7,  cx: 120, cy: 190, r: 1.5, opacity: 0.38, fill: "#1a3378", kind: "bg", isMobileVisible: true },
  { id: 8,  cx: 680, cy: 240, r: 1.5, opacity: 0.38, fill: "#1a3378", kind: "bg", isMobileVisible: true },
  { id: 9,  cx: 50,  cy: 320, r: 1.5, opacity: 0.38, fill: "#1a3378", kind: "bg", isMobileVisible: true },
  { id: 10, cx: 940, cy: 290, r: 1.5, opacity: 0.38, fill: "#1a3378", kind: "bg", isMobileVisible: true },
  { id: 11, cx: 190, cy: 400, r: 1.5, opacity: 0.38, fill: "#1a3378", kind: "bg", isMobileVisible: false },
  { id: 12, cx: 760, cy: 370, r: 1.5, opacity: 0.38, fill: "#1a3378", kind: "bg", isMobileVisible: true },
  { id: 13, cx: 260, cy: 260, r: 1.5, opacity: 0.38, fill: "#1a3378", kind: "bg", isMobileVisible: true },
  { id: 14, cx: 110, cy: 460, r: 1.5, opacity: 0.38, fill: "#1a3378", kind: "bg", isMobileVisible: true },
  { id: 15, cx: 880, cy: 440, r: 1.5, opacity: 0.38, fill: "#1a3378", kind: "bg", isMobileVisible: false },
  { id: 16, cx: 240, cy: 520, r: 1.5, opacity: 0.38, fill: "#1a3378", kind: "bg", isMobileVisible: false },
  { id: 17, cx: 700, cy: 510, r: 1.5, opacity: 0.38, fill: "#1a3378", kind: "bg", isMobileVisible: false },
];

/** Dot radius in real pixels (the grid radius above is only used for ordering/emphasis). */
const DOT_RADIUS_PX: Record<ConstellationDot["kind"], number> = {
  anchor: 3.4,
  gold: 3,
  bg: 2.1,
};
const GOLD_HALO_RADIUS_PX = 11;

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
  { from: 14, to: 2,  isMobileVisible: true }, // mobile shortcut (16 is hidden on phones)

  // Right chain
  { from: 1, to: 6,  isMobileVisible: true },
  { from: 6, to: 4,  isMobileVisible: true },
  { from: 4, to: 8,  isMobileVisible: true },
  { from: 8, to: 10, isMobileVisible: true },
  { from: 10, to: 12, isMobileVisible: true },
  { from: 12, to: 15, isMobileVisible: false },
  { from: 15, to: 17, isMobileVisible: false },
  { from: 17, to: 3,  isMobileVisible: false },
  { from: 12, to: 3,  isMobileVisible: true }, // mobile shortcut (15, 17 are hidden on phones)
];

/* ── Timing: dots appear top-first, lines start once most dots are in ── */
const SORTED_INDICES = DOTS.map((d, i) => ({ idx: i, cy: d.cy }))
  .sort((a, b) => a.cy - b.cy)
  .map(({ idx }) => idx);

const DOT_DELAYS: number[] = new Array(DOTS.length).fill(0);
SORTED_INDICES.forEach((dotIdx, pos) => {
  DOT_DELAYS[dotIdx] = pos * 0.12;
});

const DOT_MOBILE_DELAYS: number[] = new Array(DOTS.length).fill(0);
SORTED_INDICES.filter((i) => DOTS[i].isMobileVisible).forEach((dotIdx, pos) => {
  DOT_MOBILE_DELAYS[dotIdx] = pos * 0.06;
});

const LINE_START_DESKTOP = 1.2;
const LINE_START_MOBILE = 0.6;
const LINE_MOBILE_ORDER: number[] = [];
{
  let next = 0;
  LINES.forEach((line, i) => {
    LINE_MOBILE_ORDER[i] = line.isMobileVisible ? next++ : 0;
  });
}

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════════════ */

interface EventsConstellationProps {
  events: FeaturedEvent[];
  morphedDotIds?: number[];
  /** Optional ref to expose the constellation SVG element to a parent */
  svgRef?: RefObject<SVGSVGElement | null>;
}

export default function EventsConstellation({
  events,
  morphedDotIds = [],
  svgRef,
}: EventsConstellationProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [inView, setInView] = useState(false);
  // Real size of the drawing. Dots and lines are placed in true pixels, so circles stay
  // round and strokes stay even on every screen shape (they used to be stretched).
  const [size, setSize] = useState({ w: 1000, h: 600 });
  const morphedDotSet = new Set(morphedDotIds);

  /* Start the entrance once, and track visibility for the idle shimmer */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const entrance = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          entrance.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    const visibility = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));

    entrance.observe(section);
    visibility.observe(section);
    return () => {
      entrance.disconnect();
      visibility.disconnect();
    };
  }, []);

  /* Keep the drawing in step with the section's size (the drawing fills the section) */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const measure = () => {
      const width = section.clientWidth;
      const height = section.clientHeight;
      if (width > 0 && height > 0) {
        setSize((prev) => (prev.w === width && prev.h === height ? prev : { w: width, h: height }));
      }
    };
    const observer = new ResizeObserver(measure);
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const px = (cx: number) => (cx / 1000) * size.w;
  const py = (cy: number) => (cy / 600) * size.h;

  const shownEvents = events?.slice(0, 6) ?? [];

  return (
    <section
      ref={sectionRef}
      id="events"
      className={`scroll-mt-16 events-constellation-section${hasAnimated ? " ec-animated" : ""}${inView ? " ec-inview" : ""}`}
    >
      {/* Without JavaScript nothing triggers the entrance, so show the cards plainly */}
      <noscript>
        <style>{`#events .ec-card{opacity:1!important}`}</style>
      </noscript>

      {/* ── Constellation background ── */}
      <svg
        ref={svgRef}
        className="ec-constellation-svg"
        viewBox={`0 0 ${size.w} ${size.h}`}
        aria-hidden="true"
      >
        {LINES.map((line, i) => {
          const from = DOTS[line.from];
          const to = DOTS[line.to];
          const x1 = px(from.cx);
          const y1 = py(from.cy);
          const x2 = px(to.cx);
          const y2 = py(to.cy);
          const len = Math.hypot(x2 - x1, y2 - y1);

          return (
            <line
              key={`line-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#1a3378"
              strokeWidth={1}
              strokeDasharray={len}
              className={`ec-line${!line.isMobileVisible ? " ec-desktop-only" : ""}`}
              style={
                {
                  "--ec-dash-len": len,
                  "--d": `${LINE_START_DESKTOP + i * 0.07}s`,
                  "--dm": `${LINE_START_MOBILE + LINE_MOBILE_ORDER[i] * 0.04}s`,
                } as CSSProperties
              }
            />
          );
        })}

        {DOTS.map((dot, i) => {
          const kindClass =
            dot.kind === "anchor" ? "ec-dot-anchor" : dot.kind === "gold" ? "ec-dot-gold" : "ec-dot-bg";
          const isMorphed = morphedDotSet.has(dot.id);
          const delays = {
            "--d": `${DOT_DELAYS[i]}s`,
            "--dm": `${DOT_MOBILE_DELAYS[i]}s`,
            "--ec-target-op": dot.opacity,
          } as CSSProperties;
          const visibility = !dot.isMobileVisible ? " ec-desktop-only" : "";

          return (
            <g key={`dot-${dot.id}`}>
              {dot.kind === "gold" && !isMorphed && (
                <circle
                  cx={px(dot.cx)}
                  cy={py(dot.cy)}
                  r={GOLD_HALO_RADIUS_PX}
                  fill="#c8903a"
                  className={`ec-halo${visibility}`}
                  style={delays}
                />
              )}
              <circle
                data-dot-id={dot.id}
                cx={px(dot.cx)}
                cy={py(dot.cy)}
                r={DOT_RADIUS_PX[dot.kind]}
                fill={dot.fill}
                className={`ec-dot ${kindClass}${isMorphed ? " ec-dot-pre-visible" : ""}${visibility}`}
                style={delays}
              />
            </g>
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

      {/* ── Events grid ── */}
      <div className="ec-grid">
        {shownEvents.length > 0
          ? shownEvents.map((event, idx) => {
              const content = (
                <>
                  {event.coverImage && (
                    <div className="ec-card-img">
                      <Image
                        src={urlFor(event.coverImage).width(640).height(360).fit("crop").auto("format").url()}
                        alt=""
                        width={640}
                        height={360}
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="ec-card-body">
                    {event.eventDate && (
                      <div className="ec-card-date font-body">{formatEventDate(event.eventDate, "short")}</div>
                    )}
                    <h3 className="ec-card-title font-display">{event.title}</h3>
                  </div>
                </>
              );
              const style = { "--i": idx } as CSSProperties;

              return event.slug ? (
                <Link key={event._id ?? idx} href={`/events/${event.slug}`} className="ec-card" style={style}>
                  {content}
                </Link>
              ) : (
                <div key={event._id ?? idx} className="ec-card" style={style}>
                  {content}
                </div>
              );
            })
          : [1, 2, 3].map((i) => (
              <div key={i} className="ec-card" style={{ "--i": i - 1 } as CSSProperties}>
                <div
                  className="ec-card-img"
                  style={{ background: "linear-gradient(135deg, #e2e8f0, #f1f5f9)" }}
                />
                <div className="ec-card-body">
                  <div className="ec-card-date font-body">Coming Soon</div>
                  <h3 className="ec-card-title font-display">Stay Tuned for Updates</h3>
                </div>
              </div>
            ))}
      </div>

      {/* ── View all ── */}
      <div className="ec-view-all">
        <Link href="/events" className="font-body">
          View All Events
          <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </section>
  );
}