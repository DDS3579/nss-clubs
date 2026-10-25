"use client";

import type { CSSProperties } from "react";
import { ChevronDown } from "lucide-react";
import { CLUBS, EXECUTIVE_TEAM, type ClubSlug } from "@/lib/clubs";

/* ═══════════════════════════════════════════════════════════
   The atom is drawn on a 640 × 640 canvas. Once it has settled in the Clubs section the six
   electrons sit at the corners of a hexagon, 200 units from the centre. Every number below is
   in those canvas units, so the lines and labels scale with the atom on every screen.
   ═══════════════════════════════════════════════════════════ */

const BOX = 640;
/** How far the line travels diagonally away from the electron before turning horizontal. */
const STEP = 26;

interface Spot {
  slug: ClubSlug;
  /** Short name for phones, so nothing overflows. */
  short: string;
  /** Electron position on the canvas. */
  ex: number;
  ey: number;
  /** Direction pointing away from the atom (unit vector). */
  ox: number;
  oy: number;
  side: "left" | "right";
  /** Canvas x where the line ends and the label starts (right side) or ends (left side). */
  edge: number;
}

const SPOTS: readonly Spot[] = [
  { slug: "stem", short: "STEM", ex: 420, ey: 147, ox: 0.5, oy: -0.866, side: "right", edge: 500 },
  { slug: "literature", short: "Literature", ex: 520, ey: 320, ox: 1, oy: 0, side: "right", edge: 560 },
  { slug: "entertainment", short: "Entertainment", ex: 420, ey: 493, ox: 0.5, oy: 0.866, side: "right", edge: 500 },
  { slug: "social", short: "Social", ex: 220, ey: 147, ox: -0.5, oy: -0.866, side: "left", edge: 140 },
  { slug: "arts", short: "Arts & Craft", ex: 120, ey: 320, ox: -1, oy: 0, side: "left", edge: 80 },
  { slug: "sports", short: "Sports", ex: 220, ey: 493, ox: -0.5, oy: 0.866, side: "left", edge: 140 },
];

const CLUB_BY_SLUG = new Map(CLUBS.map((club) => [club.slug, club]));

const pct = (value: number) => `${(value / BOX) * 100}%`;
/** Gives each item its position in the stagger (the CSS reads --i). */
const order = (i: number) => ({ "--i": i }) as CSSProperties;

const LABEL_BASE =
  "club-callout-label inline-flex min-h-11 items-center gap-2 rounded-full border bg-white/95 px-2.5 py-1.5 text-[11px] font-semibold leading-tight text-primary shadow-md transition-colors duration-200 hover:bg-primary hover:text-white focus-visible:bg-primary focus-visible:text-white focus-visible:outline-none sm:gap-2.5 sm:px-4 sm:text-sm";

export default function ClubCallouts({ onSelect }: { onSelect: (slug: string) => void }) {
  const nucleusIndex = SPOTS.length;

  return (
    <div className="club-callouts" role="group" aria-label="Choose a club to open">
      {/* Lines, dots and pulsing rings */}
      <svg
        viewBox={`0 0 ${BOX} ${BOX}`}
        className="absolute inset-0 h-full w-full overflow-visible"
        aria-hidden="true"
      >
        {SPOTS.map((spot, i) => {
          const club = CLUB_BY_SLUG.get(spot.slug);
          if (!club) return null;
          const bendX = spot.ex + spot.ox * STEP;
          const bendY = spot.ey + spot.oy * STEP;
          return (
            <g key={spot.slug} style={order(i)}>
              <path
                className="club-callout-line"
                d={`M ${spot.ex} ${spot.ey} L ${bendX} ${bendY} L ${spot.edge} ${bendY}`}
                pathLength={100}
                fill="none"
                stroke={club.color}
                strokeOpacity={0.75}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle className="club-callout-dot" cx={spot.ex} cy={spot.ey} r={5} fill={club.color} />
              <circle
                className="club-callout-ring"
                cx={spot.ex}
                cy={spot.ey}
                r={20}
                fill="none"
                stroke={club.color}
                strokeWidth={3}
              />
            </g>
          );
        })}

        {/* Nucleus: a line straight down to its label */}
        <g style={order(nucleusIndex)}>
          <path
            className="club-callout-line"
            d="M 320 356 L 320 556"
            pathLength={100}
            fill="none"
            stroke={EXECUTIVE_TEAM.color}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <circle
            className="club-callout-ring"
            cx={320}
            cy={320}
            r={46}
            fill="none"
            stroke={EXECUTIVE_TEAM.color}
            strokeWidth={3}
          />
        </g>
      </svg>

      {/* The six club labels */}
      {SPOTS.map((spot, i) => {
        const club = CLUB_BY_SLUG.get(spot.slug);
        if (!club) return null;
        const labelY = spot.ey + spot.oy * STEP;
        const isLeft = spot.side === "left";
        return (
          <div
            key={spot.slug}
            className={`absolute -translate-y-1/2 ${isLeft ? "-translate-x-full" : ""}`}
            style={{ left: pct(spot.edge), top: pct(labelY) }}
          >
            <button
              type="button"
              onClick={() => onSelect(spot.slug)}
              aria-label={`Open ${club.name}`}
              className={`${LABEL_BASE} ${isLeft ? "flex-row-reverse text-right" : "text-left"}`}
              style={{ ...order(i), borderColor: `${club.color}99` }}
            >
              <span
                aria-hidden="true"
                className="hidden h-2.5 w-2.5 shrink-0 rounded-full sm:block"
                style={{ backgroundColor: club.color }}
              />
              <span className="sm:hidden">{spot.short}</span>
              <span className="hidden sm:inline">{club.name}</span>
            </button>
          </div>
        );
      })}

      {/* The nucleus label */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: "50%", top: pct(584) }}
      >
        <button
          type="button"
          onClick={() => onSelect(EXECUTIVE_TEAM.slug)}
          aria-label={`Open ${EXECUTIVE_TEAM.name}`}
          className="club-callout-label inline-flex min-h-11 items-center gap-2 rounded-full border border-accent bg-accent px-3.5 py-1.5 text-[11px] font-bold leading-tight text-primary shadow-md transition-colors duration-200 hover:bg-primary hover:text-accent focus-visible:bg-primary focus-visible:text-accent focus-visible:outline-none sm:px-5 sm:text-sm"
          style={order(nucleusIndex)}
        >
          {EXECUTIVE_TEAM.name}
        </button>
      </div>

      {/* The hint, centred under the atom */}
      <div className="club-callout-hint pointer-events-none absolute left-1/2 top-full mt-3 -translate-x-1/2 text-center">
        <p className="whitespace-nowrap font-body text-xs font-semibold text-primary sm:text-sm">
          Tap or click a club to open it
        </p>
        <p className="mt-1 flex items-center justify-center gap-1 whitespace-nowrap font-body text-[11px] text-slate-400 sm:text-xs">
          or keep scrolling
          <ChevronDown className="h-3.5 w-3.5 animate-bounce" aria-hidden="true" />
        </p>
      </div>
    </div>
  );
}
