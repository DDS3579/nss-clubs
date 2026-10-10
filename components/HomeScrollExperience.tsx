"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Hero from "./Hero";
import HeroAtom from "./HeroAtom";
import EventsConstellation from "./EventsConstellation";
import GalleryOrbit from "./home/GalleryOrbit";
import ConstellationFooter from "./layout/ConstellationFooter";
import { urlFor } from "@/sanity/lib/image";
import type { HomepageData } from "@/sanity/lib/types";
import { ALL_NODES, getZoomRotation } from "@/lib/clubs";
import { clamp01, easeInOutQuart, lerp } from "@/lib/math";
import "./home/home-experience.css";

/* ─── custom hooks ─── */
import useScrollStateMachine, {
  getProjectorAndTargetCoordsCached,
  type LayoutCache,
} from "@/hooks/useScrollStateMachine";
import useMorphCoordinates, { PLANET_DOT_MORPHS } from "@/hooks/useMorphCoordinates";
import useLenis from "@/hooks/useLenis";

/* ─── constants ─── */
const CANVAS_INTRINSIC = 640;

function ClubIcon({ name, className }: { name: string; className?: string }) {
  const props = {
    className: className || "w-5 h-5",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.5,
    viewBox: "0 0 24 24",
  };
  switch (name) {
    case "Terminal":
      return (
        <svg {...props}>
          <polyline
            points="4 17 10 11 4 5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="12"
            y1="19"
            x2="20"
            y2="19"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Trophy":
      return (
        <svg {...props}>
          <path
            d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M4 22h16" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 2a6 6 0 0 1 6 6c0 3.6-2 5.5-6 6.5-4-1-6-2.9-6-6.5a6 6 0 0 1 6-6Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "BookOpen":
      return (
        <svg {...props}>
          <path
            d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Palette":
      return (
        <svg {...props}>
          <path
            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.32115 19.4626 5.37256 20.2036 4.97549 20.7256C4.42398 21.4507 3.50428 21.8491 2.5 22C4.52044 22 8.78453 22 12 22Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="7.5" cy="10.5" r="1" fill="currentColor" />
          <circle cx="11.5" cy="7.5" r="1" fill="currentColor" />
          <circle cx="16.5" cy="9.5" r="1" fill="currentColor" />
          <circle cx="15.5" cy="14.5" r="1" fill="currentColor" />
        </svg>
      );
    case "Music":
      return (
        <svg {...props}>
          <path
            d="M9 18V5l12-2v13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      );
    case "Heart":
      return (
        <svg {...props}>
          <path
            d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Shield":
      return (
        <svg {...props}>
          <path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

/* ─── zoom animation constants ─── */
const ZOOM_DURATION = 2400;
const NUCLEUS_ZOOM_DURATION = 3200;
const ZOOM_SCALE_FACTOR = 5.5;
const ELECTRON_TARGET_X = 520;
const ELECTRON_TARGET_Y = 320;

interface ZoomAnimState {
  direction: "forward" | "reverse";
  startTime: number;
  slug: string;
  targetRotation: number;
  electronCanvasX: number;
  electronCanvasY: number;
  clubsFloatX: number;
  clubsFloatY: number;
  clubsScale: number;
}

export default function HomeScrollExperience({ data }: { data: HomepageData }) {
  /* ── Component-level refs (zoom animation, floating element) ── */
  const floatingRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const rotationOffsetRef = useRef(0);
  const nucleusSeparationRef = useRef(0);
  const zoomActiveRef = useRef(false);
  const atomPausedRef = useRef(false);
  const zoomAnimRef = useRef<ZoomAnimState | null>(null);
  const cardWrapperRef = useRef<HTMLDivElement>(null);

  /* ── Component-level state (discrete, render-triggering) ── */
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [cardRevealVisible, setCardRevealVisible] = useState(false);
  const [projectorCoords, setProjectorCoords] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    x3: number;
    y3: number;
  } | null>(null);

  /* ── Stable callback for projector coord updates from scroll hook ── */
  const onProjectorCoordsChange = useCallback((coords: { x1: number; y1: number; x2: number; y2: number; x3: number; y3: number } | null) => {
    setProjectorCoords(coords);
  }, []);

  /* ── Shared layout cache ref (owned here, passed to both hooks) ── */
  const layoutCacheRef = useRef<LayoutCache>({
    windowWidth: 1200,
    windowHeight: 800,
    scrollX: 0,
    scrollY: 0,
    heroAnchor: null,
    clubsAnchor: null,
    aboutAnchor: null,
    cardWrapper: null,
    clubsSectionTop: 0,
    aboutSectionTop: 0,
    aboutSectionHeight: 0,
    eventsSectionTop: 0,
    eventsSectionHeight: 0,
    gallerySectionTop: 0,
    planets: {},
    constellationSvg: null,
  });

  /* ═══ HOOK: Morph Coordinates (planet refs, ghost elements) ═══ */
  const {
    planetMercuryRef,
    planetVenusRef,
    planetEarthRef,
    planetSunRef,
    planetMarsRef,
    planetJupiterRef,
    planetSaturnWrapRef,
    getPlanetRef,
    morphGhostRefs,
    morphedDotIds,
    updateMorphGhosts,
  } = useMorphCoordinates({ layoutCacheRef });

  /* ═══ HOOK: Scroll State Machine (phase, progress, layout cache, observers) ═══ */
  const {
    clubsAnchorRef,
    aboutAnchorRef,
    heroRef,
    constellationSvgRef,
    phaseRef,
    atomProgressRef,
    aboutProgressRef,
    eventsMorphRef,
    pendingZoomSlugRef,
    initializedRef,
    updateLayoutGeometry,
    clubsTextVisible,
    computeScrollProgress,
    initializeFromScroll,
  } = useScrollStateMachine({
    getPlanetRef,
    cardWrapperRef,
    selectedClub,
    onProjectorCoordsChange,
    layoutCacheRef,
  });



  /* ═══ HOOK: Lenis Smooth Scroll (momentum, CSS vars, programmatic snap) ═══ */
  const { scrollTo: lenisScrollTo, stop: lenisStop, start: lenisStart } = useLenis({
    phaseRef,
    eventsMorphRef,
  });

  /* ── Zoom initialization ── */
  const initZoom = useCallback((slug: string) => {
    const clubsAnchor = clubsAnchorRef.current;
    if (!clubsAnchor) return;
    const clubsRect = clubsAnchor.getBoundingClientRect();
    const clubsCx = clubsRect.left + clubsRect.width / 2;
    const clubsCy = clubsRect.top + clubsRect.height / 2;
    const clubsScale = clubsRect.width / CANVAS_INTRINSIC;
    const clubsFloatX = clubsCx - CANVAS_INTRINSIC / 2;
    const clubsFloatY = clubsCy - CANVAS_INTRINSIC / 2;
    const isNucleus = slug === "executive-team";
    const targetRotation = getZoomRotation(slug);
    const electronCanvasX = isNucleus
      ? CANVAS_INTRINSIC / 2
      : ELECTRON_TARGET_X;
    const electronCanvasY = isNucleus
      ? CANVAS_INTRINSIC / 2
      : ELECTRON_TARGET_Y;

    setSelectedClub(slug);
    setCardRevealVisible(false);
    phaseRef.current = "zooming";
    zoomActiveRef.current = true; // atom canvas switches to extra-sharp
    lenisStop(); // Freeze Lenis during zoom animation to prevent scroll interference
    zoomAnimRef.current = {
      direction: "forward",
      startTime: performance.now(),
      slug,
      targetRotation,
      electronCanvasX,
      electronCanvasY,
      clubsFloatX,
      clubsFloatY,
      clubsScale,
    };
  }, [clubsAnchorRef, phaseRef, lenisStop]);

  /* ── Electron & Nucleus Click Handler ── */
  const handleElectronClick = useCallback(
    (slug: string) => {
      if (
        phaseRef.current === "zooming" ||
        phaseRef.current === "zoomed" ||
        phaseRef.current === "about"
      )
        return;
      if (phaseRef.current === "hero") {
        pendingZoomSlugRef.current = slug;
        lenisScrollTo("#clubs", {
          duration: 1.2,
          onComplete: () => {
            const pendingSlug = pendingZoomSlugRef.current;
            if (pendingSlug) {
              pendingZoomSlugRef.current = null;
            updateLayoutGeometry();
              // Center the atom in viewport before zoom (lower in viewport = scroll more down)
              const clubsAnchor = clubsAnchorRef.current;
              if (clubsAnchor) {
                const rect = clubsAnchor.getBoundingClientRect();
                const atomCenterY = rect.top + rect.height / 2 + window.scrollY;
                const targetScrollY = atomCenterY - window.innerHeight / 2 + 25;
                lenisScrollTo(targetScrollY, { immediate: true });
                updateLayoutGeometry();
              }
              initZoom(pendingSlug);
            }
          },
        });
      } else if (phaseRef.current === "clubs") {
        initZoom(slug);
      }
    },
    [initZoom, phaseRef, pendingZoomSlugRef, lenisScrollTo, updateLayoutGeometry, clubsAnchorRef],
  );

  /* ── Close club card and reverse zoom ── */
  const handleCloseClub = useCallback(() => {
    if (phaseRef.current !== "zoomed") return;
    const slug = selectedClub;
    if (!slug) return;
    const clubsAnchor = clubsAnchorRef.current;
    if (!clubsAnchor) return;

    // Instantly scroll to center the atom in viewport (lower in viewport = scroll more down)
    const rect = clubsAnchor.getBoundingClientRect();
    const atomCenterY = rect.top + rect.height / 2 + window.scrollY;
    const targetScrollY = atomCenterY - window.innerHeight / 2;
    lenisScrollTo(targetScrollY, { immediate: true });
    // Force layout cache sync to get correct coordinates at the new scroll position
    updateLayoutGeometry();

    const clubsRect = clubsAnchor.getBoundingClientRect();
    const clubsCx = clubsRect.left + clubsRect.width / 2;
    const clubsCy = clubsRect.top + clubsRect.height / 2;
    const clubsScale = clubsRect.width / CANVAS_INTRINSIC;
    const clubsFloatX = clubsCx - CANVAS_INTRINSIC / 2;
    const clubsFloatY = clubsCy - CANVAS_INTRINSIC / 2;
    const isNucleus = slug === "executive-team";
    const targetRotation = getZoomRotation(slug);
    const electronCanvasX = isNucleus
      ? CANVAS_INTRINSIC / 2
      : ELECTRON_TARGET_X;
    const electronCanvasY = isNucleus
      ? CANVAS_INTRINSIC / 2
      : ELECTRON_TARGET_Y;

    setCardRevealVisible(false);
    phaseRef.current = "zooming";
    zoomAnimRef.current = {
      direction: "reverse",
      startTime: performance.now(),
      slug,
      targetRotation,
      electronCanvasX,
      electronCanvasY,
      clubsFloatX,
      clubsFloatY,
      clubsScale,
    };
  }, [selectedClub, phaseRef, clubsAnchorRef, lenisScrollTo, updateLayoutGeometry]);

  // Pending zoom triggers are now handled synchronously inside the frame tick loop below to prevent state-race conditions.

  /* ══════════════════════════════════════════════════════════════
     MAIN ANIMATION LOOP — Pure DOM writes via refs
     No React state updates for continuous values.
     Only discrete state (setCardRevealVisible, setSelectedClub)
     on zoom completion boundaries.
  ══════════════════════════════════════════════════════════════ */
  useEffect(() => {
    const tick = (now: number) => {
      const cache = layoutCacheRef.current;

      // Cheap "is the hero mounted?" check. (This used to call getAtomOrigin(), which
      // runs getBoundingClientRect() — a forced layout read — on every single frame.
      // The real measurements are cached by updateLayoutGeometry.)
      const heroMounted = heroRef.current !== null;
      const clubsAnchor = clubsAnchorRef.current;
      const floating = floatingRef.current;
      const canvasWrap = canvasWrapRef.current;

      if (!heroMounted || !clubsAnchor || !floating || !canvasWrap) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // If the cache isn't initialized yet, try to run a measurement once.
      if (!cache.heroAnchor) {
        updateLayoutGeometry();
      }

      // Initialize phase from current scroll position on first valid frame
      if (!initializedRef.current && cache.heroAnchor) {
        initializeFromScroll();
        floating.style.opacity = "1";
      }

      // Compute scroll-derived progress values (writes to refs, not state)
      computeScrollProgress();

      // ── Position the floating atom canvas ──
      let cx = 0,
        cy = 0,
        size = 0;

      const heroRect = cache.heroAnchor;
      const clubsRect = cache.clubsAnchor;
      const aboutAnchor = cache.aboutAnchor;

      if (heroRect && clubsRect) {
        if (aboutProgressRef.current > 0.001 && aboutAnchor) {
          const targetX = aboutAnchor.pageLeft - window.scrollX + aboutAnchor.width / 2;
          const targetY = aboutAnchor.pageTop - window.scrollY + aboutAnchor.height / 2;
          const targetSize = aboutAnchor.width;

          const fromCx = clubsRect.pageLeft - window.scrollX + clubsRect.width / 2;
          const fromCy = clubsRect.pageTop - window.scrollY + clubsRect.height / 2;

          cx = lerp(fromCx, targetX, aboutProgressRef.current);
          cy = lerp(fromCy, targetY, aboutProgressRef.current);
          size = lerp(clubsRect.width, targetSize, aboutProgressRef.current);
        } else {
          const fromCx = heroRect.pageLeft - window.scrollX + heroRect.width / 2;
          const fromCy = heroRect.pageTop - window.scrollY + heroRect.height / 2;
          const toCx = clubsRect.pageLeft - window.scrollX + clubsRect.width / 2;
          const toCy = clubsRect.pageTop - window.scrollY + clubsRect.height / 2;
          cx = lerp(fromCx, toCx, atomProgressRef.current);
          cy = lerp(fromCy, toCy, atomProgressRef.current);
          size = lerp(heroRect.width, clubsRect.width, atomProgressRef.current);
        }
      }

      // Direct DOM writes — bypass React VDOM
      floating.style.transform = `translate(${cx - CANVAS_INTRINSIC / 2}px, ${cy - CANVAS_INTRINSIC / 2}px)`;
      canvasWrap.style.transform = `scale(${size / CANVAS_INTRINSIC})`;

      if (aboutProgressRef.current > 0.001) {
        const fadeOut = 1 - clamp01((aboutProgressRef.current - 0.55) / 0.35);
        floating.style.opacity = `${fadeOut}`;
        atomPausedRef.current = fadeOut <= 0.01;
      } else {
        floating.style.opacity = '1';
        atomPausedRef.current = false;
      }

      // Direct DOM class manipulation for about section
      const aboutSection = document.getElementById("about");
      if (aboutSection) {
        const isEvents = phaseRef.current === "events" || phaseRef.current === "gallery";

        if (isEvents) {
          if (!aboutSection.classList.contains("exhaled")) {
            aboutSection.classList.add("exhaled");
          }
          if (aboutSection.classList.contains("revealed")) {
            aboutSection.classList.remove("revealed");
          }
        } else if (aboutProgressRef.current > 0.45) {
          if (!aboutSection.classList.contains("revealed")) {
            aboutSection.classList.add("revealed");
          }
          if (aboutSection.classList.contains("exhaled")) {
            aboutSection.classList.remove("exhaled");
          }
        } else if (aboutProgressRef.current < 0.15) {
          if (aboutSection.classList.contains("revealed")) {
            aboutSection.classList.remove("revealed");
          }
          if (aboutSection.classList.contains("exhaled")) {
            aboutSection.classList.remove("exhaled");
          }
        }
      }

      // Morph ghosts — direct DOM style writes via the hook
      updateMorphGhosts(eventsMorphRef.current);

      // ── Zoom animation (reads zoomAnimRef, writes to floating/canvasWrap styles) ──
      if (
        (phaseRef.current === "zooming" || phaseRef.current === "zoomed") &&
        zoomAnimRef.current
      ) {
        const zoom = zoomAnimRef.current;
        const isNucleusZoom = zoom.slug === "executive-team";
        const duration = isNucleusZoom ? NUCLEUS_ZOOM_DURATION : ZOOM_DURATION;
        const zTargetScale = zoom.clubsScale * ZOOM_SCALE_FACTOR;
        const coords = getProjectorAndTargetCoordsCached(
          cache.cardWrapper,
          window.scrollX,
          window.scrollY,
          cache.windowWidth,
          cache.windowHeight
        );
        const zTargetVpX = coords.zTargetVpX;
        const zTargetVpY = coords.zTargetVpY;
        const halfC = CANVAS_INTRINSIC / 2;
        const zoomedFloatX =
          zTargetVpX - halfC - (zoom.electronCanvasX - halfC) * zTargetScale;
        const zoomedFloatY =
          zTargetVpY - halfC - (zoom.electronCanvasY - halfC) * zTargetScale;

        if (phaseRef.current === "zoomed") {
          rotationOffsetRef.current = zoom.targetRotation;
          if (isNucleusZoom) nucleusSeparationRef.current = 1;
          floating.style.transform = `translate(${zoomedFloatX}px, ${zoomedFloatY}px)`;
          canvasWrap.style.transform = `scale(${zTargetScale})`;
        } else {
          const zElapsed = now - zoom.startTime;
          const totalT = clamp01(zElapsed / duration);
          if (zoom.direction === "forward") {
            if (isNucleusZoom) {
              const sepT = clamp01(totalT / 0.3);
              nucleusSeparationRef.current = easeInOutQuart(sepT);
              const zoomT = clamp01((totalT - 0.22) / 0.56);
              const zEased = easeInOutQuart(zoomT);
              const curFloatX = lerp(zoom.clubsFloatX, zoomedFloatX, zEased);
              const curFloatY = lerp(zoom.clubsFloatY, zoomedFloatY, zEased);
              const curScale = lerp(zoom.clubsScale, zTargetScale, zEased);
              floating.style.transform = `translate(${curFloatX}px, ${curFloatY}px)`;
              canvasWrap.style.transform = `scale(${curScale})`;
              if (totalT > 0.72) setCardRevealVisible(true);
              if (totalT >= 1) phaseRef.current = "zoomed";
            } else {
              const rotT =
                zoom.targetRotation === 0 ? 1 : clamp01(totalT / 0.35);
              rotationOffsetRef.current =
                easeInOutQuart(rotT) * zoom.targetRotation;
              const zoomT = clamp01((totalT - 0.15) / 0.65);
              const zEased = easeInOutQuart(zoomT);
              const curFloatX = lerp(zoom.clubsFloatX, zoomedFloatX, zEased);
              const curFloatY = lerp(zoom.clubsFloatY, zoomedFloatY, zEased);
              const curScale = lerp(zoom.clubsScale, zTargetScale, zEased);
              floating.style.transform = `translate(${curFloatX}px, ${curFloatY}px)`;
              canvasWrap.style.transform = `scale(${curScale})`;
              if (totalT > 0.72) setCardRevealVisible(true);
              if (totalT >= 1) phaseRef.current = "zoomed";
            }
          } else {
            if (isNucleusZoom) {
              const zoomRevT = clamp01((totalT - 0.05) / 0.55);
              const zRevEased = easeInOutQuart(zoomRevT);
              const curFloatX = lerp(zoomedFloatX, zoom.clubsFloatX, zRevEased);
              const curFloatY = lerp(zoomedFloatY, zoom.clubsFloatY, zRevEased);
              const curScale = lerp(zTargetScale, zoom.clubsScale, zRevEased);
              floating.style.transform = `translate(${curFloatX}px, ${curFloatY}px)`;
              canvasWrap.style.transform = `scale(${curScale})`;
              const rejoinT = clamp01((totalT - 0.55) / 0.45);
              nucleusSeparationRef.current = 1 - easeInOutQuart(rejoinT);
              if (totalT >= 1) {
                phaseRef.current = "clubs";
                zoomAnimRef.current = null;
                rotationOffsetRef.current = 0;
                nucleusSeparationRef.current = 0;
                zoomActiveRef.current = false;
                setSelectedClub(null);
                setCardRevealVisible(false);
                lenisStart(); // Resume Lenis after reverse zoom completes
              }
            } else {
              const zoomRevT = clamp01((totalT - 0.05) / 0.65);
              const zRevEased = easeInOutQuart(zoomRevT);
              const curFloatX = lerp(zoomedFloatX, zoom.clubsFloatX, zRevEased);
              const curFloatY = lerp(zoomedFloatY, zoom.clubsFloatY, zRevEased);
              const curScale = lerp(zTargetScale, zoom.clubsScale, zRevEased);
              floating.style.transform = `translate(${curFloatX}px, ${curFloatY}px)`;
              canvasWrap.style.transform = `scale(${curScale})`;
              const rotRevT =
                zoom.targetRotation === 0 ? 1 : clamp01((totalT - 0.5) / 0.5);
              rotationOffsetRef.current =
                (1 - easeInOutQuart(rotRevT)) * zoom.targetRotation;
              if (totalT >= 1) {
                phaseRef.current = "clubs";
                zoomAnimRef.current = null;
                rotationOffsetRef.current = 0;
                zoomActiveRef.current = false;
                setSelectedClub(null);
                setCardRevealVisible(false);
                lenisStart(); // Resume Lenis after reverse zoom completes
              }
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="home-scroll-experience bg-bg">
      <div id="hero" className="scroll-mt-16 [&_.hero-atom-origin]:invisible">
        <Hero ref={heroRef} />
      </div>

      <section
        id="clubs"
        className="relative flex min-h-[calc(100svh-4rem)] scroll-mt-16 overflow-hidden bg-white px-6 py-12 sm:px-8 lg:px-10"
      >
        <div className="mx-auto grid w-full max-w-7xl grid-rows-[1fr_auto] items-center gap-8 lg:grid-cols-2 lg:grid-rows-1 lg:gap-10">
          <div className="flex min-h-[42svh] items-center justify-center lg:min-h-0">
            <div
              ref={clubsAnchorRef}
              className="relative flex aspect-square w-[min(78vw,25rem)] items-center justify-center sm:w-[30rem] lg:w-[34rem]"
            />
          </div>
          <div
            className={`relative flex min-h-[34svh] items-center justify-center lg:min-h-0 transition-all duration-700 ease-out ${selectedClub ? "z-[60]" : "z-10"} ${clubsTextVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <div
              className={`flex flex-col items-center justify-center text-center transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${selectedClub ? "opacity-0 translate-x-[80px] pointer-events-none absolute" : "opacity-100 translate-x-0"}`}
            >
              <h2 className="font-display text-[clamp(3.5rem,11vw,8.5rem)] font-black leading-[0.88] text-primary">
                Our<span className="block text-accent">Clubs.</span>
              </h2>
              <p className="mt-4 font-body text-slate-400 text-sm font-medium animate-pulse">
                Click any electron node or the nucleus to explore
              </p>
            </div>
            <div
              ref={cardWrapperRef}
              className={`transition-all duration-500 ease-out ${cardRevealVisible ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-10 scale-[0.97] pointer-events-none"}`}
              style={{ willChange: "transform, opacity" }}
            >
              {ALL_NODES.map((club) => {
                const isActive = selectedClub === club.slug;
                if (!isActive) return null;
                if (club.isSpecial) {
                  return (
                    <div
                      key={club.slug}
                      className="animate-slide-in-card metallic-card metallic-card-gold relative flex flex-col justify-between pt-10 pb-6 px-10 sm:pt-12 sm:pb-8 sm:px-12 rounded-3xl bg-accent w-full max-w-lg min-h-[460px] overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-primary/20" />
                      <button
                        onClick={handleCloseClub}
                        className="absolute top-6 right-6 p-2 rounded-full text-primary/60 hover:text-primary hover:bg-primary/5 transition-all duration-200 z-20"
                        aria-label="Back to clubs"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                      <div className="flex flex-col h-full justify-between gap-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2.5 opacity-90 animate-flicker-in">
                            <ClubIcon
                              name={club.iconName}
                              className="w-4 h-4 text-primary/70"
                            />
                            <span className="text-[11px] font-bold tracking-[0.2em] text-primary/75 uppercase font-body">
                              {club.category}
                            </span>
                          </div>
                          <h3 className="animate-flicker-in text-carved-light font-display text-4xl sm:text-5xl font-black mb-6 tracking-tight">
                            {club.name}
                          </h3>
                          <div className="animate-fade-in-delayed flex flex-wrap gap-x-2 gap-y-1 text-xs font-semibold text-slate-800/80 font-body">
                            {club.themes.map((theme, i) => (
                              <span key={theme} className="flex items-center">
                                {theme}
                                {i < club.themes.length - 1 && (
                                  <span className="ml-2 mr-0.5 opacity-60">
                                    •
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex-grow flex items-center">
                          <p className="animate-fade-in-delayed font-body text-slate-800 text-sm sm:text-base leading-relaxed max-w-md font-medium">
                            {club.tagline}
                          </p>
                        </div>
                        <div className="animate-fade-in-delayed border-t border-primary/10 pt-5 mt-auto">
                          <div className="grid grid-cols-3 gap-4">
                            {club.stats.map((item) => (
                              <div key={item.label}>
                                <div className="text-[10px] uppercase tracking-wider text-primary/65 font-body font-semibold">
                                  {item.label}
                                </div>
                                <div className="text-sm sm:text-base font-black font-display text-slate-900 mt-0.5">
                                  {item.value}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="animate-fade-in-delayed w-full mt-0">
                          <Link
                            href="#executive-team"
                            className="inline-flex items-center justify-center w-full bg-primary hover:bg-primary/95 text-white text-sm font-bold tracking-wide px-8 py-3.5 rounded-xl transition-all duration-300 active:scale-95 shadow-[0_4px_12px_rgba(2,59,142,0.15)] font-body"
                          >
                            Meet the Executive Team
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <div
                    key={club.slug}
                    className="animate-slide-in-card metallic-card metallic-card-standard relative flex flex-col justify-between pt-10 pb-6 px-10 sm:pt-12 sm:pb-8 sm:px-12 rounded-3xl bg-primary w-full max-w-lg min-h-[460px] overflow-hidden"
                    style={{
                      boxShadow: `inset 0 1.5px 0.5px rgba(255, 255, 255, 0.22), inset 0 -1.5px 1px rgba(0, 0, 0, 0.3), 0 12px 28px -4px rgba(0, 0, 0, 0.25), 0 15px 35px -5px ${club.color}25`,
                    }}
                  >
                    <div
                      className="absolute left-0 top-0 bottom-0 w-[4px]"
                      style={{ backgroundColor: club.color }}
                    />
                    <button
                      onClick={handleCloseClub}
                      className="absolute top-6 right-6 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/8 transition-all duration-200 z-20"
                      aria-label="Back to clubs"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    <div className="flex flex-col h-full justify-between gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2.5 opacity-90 animate-flicker-in">
                          <ClubIcon
                            name={club.iconName}
                            className="w-4 h-4 text-white/70"
                          />
                          <span className="text-[11px] font-bold tracking-[0.2em] text-white/60 uppercase font-body">
                            {club.category}
                          </span>
                        </div>
                        <h3 className="animate-flicker-in text-carved-dark font-display text-4xl sm:text-5xl font-black mb-6 tracking-tight">
                          {club.name}
                        </h3>
                        <div className="animate-fade-in-delayed flex flex-wrap gap-x-2 gap-y-1 text-xs font-medium text-slate-300/80 font-body">
                          {club.themes.map((theme, i) => (
                            <span key={theme} className="flex items-center">
                              {theme}
                              {i < club.themes.length - 1 && (
                                <span className="ml-2 mr-0.5 opacity-60">
                                  •
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex-grow flex items-center">
                        <p className="animate-fade-in-delayed font-body text-slate-200/90 text-sm sm:text-base leading-relaxed max-w-md">
                          {club.tagline}
                        </p>
                      </div>
                      <div className="animate-fade-in-delayed border-t border-white/10 pt-5 mt-auto">
                        <div className="grid grid-cols-3 gap-4">
                          {club.stats.map((item) => (
                            <div key={item.label}>
                              <div className="text-[10px] uppercase tracking-wider text-white/45 font-body font-semibold">
                                {item.label}
                              </div>
                              <div className="text-sm sm:text-base font-bold font-display text-white mt-0.5">
                                {item.value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="animate-fade-in-delayed w-full mt-0">
                        <Link
                          href={`/clubs/${club.slug}`}
                          className="inline-flex items-center justify-center w-full bg-white hover:bg-slate-100 text-primary text-sm font-bold tracking-wide px-8 py-3.5 rounded-xl transition-all duration-300 active:scale-95 shadow-[0_4px_12px_rgba(255,255,255,0.15)] font-body"
                        >
                          Explore Club Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section
        id="about"
        className="scroll-mt-16 about-solar-section"
      >
        {/* Anchor positioned over the sun in the solar system layout so the canvas atom
            morphs visually into the sun/planets before fading out */}
        <div
          ref={aboutAnchorRef}
          className="about-sun-anchor"
          style={{
            position: 'absolute' as const,
            pointerEvents: 'none' as const,
            opacity: 0,
            zIndex: 0,
          }}
        />
        {/* ── Title ── */}
        <div className="as-title">
          <h2 className="font-display">
            Our Journey &amp; <em>Impact</em>
          </h2>
          <p className="as-subtitle font-body">
            From a small spark to a blazing constellation of student leadership.
          </p>
        </div>

        {/* ═══ DESKTOP SOLAR SYSTEM LAYOUT ═══ */}
        <div className="solar-desktop">
          <div className="orbit-line-h" />

          {/* ═══════ LEFT COLUMN: 3 inner planets + Our Origin card ═══════ */}
          <div className="p-col" data-node="0">
            <div className="p-zone">
              <div ref={planetMercuryRef} className="p-sphere p-mercury" />
              <div ref={planetVenusRef} className="p-sphere p-venus" />
              <div ref={planetEarthRef} className="p-sphere p-earth" />
            </div>
            <div className="as-card as-card-dark about-panel">
              <div className="as-card-cat">
                <ClubIcon name="BookOpen" className="as-card-cat-icon" />
                <span className="as-card-cat-label font-body">History &amp; Heritage</span>
              </div>
              <h3 className="font-display">Our Origin</h3>
              <p className="as-card-body font-body">
                Founded in the heart of our institution, NSS Clubs began as a small
                group of passionate students with a shared dream — to create a vibrant
                community where every talent finds its stage.
              </p>
              <div className="as-card-stats">
                <div>
                  <div className="as-stat-label font-body">Founded</div>
                  <div className="as-stat-value font-display">2018</div>
                </div>
                <div>
                  <div className="as-stat-label font-body">Founders</div>
                  <div className="as-stat-value font-display">12</div>
                </div>
                <div>
                  <div className="as-stat-label font-body">First Event</div>
                  <div className="as-stat-value font-display">2019</div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════ CENTER COLUMN: Sun + President card ═══════ */}
          <div className="p-col p-col-sun" data-node="1">
            <div className="p-zone">
              <div ref={planetSunRef} className="p-sphere p-sun" />
              <div className="p-connector" />
            </div>
            <div className="as-card as-card-light about-panel">
              <div className="as-card-cat">
                <ClubIcon name="Shield" className="as-card-cat-icon" />
                <span className="as-card-cat-label font-body">Leadership &amp; Vision</span>
              </div>
              <h3 className="font-display">A Message from the President</h3>
              {data?.presidentPhoto && (
                <div className="as-pres-photo">
                  <Image
                    src={urlFor(data.presidentPhoto).width(256).height(256).fit("crop").auto("format").url()}
                    alt="President Photo"
                    width={144}
                    height={144}
                    className="object-cover"
                  />
                </div>
              )}
              <p className="as-pres-quote font-body">
                &ldquo;{data?.presidentMessage || "Empowering the next generation of leaders through passion, service, and innovation."}&rdquo;
              </p>
              <div className="as-pres-footer font-body">NSS President</div>
            </div>
          </div>

          {/* ═══════ RIGHT COLUMN: 3 outer planets + Our Vision card ═══════ */}
          <div className="p-col" data-node="2">
            <div className="p-zone">
              <div ref={planetMarsRef} className="p-sphere p-mars" />
              <div ref={planetJupiterRef} className="p-sphere p-jupiter" />
              <div ref={planetSaturnWrapRef} className="p-saturn-wrap">
                <div className="p-sphere p-saturn" />
                <div className="p-saturn-ring" />
              </div>
            </div>
            <div className="as-card as-card-dark about-panel">
              <div className="as-card-cat">
                <ClubIcon name="Heart" className="as-card-cat-icon" />
                <span className="as-card-cat-label font-body">Mission &amp; Purpose</span>
              </div>
              <h3 className="font-display">Our Vision</h3>
              <p className="as-card-body font-body">
                We envision a campus where creativity knows no boundaries, where a
                scientist can paint, a dancer can code, and a writer can score goals.
                NSS Clubs exist to blur the lines between disciplines.
              </p>
              <div className="as-card-stats">
                <div>
                  <div className="as-stat-label font-body">Clubs</div>
                  <div className="as-stat-value font-display">6</div>
                </div>
                <div>
                  <div className="as-stat-label font-body">Events/Year</div>
                  <div className="as-stat-value font-display">50+</div>
                </div>
                <div>
                  <div className="as-stat-label font-body">Impact</div>
                  <div className="as-stat-value font-display">1000+</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ MOBILE TIMELINE LAYOUT ═══ */}
        <div className="solar-mobile">
          <div className="mob-spine" />

          {/* Sun at top */}
          <div className="mob-sun" />
          <div className="mob-connector" />

          {/* Card 1: Our Origin */}
          <div className="mob-card as-card as-card-dark about-panel" data-node="0">
            <div className="as-card-cat">
              <ClubIcon name="BookOpen" className="as-card-cat-icon" />
              <span className="as-card-cat-label font-body">History &amp; Heritage</span>
            </div>
            <h3 className="font-display">Our Origin</h3>
            <p className="as-card-body font-body">
              Founded in the heart of our institution, NSS Clubs began as a small
              group of passionate students with a shared dream — to create a vibrant
              community where every talent finds its stage.
            </p>
            <div className="as-card-stats">
              <div>
                <div className="as-stat-label font-body">Founded</div>
                <div className="as-stat-value font-display">2018</div>
              </div>
              <div>
                <div className="as-stat-label font-body">Founders</div>
                <div className="as-stat-value font-display">12</div>
              </div>
              <div>
                <div className="as-stat-label font-body">First Event</div>
                <div className="as-stat-value font-display">2019</div>
              </div>
            </div>
          </div>

          <div className="mob-connector" />
          <div className="mob-dot mob-dot-earth" />
          <div className="mob-connector" />

          {/* Card 2: President */}
          <div className="mob-card as-card as-card-light about-panel" data-node="1">
            <div className="as-card-cat">
              <ClubIcon name="Shield" className="as-card-cat-icon" />
              <span className="as-card-cat-label font-body">Leadership &amp; Vision</span>
            </div>
            <h3 className="font-display">A Message from the President</h3>
            {data?.presidentPhoto && (
              <div className="as-pres-photo">
                <Image
                  src={urlFor(data.presidentPhoto).width(256).height(256).fit("crop").auto("format").url()}
                  alt="President Photo"
                  width={144}
                  height={144}
                  className="object-cover"
                />
              </div>
            )}
            <p className="as-pres-quote font-body">
              &ldquo;{data?.presidentMessage || "Empowering the next generation of leaders through passion, service, and innovation."}&rdquo;
            </p>
            <div className="as-pres-footer font-body">NSS President</div>
          </div>

          <div className="mob-connector" />
          <div className="mob-dot mob-dot-jupiter" />
          <div className="mob-connector" />

          {/* Card 3: Our Vision */}
          <div className="mob-card as-card as-card-dark about-panel" data-node="2">
            <div className="as-card-cat">
              <ClubIcon name="Heart" className="as-card-cat-icon" />
              <span className="as-card-cat-label font-body">Mission &amp; Purpose</span>
            </div>
            <h3 className="font-display">Our Vision</h3>
            <p className="as-card-body font-body">
              We envision a campus where creativity knows no boundaries, where a
              scientist can paint, a dancer can code, and a writer can score goals.
              NSS Clubs exist to blur the lines between disciplines.
            </p>
            <div className="as-card-stats">
              <div>
                <div className="as-stat-label font-body">Clubs</div>
                <div className="as-stat-value font-display">6</div>
              </div>
              <div>
                <div className="as-stat-label font-body">Events/Year</div>
                <div className="as-stat-value font-display">50+</div>
              </div>
              <div>
                <div className="as-stat-label font-body">Impact</div>
                <div className="as-stat-value font-display">1000+</div>
              </div>
            </div>
          </div>
        </div>

      </section>

      <div className="fixed inset-0 z-30 pointer-events-none" aria-hidden="true">
        {PLANET_DOT_MORPHS.map((morph, index) => (
          <div
            key={morph.key}
            ref={(el) => {
              morphGhostRefs.current[index] = el;
            }}
            className="absolute rounded-full"
            style={{
              opacity: 0,
              width: 0,
              height: 0,
              transform: "translate3d(0, 0, 0) scale(0.6)",
              willChange: "transform, width, height, opacity",
            }}
          />
        ))}
      </div>

      {/* ═══ EVENTS CONSTELLATION SECTION ═══ */}
      <EventsConstellation
        events={data?.featuredEvents || []}
        morphedDotIds={morphedDotIds}
        svgRef={constellationSvgRef}
      />
      <GalleryOrbit items={data?.featuredGallery || []} />
      <ConstellationFooter />

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
    </div>
  );
}