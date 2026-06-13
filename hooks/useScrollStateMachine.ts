"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import type { HeroHandle } from "../components/Hero";

/* ─── constants ─── */
const HEADER_H = 64;

type Phase = "hero" | "clubs" | "zooming" | "zoomed" | "about" | "events" | "gallery";

interface PageRect {
  pageLeft: number;
  pageTop: number;
  width: number;
  height: number;
}

interface LayoutCache {
  windowWidth: number;
  windowHeight: number;
  scrollX: number;
  scrollY: number;

  heroAnchor: PageRect | null;
  clubsAnchor: PageRect | null;
  aboutAnchor: PageRect | null;
  cardWrapper: PageRect | null;

  clubsSectionTop: number;
  aboutSectionTop: number;
  aboutSectionHeight: number;
  eventsSectionTop: number;
  eventsSectionHeight: number;
  gallerySectionTop: number;

  planets: Record<string, { x: number; y: number; size: number } | null>;
  constellationSvg: PageRect | null;
}

/** Planet ref key — matches the keys in the planetRefs map */
type PlanetRefKey = "mercury" | "venus" | "earth" | "sun" | "mars" | "jupiter" | "saturn-wrap";

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

interface UseScrollStateMachineArgs {
  /** getPlanetRef is provided by useMorphCoordinates — looks up a planet element by key */
  getPlanetRef: (refKey: PlanetRefKey) => HTMLDivElement | null;
  /** The card wrapper ref from the main component (needed for projector coord sync) */
  cardWrapperRef: React.RefObject<HTMLDivElement | null>;
  /** Currently selected club slug (needed for projector coord sync during layout) */
  selectedClub: string | null;
  /** Called when projector coordinates need updating — passes computed coords or null */
  onProjectorCoordsChange: (coords: { x1: number; y1: number; x2: number; y2: number; x3: number; y3: number } | null) => void;
  /** Shared layout cache ref — owned by the component, shared with useMorphCoordinates */
  layoutCacheRef: React.RefObject<LayoutCache>;
}

/**
 * Calculates projector and zoom target coordinates relative to the card wrapper's cached page rect
 * and current scroll position to prevent layout thrashing inside the rAF loop.
 */
function getProjectorAndTargetCoordsCached(
  cardPageRect: PageRect | null,
  scrollX: number,
  scrollY: number,
  windowWidth: number,
  windowHeight: number
) {
  const isDesktop = windowWidth >= 1024;

  if (cardPageRect) {
    const cardRect = {
      left: cardPageRect.pageLeft - scrollX,
      top: cardPageRect.pageTop - scrollY,
      width: cardPageRect.width,
      height: cardPageRect.height,
      right: cardPageRect.pageLeft + cardPageRect.width - scrollX,
      bottom: cardPageRect.pageTop + cardPageRect.height - scrollY,
    };
    if (isDesktop) {
      const zTargetVpX = cardRect.left - cardRect.width * 0.75;
      const zTargetVpY = cardRect.top + cardRect.height * 0.5;
      return {
        zTargetVpX,
        zTargetVpY,
        x1: zTargetVpX,
        y1: zTargetVpY,
        x2: cardRect.left,
        y2: cardRect.top,
        x3: cardRect.left,
        y3: cardRect.bottom,
      };
    } else {
      const zTargetVpX = cardRect.left + cardRect.width * 0.5;
      const zTargetVpY = cardRect.top - 180;
      return {
        zTargetVpX,
        zTargetVpY,
        x1: zTargetVpX,
        y1: zTargetVpY,
        x2: cardRect.left,
        y2: cardRect.top,
        x3: cardRect.right,
        y3: cardRect.top,
      };
    }
  }

  const fallbackTargetX = isDesktop ? windowWidth * 0.18 : windowWidth * 0.5;
  const fallbackTargetY = isDesktop ? windowHeight * 0.5 : windowHeight * 0.25;

  return {
    zTargetVpX: fallbackTargetX,
    zTargetVpY: fallbackTargetY,
    x1: fallbackTargetX,
    y1: fallbackTargetY,
    x2: isDesktop ? windowWidth * 0.5 : windowWidth * 0.1,
    y2: isDesktop ? windowHeight * 0.2 : windowHeight * 0.6,
    x3: isDesktop ? windowWidth * 0.5 : windowWidth * 0.9,
    y3: isDesktop ? windowHeight * 0.8 : windowHeight * 0.6,
  };
}

