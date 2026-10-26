"use client";
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatEventDate } from "@/lib/dates";
import { urlFor } from "@/sanity/lib/image";
import type { FeaturedEvent } from "@/sanity/lib/types";
import { PLANET_DOT_MORPHS } from "@/hooks/useScrollStateMachine";
import "./home/events-constellation.css";

/* ═══════════════════════════════════════════════════════════
   THE CONSTELLATION: the Big Dipper (Ursa Major).

   Seven planets become its seven stars; a spark from the sun becomes Polaris, the North Star
   the Dipper points to. Faint "dust" stars fill the sky around it.

   cx / cy are positions on a 1000 × 300 design grid. The component maps them to the real
   size of the sky strip, and the flying planets (useMorphCoordinates) land on these exact spots.
   ═══════════════════════════════════════════════════════════ */

export const SKY_W = 1000;
export const SKY_H = 300;

/** How much of the scroll one planet's flight takes (0 to 1). A star appears when its flight lands. */
export const FLIGHT_DURATION = 0.46;

const NAVY = "#1a3378";
const GOLD = "#c8903a";

export interface ConstellationDot {
  id: number;
  name: string;
  cx: number;
  cy: number;
  /** Star radius in pixels on a 1000px-wide strip */
  r: number;
  kind: "dipper" | "polaris" | "dust";
  fill: string;
  /** Scroll progress (0 to 1) at which the star is fully lit */
  arrive: number;
  mobile: boolean;
}

const ARRIVE_BY_ID = new Map(
  PLANET_DOT_MORPHS.map((morph) => [morph.dotId, morph.stagger + FLIGHT_DURATION]),
);
const arriveAt = (id: number, fallback: number) => ARRIVE_BY_ID.get(id) ?? fallback;

export const DOTS: ConstellationDot[] = [
  // ── The Big Dipper: handle on the left, bowl on the right ──
  { id: 0, name: "Alkaid", cx: 70, cy: 215, r: 3.6, kind: "dipper", fill: NAVY, arrive: arriveAt(0, 0.52), mobile: true },
  { id: 1, name: "Mizar", cx: 190, cy: 178, r: 4.2, kind: "dipper", fill: NAVY, arrive: arriveAt(1, 0.55), mobile: true },
  { id: 2, name: "Alioth", cx: 310, cy: 152, r: 4.6, kind: "dipper", fill: NAVY, arrive: arriveAt(2, 0.58), mobile: true },
  { id: 3, name: "Megrez", cx: 425, cy: 135, r: 3.4, kind: "dipper", fill: NAVY, arrive: arriveAt(3, 0.61), mobile: true },
  { id: 4, name: "Phecda", cx: 448, cy: 218, r: 3.8, kind: "dipper", fill: NAVY, arrive: arriveAt(4, 0.64), mobile: true },
  { id: 5, name: "Merak", cx: 640, cy: 238, r: 4.2, kind: "dipper", fill: NAVY, arrive: arriveAt(5, 0.67), mobile: true },
  { id: 6, name: "Dubhe", cx: 668, cy: 138, r: 4.8, kind: "dipper", fill: NAVY, arrive: arriveAt(6, 0.7), mobile: true },
  // ── Polaris: the golden North Star (the spark from the sun) ──
  { id: 7, name: "Polaris", cx: 735, cy: 42, r: 4.6, kind: "polaris", fill: GOLD, arrive: arriveAt(7, 0.8), mobile: true },
  // ── Alcor: the tiny companion of Mizar ──
  { id: 8, name: "Alcor", cx: 214, cy: 158, r: 1.8, kind: "dust", fill: NAVY, arrive: 0.6, mobile: true },
  // ── Dust: faint stars that fill in the sky ──
  { id: 9, name: "d1", cx: 150, cy: 70, r: 1.7, kind: "dust", fill: NAVY, arrive: 0.58, mobile: true },
  { id: 10, name: "d2", cx: 255, cy: 52, r: 1.5, kind: "dust", fill: NAVY, arrive: 0.62, mobile: false },
  { id: 11, name: "d3", cx: 360, cy: 78, r: 1.9, kind: "dust", fill: NAVY, arrive: 0.66, mobile: true },
  { id: 12, name: "d4", cx: 525, cy: 62, r: 1.5, kind: "dust", fill: NAVY, arrive: 0.7, mobile: false },
  { id: 13, name: "d5", cx: 610, cy: 118, r: 1.8, kind: "dust", fill: NAVY, arrive: 0.74, mobile: true },
  { id: 14, name: "d6", cx: 790, cy: 92, r: 1.6, kind: "dust", fill: NAVY, arrive: 0.78, mobile: false },
  { id: 15, name: "d7", cx: 870, cy: 52, r: 2.0, kind: "dust", fill: NAVY, arrive: 0.82, mobile: true },
  { id: 16, name: "d8", cx: 940, cy: 150, r: 1.5, kind: "dust", fill: NAVY, arrive: 0.86, mobile: false },
  { id: 17, name: "d9", cx: 905, cy: 236, r: 1.8, kind: "dust", fill: NAVY, arrive: 0.9, mobile: true },
  { id: 18, name: "d10", cx: 800, cy: 270, r: 1.5, kind: "dust", fill: NAVY, arrive: 0.72, mobile: false },
  { id: 19, name: "d11", cx: 560, cy: 272, r: 1.7, kind: "dust", fill: NAVY, arrive: 0.68, mobile: true },
  { id: 20, name: "d12", cx: 350, cy: 262, r: 1.8, kind: "dust", fill: NAVY, arrive: 0.64, mobile: true },
  { id: 21, name: "d13", cx: 120, cy: 120, r: 1.5, kind: "dust", fill: NAVY, arrive: 0.6, mobile: false },
  { id: 22, name: "d14", cx: 500, cy: 160, r: 1.4, kind: "dust", fill: NAVY, arrive: 0.76, mobile: false },
];

