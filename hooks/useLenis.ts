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

/* ─── Magnetic Scroll Constants ─── */
/** Velocity threshold (px/ms) to "break" the magnetic pull */
const MAGNETIC_BREAK_VELOCITY = 1.8;
/** Duration multiplier when magnetic effect is active */
const MAGNETIC_DURATION_MULTIPLIER = 2.2;
/** Wheel multiplier when magnetic effect is active (lower = heavier) */
const MAGNETIC_WHEEL_MULTIPLIER = 0.35;
/** Touch multiplier when magnetic effect is active */
const MAGNETIC_TOUCH_MULTIPLIER = 1.2;

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
 * useLenis — Lenis smooth-scroll lifecycle hook.
 *
 * Encapsulates:
 * 1. Client-only Lenis initialization (SSR-safe via useEffect)
 * 2. Dedicated RAF loop for lenis.raf()
 * 3. Programmatic section snapping with velocity-commit detection
 * 4. Free-scroll zones for the gallery
 * 5. "Reduce motion" support: no wheel smoothing, no snapping, instant jumps
 * 6. Proper destroy() on unmount to prevent memory leaks
 *
 * Notes:
 * - Lenis only smooths the MOUSE WHEEL. Touch scrolling (phones/tablets) stays
 *   native (`syncTouch: false`), so it feels the way the phone normally scrolls.
 *   Snapping and the "magnetic" effect therefore only apply to wheel users.
 * - This hook used to write four CSS variables to <html> on every scroll event
 *   (--lenis-scroll-y, --lenis-progress, ...). Nothing ever read them, so they
 *   are gone.
 * - NO getBoundingClientRect() inside the scroll callback (only inside the
 *   debounced snap, once scrolling has settled).
 */
export default function useLenis({
  phaseRef,
  eventsMorphRef,
}: UseLenisArgs): UseLenisReturn {
  const lenisRef = useRef<Lenis | null>(null);
  const rafIdRef = useRef<number>(0);
  const snapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSnappingRef = useRef(false);
  const magneticActiveRef = useRef(false);
  const reduceMotionRef = useRef(false);
  const originalOptionsRef = useRef<{
    duration: number;
    wheelMultiplier: number;
    touchMultiplier: number;
  } | null>(null);

  /* ── Initialize Lenis (client-only) ── */
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceMotionRef.current = motionQuery.matches;

    const lenis = new Lenis({
      duration: 1.2,
      easing: EXPO_EASE_OUT,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: !motionQuery.matches,
      syncTouch: false, // touch scrolling stays native
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Store original options for restoration
    originalOptionsRef.current = {
      duration: 1.2,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    };

    const restoreNormalPhysics = () => {
      magneticActiveRef.current = false;
      const lenisInstance = lenisRef.current;
      if (lenisInstance && originalOptionsRef.current) {
        lenisInstance.options.duration = originalOptionsRef.current.duration;
        lenisInstance.options.wheelMultiplier =
          originalOptionsRef.current.wheelMultiplier;
        lenisInstance.options.touchMultiplier =
          originalOptionsRef.current.touchMultiplier;
      }
    };

    /* If the user flips "reduce motion" while the page is open */
    const onMotionChange = (e: MediaQueryListEvent) => {
      reduceMotionRef.current = e.matches;
      lenis.options.smoothWheel = !e.matches;
      if (e.matches) {
        restoreNormalPhysics();
        if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
      }
    };
    motionQuery.addEventListener("change", onMotionChange);

    /* ── Scroll event: magnetic + snapping logic (no DOM writes) ── */
    lenis.on("scroll", (e: Lenis) => {
      // Reduce motion: plain scrolling, no pulling or snapping
      if (reduceMotionRef.current) return;

      // ── Magnetic Scroll Logic for #clubs section ──
      const currentPhase = phaseRef.current;
      const isZooming =
        currentPhase === "zooming" || currentPhase === "zoomed";
      const isMorphing =
        eventsMorphRef.current > 0.01 && eventsMorphRef.current < 0.99;

      // Check if we should activate/deactivate magnetic effect
      if (currentPhase === "clubs" && !isZooming && !isMorphing) {
        // Activate magnetic effect if not already active
        if (!magneticActiveRef.current) {
          magneticActiveRef.current = true;
          const lenisInstance = lenisRef.current;
          if (lenisInstance && originalOptionsRef.current) {
            lenisInstance.options.duration =
              originalOptionsRef.current.duration * MAGNETIC_DURATION_MULTIPLIER;
            lenisInstance.options.wheelMultiplier = MAGNETIC_WHEEL_MULTIPLIER;
            lenisInstance.options.touchMultiplier = MAGNETIC_TOUCH_MULTIPLIER;
          }
        }

        // Check for velocity break — user scrolling aggressively to escape
        if (Math.abs(e.velocity) > MAGNETIC_BREAK_VELOCITY) {
          restoreNormalPhysics();
        }
      } else if (magneticActiveRef.current) {
        // Left clubs phase or entered zoom/morph — restore normal physics
        restoreNormalPhysics();
      }

      // ── Programmatic snap detection ──
      // Only snap in snappable phases, not during active morphs, zoom, or magnetic
      const isFreeScroll = FREE_SCROLL_PHASES.includes(currentPhase);

      if (isFreeScroll || isZooming || isMorphing || isSnappingRef.current || magneticActiveRef.current) {
        return;
      }

      // Debounced snap: when velocity drops near zero, snap to nearest section
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
      }

      snapTimeoutRef.current = setTimeout(() => {
        if (isSnappingRef.current || reduceMotionRef.current) return;
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
      motionQuery.removeEventListener("change", onMotionChange);
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
      }
      cancelAnimationFrame(rafIdRef.current);
      lenis.destroy();
      lenisRef.current = null;
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

      // Reduce motion: jump straight there instead of gliding
      const jump = reduceMotionRef.current || (options?.immediate ?? false);

      // Guarantee onComplete runs exactly once, whether or not Lenis calls it for jumps
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        isSnappingRef.current = false;
        options?.onComplete?.();
      };

      isSnappingRef.current = true;
      lenis.scrollTo(target, {
        offset: options?.offset ?? -HEADER_H,
        duration: options?.duration ?? 1.2,
        easing: EXPO_EASE_OUT,
        immediate: jump,
        lock: options?.lock ?? false,
        onComplete: finish,
      });
      if (jump) finish();
    },
    []
  );

  /* ── Stop/Start controls ── */
  const stop = useCallback(() => {
    // Deactivate magnetic effect when stopping (e.g., for zoom)
    if (magneticActiveRef.current) {
      magneticActiveRef.current = false;
      const lenisInstance = lenisRef.current;
      if (lenisInstance && originalOptionsRef.current) {
        lenisInstance.options.duration = originalOptionsRef.current.duration;
        lenisInstance.options.wheelMultiplier =
          originalOptionsRef.current.wheelMultiplier;
        lenisInstance.options.touchMultiplier =
          originalOptionsRef.current.touchMultiplier;
      }
    }
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