export { getProjectorAndTargetCoordsCached };
export type { Phase, PageRect, LayoutCache, PlanetRefKey, PlanetDotMorph };

export default function useScrollStateMachine({
  getPlanetRef,
  cardWrapperRef,
  selectedClub,
  onProjectorCoordsChange,
  layoutCacheRef,
}: UseScrollStateMachineArgs) {
  /* ── DOM anchor refs ── */
  const clubsAnchorRef = useRef<HTMLDivElement>(null);
  const aboutAnchorRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HeroHandle>(null);
  const constellationSvgRef = useRef<SVGSVGElement>(null);

  /* ── Continuous animation refs (NEVER useState) ── */
  const phaseRef = useRef<Phase>("hero");
  const atomProgressRef = useRef(0);
  const aboutProgressRef = useRef(0);
  const eventsMorphRef = useRef(0);
  const activeAboutNodeRef = useRef(0);
  const prevActiveNodeRef = useRef(-1);
  const prevShowTextRef = useRef(false);
  const initializedRef = useRef(false);
  const pendingZoomSlugRef = useRef<string | null>(null);

  /* ── Discrete state (only updates on threshold crossings) ── */
  const [clubsTextVisible, setClubsTextVisible] = useState(false);
  const [activeAboutNode, setActiveAboutNode] = useState(0);


  /* ── Layout geometry measurement (batched DOM reads) ── */
  const updateLayoutGeometry = useCallback(() => {
    if (typeof window === "undefined") return;

    const sx = window.scrollX;
    const sy = window.scrollY;

    const getPageRect = (el: HTMLElement | null): PageRect | null => {
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        pageLeft: rect.left + sx,
        pageTop: rect.top + sy,
        width: rect.width,
        height: rect.height,
      };
    };

    const getPlanetPagePoint = (refKeys: PlanetRefKey[]) => {
      for (const refKey of refKeys) {
        const el = getPlanetRef(refKey);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) continue;
        return {
          x: rect.left + sx + rect.width / 2,
          y: rect.top + sy + rect.height / 2,
          size: Math.max(rect.width, rect.height),
        };
      }
      return null;
    };

    const heroAnchorEl = heroRef.current?.getAtomOrigin() ?? null;
    const clubsSection = document.getElementById("clubs");
    const aboutSection = document.getElementById("about");
    const eventsSection = document.getElementById("events");
    const gallerySection = document.getElementById("gallery");
    const svgEl = constellationSvgRef.current;

    const planetCoords: Record<string, { x: number; y: number; size: number } | null> = {};
    PLANET_DOT_MORPHS.forEach((morph) => {
      planetCoords[morph.key] = getPlanetPagePoint(morph.refKeys);
    });

    layoutCacheRef.current = {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      scrollX: sx,
      scrollY: sy,

      heroAnchor: getPageRect(heroAnchorEl),
      clubsAnchor: getPageRect(clubsAnchorRef.current),
      aboutAnchor: getPageRect(aboutAnchorRef.current),
      cardWrapper: getPageRect(cardWrapperRef.current),

      clubsSectionTop: clubsSection ? clubsSection.getBoundingClientRect().top + sy : 0,
      aboutSectionTop: aboutSection ? aboutSection.getBoundingClientRect().top + sy : 0,
      aboutSectionHeight: aboutSection ? aboutSection.offsetHeight : 0,
      eventsSectionTop: eventsSection ? eventsSection.getBoundingClientRect().top + sy : 0,
      eventsSectionHeight: eventsSection ? eventsSection.offsetHeight : 0,
      gallerySectionTop: gallerySection ? gallerySection.getBoundingClientRect().top + sy : 0,

      planets: planetCoords,
      constellationSvg: svgEl ? {
        pageLeft: svgEl.getBoundingClientRect().left + sx,
        pageTop: svgEl.getBoundingClientRect().top + sy,
        width: svgEl.getBoundingClientRect().width,
        height: svgEl.getBoundingClientRect().height,
      } : null,
    };

    // If the card is open, keep projector coordinates in sync with current cache/scroll
    if (selectedClub && phaseRef.current !== "about" && layoutCacheRef.current.cardWrapper) {
      const cache = layoutCacheRef.current;
      const coords = getProjectorAndTargetCoordsCached(
        cache.cardWrapper,
        cache.scrollX,
        cache.scrollY,
        cache.windowWidth,
        cache.windowHeight
      );
      onProjectorCoordsChange({
        x1: coords.x1,
        y1: coords.y1,
        x2: coords.x2,
        y2: coords.y2,
        x3: coords.x3,
        y3: coords.y3,
      });
    } else {
      onProjectorCoordsChange(null);
    }
  }, [selectedClub, getPlanetRef, cardWrapperRef, onProjectorCoordsChange, layoutCacheRef]);

  /* ── Holographic Projector Coordinate Updater (Club zoom only) ── */
  const updateProjectorCoords = useCallback(() => {
    if (typeof window === "undefined") return;
    const cache = layoutCacheRef.current;
    if (selectedClub && cache.cardWrapper && phaseRef.current !== "about") {
      const coords = getProjectorAndTargetCoordsCached(
        cache.cardWrapper,
        cache.scrollX,
        cache.scrollY,
        cache.windowWidth,
        cache.windowHeight
      );
      onProjectorCoordsChange({
        x1: coords.x1,
        y1: coords.y1,
        x2: coords.x2,
        y2: coords.y2,
        x3: coords.x3,
        y3: coords.y3,
      });
    } else {
      onProjectorCoordsChange(null);
    }
  }, [selectedClub, onProjectorCoordsChange, layoutCacheRef]);

  /* ── Scroll listener: update cache coordinates (passive, no renders) ── */
  useEffect(() => {
    const handleScroll = () => {
      layoutCacheRef.current.scrollX = window.scrollX;
      layoutCacheRef.current.scrollY = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [layoutCacheRef]);

  /* ── ResizeObserver + resize listener for layout geometry ── */
  useEffect(() => {
    updateLayoutGeometry();

    const t1 = setTimeout(updateLayoutGeometry, 100);
    const t2 = setTimeout(updateLayoutGeometry, 500);
    const t3 = setTimeout(updateLayoutGeometry, 2000);

    const observer = new ResizeObserver(() => {
      updateLayoutGeometry();
    });

    if (clubsAnchorRef.current) observer.observe(clubsAnchorRef.current);
    if (aboutAnchorRef.current) observer.observe(aboutAnchorRef.current);
    if (cardWrapperRef.current) observer.observe(cardWrapperRef.current);

    const heroAnchorEl = heroRef.current?.getAtomOrigin() ?? null;
    if (heroAnchorEl) observer.observe(heroAnchorEl);

    const clubsSection = document.getElementById("clubs");
    if (clubsSection) observer.observe(clubsSection);
    const aboutSection = document.getElementById("about");
    if (aboutSection) observer.observe(aboutSection);
    const eventsSection = document.getElementById("events");
    if (eventsSection) observer.observe(eventsSection);
    const gallerySection = document.getElementById("gallery");
    if (gallerySection) observer.observe(gallerySection);

    window.addEventListener("resize", updateLayoutGeometry);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      observer.disconnect();
      window.removeEventListener("resize", updateLayoutGeometry);
    };
  }, [updateLayoutGeometry, cardWrapperRef]);

  /* ── Page-Level Scroll Snapping ── */
  /* NOTE: Native CSS snap classes (snap-y, snap-mandatory, scroll-smooth) have been
     removed. Lenis smooth scroll now handles momentum and programmatic section snapping
     via useLenis.ts. Native CSS snap would fight Lenis's interpolation and cause jitter. */

  /* ── Lock scroll when a club is selected (zoomed/zooming) ── */
  useEffect(() => {
    if (selectedClub) {
      document.documentElement.classList.add("overflow-hidden");
    } else {
      document.documentElement.classList.remove("overflow-hidden");
    }
    return () => {
      document.documentElement.classList.remove("overflow-hidden");
    };
  }, [selectedClub]);

  /* ── IntersectionObserver for Phase Tracking ── */
  useEffect(() => {
    const sectionIds = ["hero", "clubs", "about", "events", "gallery"];
    const elements = sectionIds.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const phase = entry.target.id as Phase;
            if (phaseRef.current !== "zooming" && phaseRef.current !== "zoomed") {
              phaseRef.current = phase;
            }
          }
        });
      },
      {
        root: null,
        rootMargin: "-50% 0px -50% 0px",
        threshold: 0,
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  /* ── IntersectionObserver for About Panel Tracking ── */
  useEffect(() => {
    const panels = document.querySelectorAll(".about-panel");
    if (panels.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const node = parseInt(
              entry.target.getAttribute("data-node") || "0",
              10,
            );
            setActiveAboutNode(node);
          }
        });
      },
      { threshold: 0.5, rootMargin: "-10% 0px -10% 0px" },
    );
    panels.forEach((panel) => observer.observe(panel));
    return () => {
      panels.forEach((panel) => observer.unobserve(panel));
      observer.disconnect();
    };
  }, []);

  /**
   * Called from the rAF loop to compute scroll-derived progress values.
   * Writes directly to refs — no React state updates for continuous values.
   * Only updates discrete state (clubsTextVisible, activeAboutNode) on threshold crossings.
   */
  const computeScrollProgress = useCallback(() => {
    const cache = layoutCacheRef.current;
    let posT = 0;
    let aboutT = 0;

    if (
      phaseRef.current === "zooming" ||
      phaseRef.current === "zoomed"
    ) {
      posT = 1;
      aboutT = 0;
      eventsMorphRef.current = 0;
      atomProgressRef.current = 1;
      aboutProgressRef.current = 0;
    } else {
      const clubsSectionTop = cache.clubsSectionTop;
      const aboutSectionTop = cache.aboutSectionTop;
      const eventsSectionTop = cache.eventsSectionTop;
      const gallerySectionTop = cache.gallerySectionTop;

      const clubsScrollY = clubsSectionTop - HEADER_H;
      const aboutScrollY = aboutSectionTop
        ? aboutSectionTop - HEADER_H
        : clubsScrollY + cache.windowHeight * 0.8;
      const eventsScrollY = eventsSectionTop
        ? eventsSectionTop - HEADER_H
        : aboutScrollY + cache.aboutSectionHeight;
      const galleryScrollY = gallerySectionTop
        ? gallerySectionTop - HEADER_H
        : eventsScrollY + cache.eventsSectionHeight;

      const sy = window.scrollY;

      if (sy < clubsScrollY) {
        phaseRef.current = "hero";
        posT = Math.min(1, Math.max(0, sy / Math.max(clubsScrollY, 1)));
        aboutT = 0;
        eventsMorphRef.current = 0;
      } else if (sy < aboutScrollY) {
        phaseRef.current = "clubs";
        posT = 1;
        aboutT = Math.min(1, Math.max(0,
          (sy - clubsScrollY) / Math.max(aboutScrollY - clubsScrollY, 1),
        ));
        eventsMorphRef.current = 0;
      } else if (sy < eventsScrollY) {
        phaseRef.current = "about";
        posT = 1;
        aboutT = 1;
        eventsMorphRef.current = 0;

        if (aboutSectionTop) {
          const sectionScrolled = sy + HEADER_H - aboutSectionTop;
          const scrollableH = cache.aboutSectionHeight - cache.windowHeight;
          const subProg = Math.min(1, Math.max(0,
            sectionScrolled / Math.max(scrollableH, 1),
          ));
          const nodeIdx = subProg < 0.33 ? 0 : subProg < 0.66 ? 1 : 2;
          activeAboutNodeRef.current = nodeIdx;
          if (nodeIdx !== prevActiveNodeRef.current) {
            prevActiveNodeRef.current = nodeIdx;
            setActiveAboutNode(nodeIdx);
            updateProjectorCoords();
          }
        }
      } else if (sy < galleryScrollY) {
        phaseRef.current = "events";
        posT = 1;
        aboutT = 1;
        eventsMorphRef.current = 1;
      } else {
        phaseRef.current = "gallery";
        posT = 1;
        aboutT = 1;
        eventsMorphRef.current = 1;
      }
      atomProgressRef.current = posT;
      aboutProgressRef.current = aboutT;
    }

    /* Discrete clubsTextVisible threshold crossing */
    const showText = posT > 0.55;
    if (showText !== prevShowTextRef.current) {
      prevShowTextRef.current = showText;
      setClubsTextVisible(showText);
    }
  }, [updateProjectorCoords, layoutCacheRef]);

  /**
   * Called once on first valid frame to set correct initial state
   * based on current scroll position (handles page refresh mid-scroll).
   */
  const initializeFromScroll = useCallback(() => {
    if (initializedRef.current) return false;
    const cache = layoutCacheRef.current;
    if (!cache.heroAnchor) return false;

    initializedRef.current = true;
    const clubsSectionTop = cache.clubsSectionTop;
    const aboutSectionTop = cache.aboutSectionTop;
    const eventsSectionTop = cache.eventsSectionTop;
    const sy = window.scrollY;

    if (
      eventsSectionTop &&
      sy >= eventsSectionTop - HEADER_H - 50
    ) {
      phaseRef.current = "events";
      atomProgressRef.current = 1;
      aboutProgressRef.current = 1;
      eventsMorphRef.current = 1;
      prevShowTextRef.current = true;
      setClubsTextVisible(true);
    } else if (
      aboutSectionTop &&
      sy >= aboutSectionTop - HEADER_H - 50
    ) {
      phaseRef.current = "about";
      atomProgressRef.current = 1;
      aboutProgressRef.current = 1;
      eventsMorphRef.current = 0;
      prevShowTextRef.current = true;
      setClubsTextVisible(true);
    } else if (
      clubsSectionTop &&
      sy >= clubsSectionTop - HEADER_H - 50
    ) {
      phaseRef.current = "clubs";
      atomProgressRef.current = 1;
      aboutProgressRef.current = 0;
      eventsMorphRef.current = 0;
      prevShowTextRef.current = true;
      setClubsTextVisible(true);
    }
    return true;
  }, [layoutCacheRef]);

  return {
    // DOM anchor refs
    clubsAnchorRef,
    aboutAnchorRef,
    heroRef,
    constellationSvgRef,

    // Continuous animation refs (read in rAF loop, no renders)
    phaseRef,
    atomProgressRef,
    aboutProgressRef,
    eventsMorphRef,
    activeAboutNodeRef,
    pendingZoomSlugRef,
    initializedRef,

    // Layout geometry updaters
    updateLayoutGeometry,
    updateProjectorCoords,

    // Discrete state (only changes on threshold crossings)
    clubsTextVisible,
    activeAboutNode,

    // rAF helpers
    computeScrollProgress,
    initializeFromScroll,
  };
}
