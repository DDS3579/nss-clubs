"use client";
import { useRef, useCallback } from "react";
import { DOTS, FLIGHT_DURATION, SKY_H, SKY_W } from "../components/EventsConstellation";
import { PLANET_DOT_MORPHS } from "./useScrollStateMachine";
import type { LayoutCache, PlanetRefKey } from "./useScrollStateMachine";
import { clamp01, lerp } from "../lib/math";

/* ─── small helpers ─── */
type RGB = [number, number, number];

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function parseHex(hex: string): RGB {
  const value = parseInt(hex.replace("#", ""), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}
function mix(a: RGB, b: RGB, t: number): RGB {
  return [
    Math.round(lerp(a[0], b[0], t)),
    Math.round(lerp(a[1], b[1], t)),
    Math.round(lerp(a[2], b[2], t)),
  ];
}
const rgba = (c: RGB, alpha: number) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`;
const WHITE: RGB = [255, 255, 255];

const MORPH_COLORS = PLANET_DOT_MORPHS.map((morph) => ({
  from: parseHex(morph.fromColor),
  to: parseHex(morph.toColor),
}));
const DOT_BY_ID = new Map(DOTS.map((dot) => [dot.id, dot]));

export { PLANET_DOT_MORPHS };
export const MORPH_DOT_IDS = PLANET_DOT_MORPHS.map((item) => item.dotId);

/** Kept so existing code that passes it along still works (stars are now driven by scroll CSS). */
const NO_DOTS: number[] = [];

/** Where one planet copy takes off from, in screen coordinates. */
interface TakeoffPoint {
  x: number;
  y: number;
  size: number;
  /** The real planet's own gradient, so the copy looks identical at the moment of the swap. */
  look: string;
  /** True when the planet is not on screen (phones), so the copy is spawned instead. */
  spawned: boolean;
}

interface UseMorphCoordinatesArgs {
  /** Layout cache ref from useScrollStateMachine: provides the constellation's position */
  layoutCacheRef: React.RefObject<LayoutCache>;
}

export default function useMorphCoordinates({ layoutCacheRef }: UseMorphCoordinatesArgs) {
  /* ── Planet element refs ── */
  const planetMercuryRef = useRef<HTMLDivElement>(null);
  const planetVenusRef = useRef<HTMLDivElement>(null);
  const planetEarthRef = useRef<HTMLDivElement>(null);
  const planetSunRef = useRef<HTMLDivElement>(null);
  const planetMarsRef = useRef<HTMLDivElement>(null);
  const planetJupiterRef = useRef<HTMLDivElement>(null);
  const planetSaturnWrapRef = useRef<HTMLDivElement>(null);

  /** Look up a planet element by its ref key */
  const getPlanetRef = useCallback((refKey: PlanetRefKey): HTMLDivElement | null => {
    switch (refKey) {
      case "mercury": return planetMercuryRef.current;
      case "venus": return planetVenusRef.current;
      case "earth": return planetEarthRef.current;
      case "sun": return planetSunRef.current;
      case "mars": return planetMarsRef.current;
      case "jupiter": return planetJupiterRef.current;
      case "saturn-wrap": return planetSaturnWrapRef.current;
    }
  }, []);

  /* ── Ghost (planet copy) elements and their bookkeeping ── */
  const morphGhostRefs = useRef<(HTMLDivElement | null)[]>([]);
  const takeoffRef = useRef<(TakeoffPoint | null)[]>([]);
  const lastRef = useRef<({ x: number; y: number; tail: number } | null)[]>([]);
  const takenOffRef = useRef(false);
  const ghostsShownRef = useRef(false);
  const layerFixedRef = useRef<boolean | null>(null);

  /* ── The two sections we hand scroll variables to ── */
  const sectionsRef = useRef<{
    about: HTMLElement | null;
    events: HTMLElement | null;
    reduce: boolean;
    ready: boolean;
  }>({ about: null, events: null, reduce: false, ready: false });
  const writtenRef = useRef({ m: "", lifted: false, formed: false });

  /** Hands the transition progress to the CSS and flips two state classes. */
  const syncSections = (m: number) => {
    const s = sectionsRef.current;
    if (!s.ready) {
      s.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      s.ready = true;
    }
    if (!s.about) s.about = document.getElementById("about");
    if (!s.events) s.events = document.getElementById("events");
    const written = writtenRef.current;

    const lifted = m > 0.001;
    if (written.lifted !== lifted && s.about) {
      s.about.classList.toggle("lifted", lifted);
      written.lifted = lifted;
    }
    const formed = m > 0.97;
    if (written.formed !== formed && s.events) {
      s.events.classList.toggle("ec-formed", formed);
      written.formed = formed;
    }
    if (!s.reduce) {
      const text = m.toFixed(4);
      if (written.m !== text) {
        s.about?.style.setProperty("--m", text);
        s.events?.style.setProperty("--m", text);
        written.m = text;
      }
    }
  };

  const hideGhosts = () => {
    if (!ghostsShownRef.current) return;
    ghostsShownRef.current = false;
    morphGhostRefs.current.forEach((ghost) => {
      if (ghost) ghost.style.opacity = "0";
    });
  };

  /** Measure where every planet is on screen, once, the moment the flight begins. */
  const measureTakeoff = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const count = PLANET_DOT_MORPHS.length;
    takeoffRef.current = PLANET_DOT_MORPHS.map((morph, index) => {
      for (const refKey of morph.refKeys) {
        const el = getPlanetRef(refKey);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        if (rect.width > 0 && rect.height > 0 && centerY > 72 && centerY < vh - 24) {
          const sphere =
            refKey === "saturn-wrap"
              ? (el.querySelector(".p-saturn") as HTMLElement | null) ?? el
              : el;
          const isSpark = morph.key === "sun-spark";
          return {
            x: rect.left + rect.width / 2,
            y: centerY,
            size: isSpark ? 16 : Math.max(rect.width, rect.height),
            look: isSpark ? "none" : getComputedStyle(sphere).backgroundImage,
            spawned: false,
          };
        }
        break;
      }
      // The planet is not on screen (phones): spawn a glowing orb in the sky instead
      return {
        x: vw * (0.2 + 0.6 * (index / Math.max(count - 1, 1))),
        y: vh * 0.34 + (index % 2) * 26,
        size: 18,
        look: "none",
        spawned: true,
      };
    });
    lastRef.current = [];
  };

  /**
   * Called every frame from the rAF loop (progress 0 → 1 along the About → Events scroll).
   * Writes straight to the DOM, so React never re-renders for this.
   */
  const updateMorphGhosts = useCallback((progress: number) => {
    const m = clamp01(progress);
    syncSections(m);

    const reduce = sectionsRef.current.reduce;
    const flying = m > 0.001 && m < 0.999 && !reduce;
    if (!flying) {
      takenOffRef.current = false;
      hideGhosts();
      return;
    }

    const svg = layoutCacheRef.current.constellationSvg;
    if (!svg) {
      hideGhosts();
      return;
    }
    if (!takenOffRef.current) {
      takenOffRef.current = true;
      measureTakeoff();
    }
    ghostsShownRef.current = true;

    // The ghost layer is either fixed to the screen or attached to the page: handle both
    if (layerFixedRef.current === null) {
      const parent = morphGhostRefs.current[0]?.parentElement;
      if (parent) layerFixedRef.current = getComputedStyle(parent).position === "fixed";
    }
    const sx = window.scrollX;
    const sy = window.scrollY;
    const offsetX = layerFixedRef.current === false ? sx : 0;
    const offsetY = layerFixedRef.current === false ? sy : 0;
    const starScale = Math.min(1.15, Math.max(0.7, svg.width / SKY_W));

    PLANET_DOT_MORPHS.forEach((morph, index) => {
      const ghost = morphGhostRefs.current[index];
      if (!ghost) return;
      const start = takeoffRef.current[index];
      const dot = DOT_BY_ID.get(morph.dotId);
      if (!start || !dot) {
        ghost.style.opacity = "0";
        return;
      }

      // This planet has already landed: its star has taken over
      if (m >= morph.stagger + FLIGHT_DURATION) {
        ghost.style.opacity = "0";
        return;
      }

      const local = clamp01((m - morph.stagger) / FLIGHT_DURATION); // 0 = still waiting
      const colors = MORPH_COLORS[index];

      // Where the star is on screen right now (the Events section is still rising into view)
      const targetX = svg.pageLeft + (dot.cx / SKY_W) * svg.width - sx;
      const targetY = svg.pageTop + (dot.cy / SKY_H) * svg.height - sy;

      // A curved path: a quadratic curve bent sideways, alternating left and right
      const dx = targetX - start.x;
      const dy = targetY - start.y;
      const dist = Math.hypot(dx, dy) || 1;
      const side = index % 2 === 0 ? 1 : -1;
      const bulge =
        Math.min(170, Math.max(36, dist * 0.22)) * side * (morph.key === "sun-spark" ? 1.7 : 1);
      const controlX = (start.x + targetX) / 2 - (dy / dist) * bulge;
      const controlY = (start.y + targetY) / 2 + (dx / dist) * bulge;

      const e = easeInOutCubic(local);
      const u = 1 - e;
      const x = u * u * start.x + 2 * u * e * controlX + e * e * targetX;
      const y = u * u * start.y + 2 * u * e * controlY + e * e * targetY;

      // Planet size → star size, planet color → starlight
      const starSize = Math.max(7, dot.r * 2 * starScale + 5);
      const size = lerp(start.size, starSize, easeOutCubic(local));
      const colorMix = easeInOutCubic(local);
      const color = mix(colors.from, colors.to, colorMix);
      const shine = mix(WHITE, color, 0.5 + colorMix * 0.25);

      // Orbs that were spawned fade in first; everything fades out as the star takes over
      const fadeIn = start.spawned ? clamp01((m - 0.001) / 0.08) : 1;
      const fadeOut = local > 0.88 ? clamp01((1 - local) / 0.12) : 1;
      const opacity = Math.min(fadeIn, fadeOut);

      // A short comet tail that follows how fast the copy is really moving (none when you stop)
      const last = lastRef.current[index];
      let tail = 0;
      let angle = 0;
      if (last) {
        const vx = x - last.x;
        const vy = y - last.y;
        angle = (Math.atan2(vy, vx) * 180) / Math.PI + 180;
        const wanted = Math.min(110, Math.hypot(vx, vy) * 7) * Math.sin(Math.PI * local);
        tail = lerp(last.tail, wanted, 0.35);
      }
      lastRef.current[index] = { x, y, tail };

      const glow = 0.3 + Math.sin(Math.PI * local) * 0.35;
      const haloSize = Math.max(10, size * 0.55);

      ghost.style.opacity = opacity.toFixed(3);
      ghost.style.width = `${size}px`;
      ghost.style.height = `${size}px`;
      ghost.style.transform = `translate3d(${x + offsetX - size / 2}px, ${y + offsetY - size / 2}px, 0)`;
      ghost.style.background = `radial-gradient(circle at 34% 30%, ${rgba(shine, 1)} 0%, ${rgba(color, 1)} 58%, ${rgba(colors.to, 1)} 100%)`;
      ghost.style.boxShadow = `0 0 ${haloSize}px ${haloSize * 0.25}px ${rgba(color, glow)}`;
      ghost.style.setProperty("--planet-bg", start.look);
      ghost.style.setProperty("--pb", (1 - clamp01(local * 3.5)).toFixed(2));
      ghost.style.setProperty("--tail", `${tail.toFixed(1)}px`);
      ghost.style.setProperty("--ang", `${angle.toFixed(1)}deg`);
      ghost.style.setProperty("--tc", rgba(color, 0.6));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // Planet element refs (wire to JSX)
    planetMercuryRef,
    planetVenusRef,
    planetEarthRef,
    planetSunRef,
    planetMarsRef,
    planetJupiterRef,
    planetSaturnWrapRef,
    getPlanetRef,

    // Ghost refs and (unused) state kept for compatibility
    morphGhostRefs,
    morphedDotIds: NO_DOTS,

    // rAF-callable direct DOM updater
    updateMorphGhosts,
  };
}