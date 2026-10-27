import type { RefObject } from "react";
import HeroAtom from "../HeroAtom";
import ClubProjection from "./ClubProjection";

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
      <div className="pointer-events-none absolute left-0 top-0 z-[25] h-0 w-full overflow-x-clip">
        <div
          ref={floatingRef}
          className="absolute top-0 left-0 pointer-events-none"
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
      </div>

      {/* The projection: the open club's electron lights up and projects the card onto the screen */}
      <ClubProjection coords={projectorCoords} open={cardRevealVisible} slug={selectedClub} />
      <span className="sr-only" aria-live="polite">
        {cardRevealVisible ? "Club detail opened" : ""}
      </span>
    </>
  );
}