"use client";
import { useEffect, useRef, useState, useCallback, memo } from "react";
import { flushSync } from "react-dom";
import Hero from "./Hero";
import EventsConstellation from "./EventsConstellation";
import GalleryOrbit from "./home/GalleryOrbit";
import AboutSection from "./home/AboutSection";
import AtomOverlay, { CANVAS_INTRINSIC } from "./home/AtomOverlay";
import ClubsSection from "./home/ClubsSection";
import ConstellationFooter from "./layout/ConstellationFooter";
import type { HomepageData } from "@/sanity/lib/types";
import { getZoomRotation } from "@/lib/clubs";
import { clamp01, lerp } from "@/lib/math";

/** Softer than quart: no long dead start, no sudden middle. */
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
import "./home/home-experience.css";

/* ─── custom hooks ─── */
import useScrollStateMachine, {
  getProjectorAndTargetCoordsCached,
  type LayoutCache,
} from "@/hooks/useScrollStateMachine";
import useMorphCoordinates from "@/hooks/useMorphCoordinates";
import useLenis from "@/hooks/useLenis";

/* Heavy sections only re-render when their own props change */
const HeroMemo = memo(Hero);
const AboutSectionMemo = memo(AboutSection);
const EventsConstellationMemo = memo(EventsConstellation);
const GalleryOrbitMemo = memo(GalleryOrbit);
const ConstellationFooterMemo = memo(ConstellationFooter);

/* ─── layout ─── */
const HEADER_H = 64; // height of the navbar (see components/Navbar.tsx)

/* ─── zoom animation constants ─── */
const ZOOM_DURATION = 1900;
const NUCLEUS_ZOOM_DURATION = 2500;
const ZOOM_SCALE_FACTOR = 5.5;
const ELECTRON_TARGET_X = 520;
const ELECTRON_TARGET_Y = 320;

/* ─── Clubs storyline (title out → atom centres → club lines and labels in) ─── */
const INTRO_DURATION = 2200; // ms for the whole storyline to play
const INTRO_RESET_DURATION = 500; // ms to rewind it when you scroll back up
/**
 * How far you can scroll past the Clubs section before the atom starts to leave (0 to 1).
 * Gives the labels time to be seen, even when a finger stops a little past the exact spot.
 */
