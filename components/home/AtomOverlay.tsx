import type { RefObject } from "react";
import { ALL_NODES } from "@/lib/clubs";
import HeroAtom from "../HeroAtom";

/** Logical size of the atom canvas (the canvas itself is scaled with CSS). */
export const CANVAS_INTRINSIC = 640;

export interface ProjectorCoords {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
}

interface AtomOverlayProps {
  floatingRef: RefObject<HTMLDivElement | null>;
  canvasWrapRef: RefObject<HTMLDivElement | null>;
  atomProgressRef: RefObject<number>;
  rotationOffsetRef: RefObject<number>;
  nucleusSeparationRef: RefObject<number>;
  zoomActiveRef: RefObject<boolean>;
  atomPausedRef: RefObject<boolean>;
  handleElectronClick: (slug: string) => void;
  projectorCoords: ProjectorCoords | null;
  cardRevealVisible: boolean;
  selectedClub: string | null;
}

/**
 * The atom that floats above the whole page and travels between sections,
 * the light beam drawn during a club zoom, and a status line for screen readers.
 */
export default function AtomOverlay({
  floatingRef,
  canvasWrapRef,
  atomProgressRef,
  rotationOffsetRef,
  nucleusSeparationRef,
  zoomActiveRef,
  atomPausedRef,
  handleElectronClick,
  projectorCoords,
  cardRevealVisible,
  selectedClub,
}: AtomOverlayProps) {
  return (
    <>
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
          <div className="pointer-events-auto">
            <HeroAtom
              progressRef={atomProgressRef}
              rotationOffsetRef={rotationOffsetRef}
              nucleusSeparationRef={nucleusSeparationRef}
              zoomActiveRef={zoomActiveRef}
              pausedRef={atomPausedRef}
              onElectronClick={handleElectronClick}
            />
          </div>
        </div>
      </div>

      {/* Projector beam only during club zoom, NOT during about section */}
      {projectorCoords &&
        cardRevealVisible &&
        (() => {
          const activeClubData = ALL_NODES.find(
            (c) => c.slug === selectedClub,
          );
          const connectorColor = activeClubData
            ? activeClubData.color
            : "#023B8E";
          return (
            <svg
              className="fixed top-0 left-0 w-full h-full pointer-events-none z-40 transition-opacity duration-700 ease-out animate-flicker-in"
              style={{ opacity: cardRevealVisible ? 1 : 0 }}
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
              <polygon
                points={`${projectorCoords.x1},${projectorCoords.y1} ${projectorCoords.x2},${projectorCoords.y2} ${projectorCoords.x3},${projectorCoords.y3}`}
                fill="url(#projector-beam-grad)"
                className="projector-beam"
              />
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
        {cardRevealVisible ? "Club detail opened" : ""}
      </span>
    </>
  );
}