"use client";
import { useEffect, useRef, useCallback } from "react";
import Lenis from "lenis";
import type { Phase } from "./useScrollStateMachine";

/* ─── constants ─── */
const HEADER_H = 64;

/**
 * Exponential-decay easing — gives a premium "glide to rest" feel.
 * Same formula as Apple's momentum scrolling approximation.
 */
const EXPO_EASE_OUT = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

/**
 * Section IDs that participate in programmatic snapping.
 * Gallery and footer are excluded — they allow free natural scrolling.
 */
const SNAP_SECTION_IDS = ["hero", "clubs", "about", "events"] as const;

/**
 * Sections where snapping is disabled and scroll decays naturally.
 */
const FREE_SCROLL_PHASES: Phase[] = ["gallery"];

interface UseLenisArgs {
  /** Phase ref from useScrollStateMachine — used to determine snap behavior */
  phaseRef: React.RefObject<Phase>;
  /** Events morph ref — used to prevent snapping during active morph */
  eventsMorphRef: React.RefObject<number>;
}

interface UseLenisReturn {
  /** The Lenis instance ref — use for programmatic scrollTo and stop/start */
  lenisRef: React.MutableRefObject<Lenis | null>;
  /** Programmatic scroll to a target with Lenis's buttery easing */
  scrollTo: (target: string | number | HTMLElement, options?: {
    offset?: number;
    duration?: number;
    immediate?: boolean;
    lock?: boolean;
    onComplete?: () => void;
  }) => void;
  /** Stop Lenis (e.g., during zoom animations) */
  stop: () => void;
  /** Resume Lenis after stopping */
  start: () => void;
}

/**
 * useLenis — Lenis Smooth Scroll lifecycle hook.
 *
 * Encapsulates:
 * 1. Client-only Lenis initialization (SSR-safe via useEffect)
 * 2. Dedicated RAF loop for lenis.raf()
 * 3. CSS custom property sync (--lenis-scroll-y, --lenis-progress, etc.)
 * 4. Programmatic section snapping with velocity-commit detection
 * 5. Free-scroll zones for gallery/footer
 * 6. Proper destroy() on unmount to prevent memory leaks
 *
 * CRITICAL CONSTRAINTS:
 * - NO getBoundingClientRect() inside scroll callback or RAF
 * - NO React state updates for continuous values
 * - CSS custom properties are updated via direct DOM writes
 */
export default function useLenis({
  phaseRef,
  eventsMorphRef,
}: UseLenisArgs): UseLenisReturn {
  const lenisRef = useRef<Lenis | null>(null);
  const rafIdRef = useRef<number>(0);
  const snapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSnappingRef = useRef(false);

  /* ── Initialize Lenis (client-only) ── */
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: EXPO_EASE_OUT,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    /* ── Scroll event: sync CSS custom properties ── */
    lenis.on("scroll", (e: Lenis) => {
      // Direct DOM writes — no React, no layout reads
      const root = document.documentElement;
      root.style.setProperty("--lenis-scroll-y", e.scroll + "px");
      root.style.setProperty(
        "--lenis-progress",
        String(e.progress)
      );
      root.style.setProperty(
        "--lenis-velocity",
        String(e.velocity)
      );
      root.style.setProperty(
        "--lenis-direction",
        String(e.direction)
      );

      // ── Programmatic snap detection ──
      // Only snap in snappable phases, not during active morphs or zoom
      const currentPhase = phaseRef.current;
      const isFreeScroll = FREE_SCROLL_PHASES.includes(currentPhase);
      const isZooming =
        currentPhase === "zooming" || currentPhase === "zoomed";
      const isMorphing =
        eventsMorphRef.current > 0.01 && eventsMorphRef.current < 0.99;

      if (isFreeScroll || isZooming || isMorphing || isSnappingRef.current) {
        return;
      }

      // Debounced snap: when velocity drops near zero, snap to nearest section
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
      }

      snapTimeoutRef.current = setTimeout(() => {
        if (isSnappingRef.current) return;
        const currentLenis = lenisRef.current;
        if (!currentLenis || !currentLenis.isSmooth) return;

        // Re-check phase after debounce
        const phase = phaseRef.current;
        if (
          FREE_SCROLL_PHASES.includes(phase) ||
          phase === "zooming" ||
          phase === "zoomed"
        ) {
          return;
        }

        // Find the nearest snappable section
        const sy = window.scrollY;
        const wh = window.innerHeight;
        let bestTarget: HTMLElement | null = null;
        let bestDistance = Infinity;

        for (const id of SNAP_SECTION_IDS) {
          const el = document.getElementById(id);
          if (!el) continue;
          // Target snap point is section top minus header
          const sectionTop = el.getBoundingClientRect().top + sy - HEADER_H;
          const distance = Math.abs(sy - sectionTop);

          // Only snap if the section is within half a viewport of current position
          if (distance < wh * 0.45 && distance < bestDistance) {
            bestDistance = distance;
            bestTarget = el;
          }
        }

        // Only snap if we're close enough and not already at the target
        if (bestTarget && bestDistance > 5) {
          isSnappingRef.current = true;
          currentLenis.scrollTo(bestTarget, {
            offset: -HEADER_H,
            duration: 1.2,
            easing: EXPO_EASE_OUT,
            onComplete: () => {
              isSnappingRef.current = false;
            },
          });
        }
      }, 150); // 150ms debounce — waits for velocity to settle
    });

    /* ── Dedicated RAF loop for Lenis ── */
    const raf = (time: number) => {
      lenis.raf(time);
      rafIdRef.current = requestAnimationFrame(raf);
    };
    rafIdRef.current = requestAnimationFrame(raf);

    /* ── Cleanup on unmount ── */
    return () => {
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
      }
      cancelAnimationFrame(rafIdRef.current);
      lenis.destroy();
      lenisRef.current = null;

      // Clean up CSS custom properties
      const root = document.documentElement;
      root.style.removeProperty("--lenis-scroll-y");
      root.style.removeProperty("--lenis-progress");
      root.style.removeProperty("--lenis-velocity");
      root.style.removeProperty("--lenis-direction");
    };
  // phaseRef and eventsMorphRef are stable refs — safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Programmatic scrollTo with Lenis easing ── */
  const scrollTo = useCallback(
    (
      target: string | number | HTMLElement,
      options?: {
        offset?: number;
        duration?: number;
        immediate?: boolean;
        lock?: boolean;
        onComplete?: () => void;
      }
    ) => {
      const lenis = lenisRef.current;
      if (!lenis) {
        // Fallback for pre-init: use native scroll
        if (typeof target === "string") {
          const el = document.querySelector(target);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }
        return;
      }

      isSnappingRef.current = true;
      lenis.scrollTo(target, {
        offset: options?.offset ?? -HEADER_H,
        duration: options?.duration ?? 1.2,
        easing: EXPO_EASE_OUT,
        immediate: options?.immediate ?? false,
        lock: options?.lock ?? false,
        onComplete: () => {
          isSnappingRef.current = false;
          options?.onComplete?.();
        },
      });
    },
    []
  );

  /* ── Stop/Start controls ── */
  const stop = useCallback(() => {
    lenisRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    lenisRef.current?.start();
  }, []);

  return {
    lenisRef,
    scrollTo,
    stop,
    start,
  };
}
