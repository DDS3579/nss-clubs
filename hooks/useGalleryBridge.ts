"use client";
import { useRef } from "react";
import type { Phase } from "./useScrollStateMachine";

interface UseGalleryBridgeArgs {
  /** Phase ref from useScrollStateMachine */
  phaseRef: React.RefObject<Phase>;
  /** Events morph progress ref from useScrollStateMachine */
  eventsMorphRef: React.RefObject<number>;
}

/**
 * Lightweight hook managing the gallery handoff flag.
 * Exists as a named abstraction boundary so future gallery-transition logic
 * (e.g., shared-element animations between EventsConstellation and GalleryOrbit)
 * has a clean home without polluting the main component or the scroll state machine.
 */
export default function useGalleryBridge({ phaseRef, eventsMorphRef }: UseGalleryBridgeArgs) {
  const galleryHandoffRef = useRef(false);

  /**
   * Called from the rAF loop to check if gallery handoff should trigger.
   * Returns true when the events→gallery transition threshold is crossed.
   */
  const checkGalleryHandoff = () => {
    const shouldHandoff =
      (phaseRef.current === "gallery" || phaseRef.current === "events") &&
      eventsMorphRef.current >= 1;

    if (shouldHandoff && !galleryHandoffRef.current) {
      galleryHandoffRef.current = true;
      return true; // first-time handoff
    }
    if (!shouldHandoff && galleryHandoffRef.current) {
      galleryHandoffRef.current = false;
    }
    return false;
  };

  return {
    galleryHandoffRef,
    checkGalleryHandoff,
  };
}