/** The lines of the Dipper: the handle, the bowl (a closed loop), then the pointer to Polaris. */
const LINES: { from: number; to: number; gold?: boolean }[] = [
  { from: 0, to: 1 },
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 3, to: 6 },
  { from: 6, to: 5 },
  { from: 5, to: 4 },
  { from: 4, to: 3 },
  { from: 6, to: 7, gold: true },
];

/** A line starts drawing just before its later star lands, and takes this much of the scroll. */
const LINE_DRAW = 0.12;

interface EventsConstellationProps {
  events: FeaturedEvent[];
  /** Not used any more (the stars now follow the scroll); kept so existing code still compiles. */
  morphedDotIds?: number[];
  /** Optional ref to expose the constellation SVG element to a parent */
  svgRef?: RefObject<SVGSVGElement | null>;
}

export default function EventsConstellation({ events, svgRef }: EventsConstellationProps) {
  const skyRef = useRef<HTMLDivElement>(null);
  // Real size of the sky strip. Stars and lines are placed in true pixels, so circles stay round.
  const [size, setSize] = useState({ w: SKY_W, h: SKY_H });

  useEffect(() => {
    const sky = skyRef.current;
    if (!sky) return;
    const measure = () => {
      const width = sky.clientWidth;
      const height = sky.clientHeight;
      if (width > 0 && height > 0) {
        setSize((prev) => (prev.w === width && prev.h === height ? prev : { w: width, h: height }));
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(sky);
    return () => observer.disconnect();
  }, []);

  const px = (cx: number) => (cx / SKY_W) * size.w;
  const py = (cy: number) => (cy / SKY_H) * size.h;
  const k = Math.min(1.15, Math.max(0.7, size.w / SKY_W));

  const shownEvents = events?.slice(0, 6) ?? [];

  return (
    <section id="events" className="scroll-mt-16 events-constellation-section">
      {/* ── The night sky: the Big Dipper forms here as you scroll in ── */}
      <div ref={skyRef} className="ec-sky">
        <svg
          ref={svgRef}
          className="ec-sky-svg"
          viewBox={`0 0 ${size.w} ${size.h}`}
          aria-hidden="true"
        >
          {LINES.map((line, i) => {
            const a = DOTS[line.from];
            const b = DOTS[line.to];
            const x1 = px(a.cx);
            const y1 = py(a.cy);
            const x2 = px(b.cx);
            const y2 = py(b.cy);
            const length = Math.hypot(x2 - x1, y2 - y1);
            const start = Math.max(a.arrive, b.arrive) - 0.03;
            return (
              <line
                key={`line-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={line.gold ? GOLD : NAVY}
                strokeWidth={1.4}
                strokeLinecap="round"
                className="ec-line"
                style={
                  {
                    "--len": length,
                    "--l0": start,
                    "--lk": 1 / LINE_DRAW,
                    "--lo": line.gold ? 0.7 : 0.42,
                  } as CSSProperties
                }
              />
            );
          })}

          {DOTS.map((dot, i) => {
            const radius = dot.r * k;
            const spark = radius * 3.4;
            const cx = px(dot.cx);
            const cy = py(dot.cy);
            return (
              <g
                key={dot.id}
                className={`ec-star ec-star-${dot.kind}${dot.mobile ? "" : " ec-desktop-only"}`}
                style={
                  {
                    "--a": dot.arrive,
                    "--i": i,
                    "--to": dot.kind === "dust" ? 0.5 : 1,
                  } as CSSProperties
                }
              >
                {dot.kind === "polaris" && (
                  <circle className="ec-polaris-glow" cx={cx} cy={cy} r={22 * k} fill={GOLD} />
                )}
                {dot.kind !== "dust" && (
                  <g className="ec-star-spark" stroke={dot.fill} strokeWidth={1} strokeLinecap="round">
                    <line x1={cx - spark} y1={cy} x2={cx + spark} y2={cy} />
                    <line x1={cx} y1={cy - spark} x2={cx} y2={cy + spark} />
                  </g>
                )}
                <circle
                  className="ec-star-ring"
                  cx={cx}
                  cy={cy}
                  r={radius * 2.2}
                  fill="none"
                  stroke={dot.fill}
                  strokeWidth={1.4}
                />
                <circle className="ec-star-core" cx={cx} cy={cy} r={radius} fill={dot.fill} />
              </g>
            );
          })}
        </svg>
        <p className="ec-sky-caption font-body">Every event is a new star</p>
      </div>

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