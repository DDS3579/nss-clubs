"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Hero from "./Hero";
import EventsConstellation from "./EventsConstellation";
import GalleryOrbit from "./home/GalleryOrbit";
import AboutSection from "./home/AboutSection";
import AtomOverlay, { CANVAS_INTRINSIC } from "./home/AtomOverlay";
import ClubsSection from "./home/ClubsSection";
import ConstellationFooter from "./layout/ConstellationFooter";
import type { HomepageData } from "@/sanity/lib/types";
import { getZoomRotation } from "@/lib/clubs";
import { clamp01, easeInOutQuart, lerp } from "@/lib/math";
import "./home/home-experience.css";

/* ─── custom hooks ─── */
import useScrollStateMachine, {
  getProjectorAndTargetCoordsCached,
  type LayoutCache,
} from "@/hooks/useScrollStateMachine";
import useMorphCoordinates from "@/hooks/useMorphCoordinates";
import useLenis from "@/hooks/useLenis";

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

      <ClubsSection
        clubsAnchorRef={clubsAnchorRef}
        selectedClub={selectedClub}
        clubsTextVisible={clubsTextVisible}
        cardWrapperRef={cardWrapperRef}
        cardRevealVisible={cardRevealVisible}
        handleCloseClub={handleCloseClub}
      />

      <AboutSection
        data={data}
        aboutAnchorRef={aboutAnchorRef}
        planetMercuryRef={planetMercuryRef}
        planetVenusRef={planetVenusRef}
        planetEarthRef={planetEarthRef}
        planetSunRef={planetSunRef}
        planetMarsRef={planetMarsRef}
        planetJupiterRef={planetJupiterRef}
        planetSaturnWrapRef={planetSaturnWrapRef}
        morphGhostRefs={morphGhostRefs}
      />

      {/* ═══ EVENTS CONSTELLATION SECTION ═══ */}
      <EventsConstellation
        events={data?.featuredEvents || []}
        morphedDotIds={morphedDotIds}
        svgRef={constellationSvgRef}
      />
      <GalleryOrbit items={data?.featuredGallery || []} />
      <ConstellationFooter />

      <AtomOverlay
        floatingRef={floatingRef}
        canvasWrapRef={canvasWrapRef}
        atomProgressRef={atomProgressRef}
        rotationOffsetRef={rotationOffsetRef}
        nucleusSeparationRef={nucleusSeparationRef}
        zoomActiveRef={zoomActiveRef}
        atomPausedRef={atomPausedRef}
        handleElectronClick={handleElectronClick}
        projectorCoords={projectorCoords}
        cardRevealVisible={cardRevealVisible}
        selectedClub={selectedClub}
      />
    </div>
  );
}