const ABOUT_DEAD_ZONE = 0.22;
const easeIntro = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

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
  const atomDisplayRef = useRef({ cx: 0, cy: 0, size: 0 }); // where the atom is drawn right now
  const zoomAnimRef = useRef<ZoomAnimState | null>(null);
  const cardWrapperRef = useRef<HTMLDivElement>(null);
  const introRef = useRef({
    t: 0, // storyline progress, 0 → 1
    target: 0,
    move: 0, // how far the atom has glided to the centre, 0 → 1
    shiftX: 0, // distance from the atom's normal spot to the centre (px)
    shiftY: 0,
    lastNow: 0,
    cacheSeen: null as LayoutCache | null,
    section: null as HTMLElement | null,
    reduce: false,
    written: { t: "", move: "", callouts: "", active: "" },
  });

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
    setProjectorCoords((prev) => {
      if (!prev || !coords) return coords;
      const same =
        prev.x1 === coords.x1 && prev.y1 === coords.y1 &&
        prev.x2 === coords.x2 && prev.y2 === coords.y2 &&
        prev.x3 === coords.x3 && prev.y3 === coords.y3;
      return same ? prev : coords;
    });
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
    // Start exactly where the atom is drawn right now. The old code measured the page again
    // at this moment, which can differ by a few pixels from what is on screen. That was the
    // little "shift" just before the zoom opened.
    const shown = atomDisplayRef.current;
    if (shown.size <= 0) return;
    const clubsScale = shown.size / CANVAS_INTRINSIC;
    const clubsFloatX = shown.cx - CANVAS_INTRINSIC / 2;
    const clubsFloatY = shown.cy - CANVAS_INTRINSIC / 2;
    const isNucleus = slug === "executive-team";
    const targetRotation = getZoomRotation(slug);
    const electronCanvasX = isNucleus
      ? CANVAS_INTRINSIC / 2
      : ELECTRON_TARGET_X;
    const electronCanvasY = isNucleus
      ? CANVAS_INTRINSIC / 2
      : ELECTRON_TARGET_Y;

    const zoomState: ZoomAnimState = {
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
    phaseRef.current = "zooming";
    zoomActiveRef.current = true; // atom canvas switches to extra-sharp
    zoomAnimRef.current = zoomState;
    lenisStop(); // Freeze Lenis during zoom animation to prevent scroll interference

    // Mount the club card RIGHT NOW and measure it, so the zoom's destination is correct
    // from the very first frame (before, the card appeared a moment later and the target jumped).
    flushSync(() => {
      setSelectedClub(slug);
      setCardRevealVisible(false);
    });
    updateLayoutGeometry();
    zoomState.startTime = performance.now(); // start the clock after the heavy work
  }, [phaseRef, lenisStop, updateLayoutGeometry]);

  /* ── Electron & Nucleus Click Handler ──
     Clicking scrolls so the Clubs section fills the screen EXACTLY (top edge right under
     the navbar), then the zoom starts from that true position. No extra jumps. */
  const handleElectronClick = useCallback(
    (slug: string) => {
      const phase = phaseRef.current;
      if (
        phase === "zooming" ||
        phase === "zoomed" ||
        phase === "about" ||
        phase === "events" ||
        phase === "gallery"
      ) {
        return;
      }

      const clubsSection = document.getElementById("clubs");
      if (!clubsSection) return;

      // Where the page must be scrolled for the section to sit exactly under the navbar
      const alignedY = clubsSection.getBoundingClientRect().top + window.scrollY - HEADER_H;
      const distance = Math.abs(window.scrollY - alignedY);

      const startZoom = () => {
        const pendingSlug = pendingZoomSlugRef.current;
        if (!pendingSlug) return;
        pendingZoomSlugRef.current = null;
        updateLayoutGeometry(); // fresh measurements at the final scroll position
        initZoom(pendingSlug);
      };

      pendingZoomSlugRef.current = slug;
      if (distance < 2) {
        startZoom(); // already aligned
        return;
      }
      const scrollDuration = distance > window.innerHeight * 0.6 ? 1.2 : 0.8;
      lenisScrollTo(clubsSection, {
        offset: -HEADER_H,
        duration: scrollDuration,
        onComplete: startZoom,
      });
      // Safety net: if a finger interrupts the glide, still open the club.
      // (startZoom does nothing the second time it is called.)
      window.setTimeout(startZoom, scrollDuration * 1000 + 300);
    },
    [initZoom, phaseRef, pendingZoomSlugRef, lenisScrollTo, updateLayoutGeometry],
  );

  /* ── Close club card and reverse zoom ── */
  const handleCloseClub = useCallback(() => {
    if (phaseRef.current !== "zoomed") return;
    const zoom = zoomAnimRef.current;
    if (!zoom) return;

    // Fly back to exactly where the zoom started. Everything needed was saved at that moment,
    // and the page cannot have moved because scrolling is locked while a club is open.
    setCardRevealVisible(false);
    phaseRef.current = "zooming";
    zoomAnimRef.current = { ...zoom, direction: "reverse", startTime: performance.now() };
  }, [phaseRef]);

  // Pending zoom triggers are now handled synchronously inside the frame tick loop below to prevent state-race conditions.

  /* ── In-page links (Explore Clubs, About Us, navbar) glide to the section instead of jumping ── */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (phaseRef.current === "zooming" || phaseRef.current === "zoomed") return;

      const anchor = (e.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank") return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return;

      if (!url.hash) {
        // The "Home" link while already on the homepage: glide back to the top
        if (url.search !== window.location.search) return;
        e.preventDefault();
        lenisScrollTo(0, { offset: 0, duration: 1.2 });
        return;
      }

      const section = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!section) return;
      e.preventDefault();
      lenisScrollTo(section, { offset: -HEADER_H, duration: 1.2 });
      window.history.pushState(null, "", url.hash);
    };
    // Capture phase, so we run before Next.js turns the click into an instant jump
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [lenisScrollTo, phaseRef]);

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

      // ── Clubs storyline ──
      const intro = introRef.current;
      if (!intro.section) {
        intro.section = document.getElementById("clubs");
        intro.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      }
      const clubsSectionEl = intro.section;
      const clubOpen = phaseRef.current === "zooming" || phaseRef.current === "zoomed";
      const dtMs = intro.lastNow ? Math.min(now - intro.lastNow, 100) : 16;
      intro.lastNow = now;

      // Frozen while a club is open, so the atom lands exactly where it started when the card closes
      if (!clubOpen) {
        const arrived = atomProgressRef.current;
        if (arrived < 0.85) intro.target = 0; // scrolled back up: rewind
        else if (arrived >= 0.97) intro.target = 1; // the atom has landed: play

        const step = dtMs / (intro.target === 1 ? INTRO_DURATION : INTRO_RESET_DURATION);
        if (intro.reduce) intro.t = intro.target;
        else if (intro.t < intro.target) intro.t = Math.min(intro.target, intro.t + step);
        else if (intro.t > intro.target) intro.t = Math.max(intro.target, intro.t - step);
      }
      // The atom glides after the title has started to leave
      intro.move = easeIntro(clamp01((intro.t - 0.12) / 0.48));

      // Where is "the centre"? Only re-measured when the page layout was re-measured.
      if (clubsSectionEl && !clubOpen && cache.clubsAnchor && intro.cacheSeen !== cache) {
        intro.cacheSeen = cache;
        const a = cache.clubsAnchor;
        const viewW = document.documentElement.clientWidth;
        intro.shiftX = viewW / 2 - (a.pageLeft + a.width / 2);
        const restY =
          cache.clubsSectionTop + clubsSectionEl.offsetHeight * (viewW >= 1024 ? 0.48 : 0.46);
        intro.shiftY = restY - (a.pageTop + a.height / 2);
        clubsSectionEl.style.setProperty("--shift-x", `${intro.shiftX.toFixed(1)}px`);
        clubsSectionEl.style.setProperty("--shift-y", `${intro.shiftY.toFixed(1)}px`);
      }

      // Hand the numbers to the CSS (only writes when something changed)
      if (clubsSectionEl) {
        const w = intro.written;
        const tText = intro.t.toFixed(3);
        if (w.t !== tText) {
          clubsSectionEl.style.setProperty("--intro", tText);
          w.t = tText;
        }
        const moveText = intro.move.toFixed(3);
        if (w.move !== moveText) {
          clubsSectionEl.style.setProperty("--move", moveText);
          w.move = moveText;
        }
        // The labels melt away as you scroll on, and stay hidden while a club is open
        const calloutsVisible = clubOpen
          ? 0
          : 1 - clamp01((aboutProgressRef.current - 0.08) / 0.1);
        const calloutsText = calloutsVisible.toFixed(2);
        if (w.callouts !== calloutsText) {
          clubsSectionEl.style.setProperty("--callouts", calloutsText);
          w.callouts = calloutsText;
        }
        const active = intro.t > 0.7 && calloutsVisible > 0.4 ? "on" : "off";
        if (w.active !== active) {
          clubsSectionEl.dataset.callouts = active;
          w.active = active;
        }
      }

      // ── Position the floating atom canvas ──
      let cx = 0,
        cy = 0,
        size = 0;

      const heroRect = cache.heroAnchor;
      const clubsRect = cache.clubsAnchor;
      const aboutAnchor = cache.aboutAnchor;

      if (heroRect && clubsRect) {
        // How far the atom has travelled from the Clubs spot toward the About section.
        // The dead zone keeps it parked at first, so the club labels have time to be seen.
        const aboutEff = clamp01(
          (aboutProgressRef.current - ABOUT_DEAD_ZONE) / (1 - ABOUT_DEAD_ZONE),
        );
        // Where the atom rests in the Clubs section once the storyline has centred it
        const restCx = clubsRect.pageLeft + clubsRect.width / 2 + intro.shiftX * intro.move;
        const restCy = clubsRect.pageTop + clubsRect.height / 2 + intro.shiftY * intro.move;

        if (aboutEff > 0.001 && aboutAnchor) {
          const targetX = aboutAnchor.pageLeft + aboutAnchor.width / 2;
          const targetY = aboutAnchor.pageTop + aboutAnchor.height / 2;
          cx = lerp(restCx, targetX, aboutEff);
          cy = lerp(restCy, targetY, aboutEff);
          size = lerp(clubsRect.width, aboutAnchor.width, aboutEff);
        } else {
          const fromCx = heroRect.pageLeft + heroRect.width / 2;
          const fromCy = heroRect.pageTop + heroRect.height / 2;
          cx = lerp(fromCx, restCx, atomProgressRef.current);
          cy = lerp(fromCy, restCy, atomProgressRef.current);
          size = lerp(heroRect.width, clubsRect.width, atomProgressRef.current);
        }
      }

      // Remember what is on screen, so a zoom can start (and end) exactly here
      const shown = atomDisplayRef.current;
      shown.cx = cx;
      shown.cy = cy;
      shown.size = size;

      // Direct DOM writes — bypass React VDOM
      floating.style.transform = `translate(${cx - CANVAS_INTRINSIC / 2}px, ${cy - CANVAS_INTRINSIC / 2}px)`;
      canvasWrap.style.transform = `scale(${size / CANVAS_INTRINSIC})`;

      if (aboutProgressRef.current > 0.001) {
        const fadeOut = 1 - clamp01((aboutProgressRef.current - 0.55) / 0.35);
        floating.style.opacity = `${fadeOut}`;
        floating.style.visibility = fadeOut <= 0.01 ? "hidden" : "visible";
        atomPausedRef.current = fadeOut <= 0.01;
      } else {
        floating.style.opacity = '1';
        floating.style.visibility = "visible";
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

      // ── Zoom animation ──
      if (
        (phaseRef.current === "zooming" || phaseRef.current === "zoomed") &&
        zoomAnimRef.current
      ) {
        const zoom = zoomAnimRef.current;
        const isNucleusZoom = zoom.slug === "executive-team";
        const duration = isNucleusZoom ? NUCLEUS_ZOOM_DURATION : ZOOM_DURATION;
        const half = CANVAS_INTRINSIC / 2;
        const endScale = zoom.clubsScale * ZOOM_SCALE_FACTOR;

        // Where the clicked electron must END UP, in page coordinates
        const target = getProjectorAndTargetCoordsCached(
          cache.cardWrapper,
          window.scrollX,
          window.scrollY,
          cache.windowWidth,
          cache.windowHeight,
        );
        const endX = target.zTargetVpX + window.scrollX;
        const endY = target.zTargetVpY + window.scrollY;

        // Where it STARTED, in page coordinates
        const startX = zoom.clubsFloatX + half + (zoom.electronCanvasX - half) * zoom.clubsScale;
        const startY = zoom.clubsFloatY + half + (zoom.electronCanvasY - half) * zoom.clubsScale;

        // t: how much of the animation time has passed (0 to 1)
        // k: 0 = resting in the Clubs section, 1 = fully zoomed. Closing plays the same path backwards.
        const isZoomed = phaseRef.current === "zoomed";
        const forward = zoom.direction === "forward";
        const t = isZoomed ? 1 : clamp01((now - zoom.startTime) / duration);
        const k = isZoomed ? 1 : forward ? t : 1 - t;

        let flyT: number; // how far the camera has flown (0 to 1)
        if (isNucleusZoom) {
          nucleusSeparationRef.current = easeInOutCubic(clamp01(k / 0.3));
          flyT = easeInOutCubic(clamp01((k - 0.22) / 0.56));
        } else {
          const rotT = zoom.targetRotation === 0 ? 1 : clamp01(k / 0.35);
          rotationOffsetRef.current = easeInOutCubic(rotT) * zoom.targetRotation;
          flyT = easeInOutCubic(clamp01((k - 0.15) / 0.65));
        }

        // Camera-dolly feel: the zoom grows by an even RATIO each moment, while the
        // electron glides along a straight line to its destination.
        const scale = zoom.clubsScale * Math.pow(endScale / zoom.clubsScale, flyT);
        const elX = lerp(startX, endX, flyT);
        const elY = lerp(startY, endY, flyT);
        floating.style.transform = `translate(${elX - half - (zoom.electronCanvasX - half) * scale}px, ${elY - half - (zoom.electronCanvasY - half) * scale}px)`;
        canvasWrap.style.transform = `scale(${scale})`;

        if (forward) {
          if (t > 0.72) setCardRevealVisible(true);
          if (t >= 1 && !isZoomed) phaseRef.current = "zoomed";
        } else if (t >= 1) {
          phaseRef.current = "clubs";
          zoomAnimRef.current = null;
          rotationOffsetRef.current = 0;
          nucleusSeparationRef.current = 0;
          zoomActiveRef.current = false;
          setSelectedClub(null);
          setCardRevealVisible(false);
          lenisStart(); // Resume Lenis after the reverse zoom completes
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
        <HeroMemo ref={heroRef} />
      </div>

      <ClubsSection
        clubsAnchorRef={clubsAnchorRef}
        selectedClub={selectedClub}
        clubsTextVisible={clubsTextVisible}
        cardWrapperRef={cardWrapperRef}
        cardRevealVisible={cardRevealVisible}
        handleCloseClub={handleCloseClub}
        onSelectNode={handleElectronClick}
      />

      <AboutSectionMemo
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
      <EventsConstellationMemo
        events={data?.featuredEvents || []}
        morphedDotIds={morphedDotIds}
        svgRef={constellationSvgRef}
      />
      <GalleryOrbitMemo items={data?.featuredGallery || []} />
      <ConstellationFooterMemo />

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