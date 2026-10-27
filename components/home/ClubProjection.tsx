"use client";

import type { CSSProperties } from "react";
import { ALL_NODES } from "@/lib/clubs";
import ClubIcon from "./ClubIcon";
import type { ProjectorCoords } from "./AtomOverlay";

/** Where along the beam's landing edge each speck of light travels to (0 to 1). */
const SPECK_POSITIONS = [0.14, 0.32, 0.5, 0.68, 0.86];

interface ClubProjectionProps {
  /** The beam's corners: the electron (x1, y1) and the two ends of the card's edge */
  coords: ProjectorCoords | null;
  /** True once the zoom has arrived and the card should appear */
  open: boolean;
  /** Which club (or "executive-team") is open */
  slug: string | null;
}

/**
 * The "projection": the zoomed-in electron lights up and projects its club onto the card.
 * All motion is plain CSS (see "CLUB PROJECTION" in home-experience.css); this only draws the parts.
 */
export default function ClubProjection({ coords, open, slug }: ClubProjectionProps) {
  if (!coords) return null;

  const club = ALL_NODES.find((node) => node.slug === slug);
  const color = club?.color ?? "#023B8E";
  const { x1, y1, x2, y2, x3, y3 } = coords;
  const midX = (x2 + x3) / 2;
  const midY = (y2 + y3) / 2;

  return (
    <div
      className="proj pointer-events-none fixed inset-0 z-[24]"
      data-state={open ? "in" : "out"}
      aria-hidden="true"
      style={
        {
          "--c": color,
          "--dx": `${midX - x1}px`,
          "--dy": `${midY - y1}px`,
        } as CSSProperties
      }
    >
      <svg className="absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <linearGradient
            id="proj-grad"
            gradientUnits="userSpaceOnUse"
            x1={x1}
            y1={y1}
            x2={midX}
            y2={midY}
          >
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="55%" stopColor={color} stopOpacity="0.14" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
          <filter id="proj-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        {/* The cone of light, growing out from the electron */}
        <polygon
          className="proj-beam"
          points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`}
          fill="url(#proj-grad)"
          style={{ transformOrigin: `${x1}px ${y1}px` }}
        />

        {/* The bright edge where the beam lands on the card */}
        <line
          className="proj-edge"
          x1={x2}
          y1={y2}
          x2={x3}
          y2={y3}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* Specks of light flowing down the beam */}
        {SPECK_POSITIONS.map((fraction, index) => {
          const endX = x2 + (x3 - x2) * fraction;
          const endY = y2 + (y3 - y2) * fraction;
          const duration = `${(2 + index * 0.35).toFixed(2)}s`;
          const begin = `${(index * 0.3).toFixed(2)}s`;
          return (
            <circle key={fraction} className="proj-speck" r="2" fill={color} opacity="0">
              <animateMotion
                path={`M ${x1} ${y1} L ${endX} ${endY}`}
                dur={duration}
                begin={begin}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;0.9;0.9;0"
                keyTimes="0;0.18;0.8;1"
                dur={duration}
                begin={begin}
                repeatCount="indefinite"
              />
            </circle>
          );
        })}

        {/* The flare at the electron: a soft glow, three rings, and a bright core */}
        <circle className="proj-glow" cx={x1} cy={y1} r="16" fill={color} filter="url(#proj-glow)" />
        {[0, 1, 2].map((ring) => (
          <circle
            key={ring}
            className="proj-ring"
            cx={x1}
            cy={y1}
            r="10"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            style={{ animationDelay: `${ring * 0.45}s` }}
          />
        ))}
        <circle className="proj-apex" cx={x1} cy={y1} r="5" fill={color} />
      </svg>

      {/* The club's own icon rides down the beam, then dissolves into the card */}
      <div className="proj-emblem" style={{ left: x1, top: y1 }}>
        {club && <ClubIcon name={club.iconName} className="h-7 w-7" />}
      </div>
    </div>
  );
}
