"use client";
import { useRef, useState, useCallback } from "react";
import { DOTS } from "../components/EventsConstellation";
import type { LayoutCache, PlanetRefKey } from "./useScrollStateMachine";

/* ─── helpers ─── */
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}
function easeInOutQuart(t: number) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function mixHex(a: string, b: string, t: number) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const r = Math.round(lerp(ca.r, cb.r, t));
  const g = Math.round(lerp(ca.g, cb.g, t));
  const blue = Math.round(lerp(ca.b, cb.b, t));
  return `rgb(${r}, ${g}, ${blue})`;
}

/* ─── morph config ─── */
type MorphPoint = {
  x: number;
  y: number;
  size: number;
};

interface PlanetDotMorph {
  key: string;
  refKeys: PlanetRefKey[];
  dotId: number;
  fromColor: string;
  toColor: string;
  stagger: number;
}

const PLANET_DOT_MORPHS: PlanetDotMorph[] = [
  { key: "mercury", refKeys: ["mercury"], dotId: 0, fromColor: "#b8c0c9", toColor: "#1a3378", stagger: 0 },
  { key: "venus", refKeys: ["venus"], dotId: 5, fromColor: "#d9a763", toColor: "#1a3378", stagger: 0.06 },
  { key: "earth", refKeys: ["earth"], dotId: 2, fromColor: "#3e8fb0", toColor: "#1a3378", stagger: 0.12 },
  { key: "sun", refKeys: ["sun"], dotId: 4, fromColor: "#ffb703", toColor: "#c8903a", stagger: 0.3 },
  { key: "mars", refKeys: ["mars"], dotId: 1, fromColor: "#cf5a3c", toColor: "#1a3378", stagger: 0.18 },
  { key: "jupiter", refKeys: ["jupiter"], dotId: 3, fromColor: "#d4924c", toColor: "#1a3378", stagger: 0.24 },
  { key: "saturn", refKeys: ["saturn-wrap"], dotId: 12, fromColor: "#d0a45f", toColor: "#1a3378", stagger: 0.28 },
];

const MORPH_DURATION_FRACTION = 0.7;
const MORPH_DOT_IDS = PLANET_DOT_MORPHS.map((item) => item.dotId);

export { PLANET_DOT_MORPHS, MORPH_DOT_IDS };

interface UseMorphCoordinatesArgs {
  /** Layout cache ref from useScrollStateMachine — provides planet positions and SVG rect */
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

  /* ── Morph ghost refs (direct DOM manipulation targets) ── */
  const morphGhostRefs = useRef<(HTMLDivElement | null)[]>([]);
  const morphedDotsVisibleRef = useRef(false);

  /* ── Only discrete state: which dot IDs are hidden in constellation ── */
  const [morphedDotIds, setMorphedDotIds] = useState<number[]>([]);

  const syncMorphedDots = (visible: boolean) => {
    if (morphedDotsVisibleRef.current === visible) return;
    morphedDotsVisibleRef.current = visible;
    setMorphedDotIds(visible ? MORPH_DOT_IDS : []);
  };

  /* getMorphElementPoint — reads from layoutCacheRef (no DOM reads) */
  const getMorphElementPoint = (key: string): MorphPoint | null => {
    const planetPt = layoutCacheRef.current.planets[key];
    if (!planetPt) return null;
    return planetPt;
  };

  /* getConstellationDotPoint — reads from layoutCacheRef (no DOM reads) */
  const getConstellationDotPoint = (dotId: number): MorphPoint | null => {
    const dot = DOTS.find((item) => item.id === dotId);
    const svgRect = layoutCacheRef.current.constellationSvg;
    if (!svgRect || !dot) return null;

    const scaleX = svgRect.width / 1000;
    const scaleY = svgRect.height / 600;

    return {
      x: svgRect.pageLeft + dot.cx * scaleX,
      y: svgRect.pageTop + dot.cy * scaleY,
      size: Math.max(5, dot.r * 2 * Math.min(scaleX, scaleY)),
    };
  };

  /**
   * Direct DOM manipulation of morph ghost elements.
   * Called from the rAF loop — writes to .style properties directly,
   * bypassing React's virtual DOM entirely for per-frame updates.
   */
  const updateMorphGhosts = useCallback((progress: number) => {
    const active = progress > 0.001 && progress < 0.999;
    syncMorphedDots(progress > 0.08);

    PLANET_DOT_MORPHS.forEach((morph, index) => {
      const ghost = morphGhostRefs.current[index];
      if (!ghost) return;

      if (!active) {
        ghost.style.opacity = "0";
        ghost.style.transform = "translate3d(-50%, -50%, 0) scale(0.6)";
        return;
      }

      const from = getMorphElementPoint(morph.key);
      const to = getConstellationDotPoint(morph.dotId);
      if (!from || !to) {
        ghost.style.opacity = "0";
        return;
      }

      const localT = clamp01((progress - morph.stagger) / MORPH_DURATION_FRACTION);
      const easedT = easeInOutQuart(localT);
      const x = lerp(from.x, to.x, easedT) - window.scrollX;
      const y = lerp(from.y, to.y, easedT) - window.scrollY;
      const size = lerp(from.size, to.size, easedT);
      const color = mixHex(morph.fromColor, morph.toColor, easedT);
      const shine = mixHex("#ffffff", color, 0.52 + easedT * 0.24);
      const glow = 0.28 + Math.sin(Math.PI * localT) * 0.34;

      // Use translate3d for GPU-composited positioning instead of left/top
      // to avoid layout thrashing during scroll animations
      ghost.style.opacity = "1";
      ghost.style.width = `${size}px`;
      ghost.style.height = `${size}px`;
      ghost.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0)`;
      ghost.style.background = `radial-gradient(circle at 32% 30%, ${shine} 0%, ${color} 52%, ${morph.toColor} 100%)`;
      ghost.style.boxShadow = `0 0 ${Math.max(12, size * 0.45)}px rgba(26, 51, 120, ${glow})`;
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

    // Morph ghost refs and state
    morphGhostRefs,
    morphedDotIds,

    // rAF-callable direct DOM updater
    updateMorphGhosts,
  };
}
