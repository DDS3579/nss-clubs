"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Hero from "./Hero";
import HeroAtom from "./HeroAtom";

/* ─── constants ─── */
const HEADER_H = 64;
const TRANSITION_MS = 1600; // duration of the section-to-section transition
const CANVAS_INTRINSIC = 640;

const CLUBS_DETAILS = [
  {
    slug: "stem",
    name: "STEM Club",
    tagline: "Innovate, build, and explore the frontiers of science, coding, and technology.",
    color: "#0284c7", // Sky blue
    category: "Science & Technology",
    iconName: "Terminal",
    themes: ["Science", "Tech", "Engineering", "Math"],
    info: [
      { label: "Members", value: "120+" },
      { label: "Meetings", value: "Weekly" },
      { label: "Activity", value: "High" }
    ]
  },
  {
    slug: "sports",
    name: "Sports Club",
    tagline: "Unleash your athletic potential, embrace teamwork, and chase victory.",
    color: "#f59e0b", // Amber
    category: "Athletics & Health",
    iconName: "Trophy",
    themes: ["Athletics", "Teamwork", "Tournaments", "Fitness"],
    info: [
      { label: "Members", value: "200+" },
      { label: "Meetings", value: "Bi-Weekly" },
      { label: "Activity", value: "Very High" }
    ]
  },
  {
    slug: "literature",
    name: "Literature Club",
    tagline: "Celebrate the power of words, creative writing, poetry, and deep debates.",
    color: "#10b981", // Emerald
    category: "Arts & Letters",
    iconName: "BookOpen",
    themes: ["Creative Writing", "Poetry", "Debate", "Storytelling"],
    info: [
      { label: "Members", value: "80+" },
      { label: "Meetings", value: "Weekly" },
      { label: "Activity", value: "Active" }
    ]
  },
  {
    slug: "arts",
    name: "Arts & Craft Club",
    tagline: "Express yourself visually through beautiful paintings, sketches, and manual crafts.",
    color: "#f43f5e", // Rose
    category: "Creative & Design",
    iconName: "Palette",
    themes: ["Painting", "Crafts", "Sketching", "Design"],
    info: [
      { label: "Members", value: "90+" },
      { label: "Meetings", value: "Weekly" },
      { label: "Activity", value: "Active" }
    ]
  },
  {
    slug: "entertainment",
    name: "Entertainment Club",
    tagline: "Bring joy, music, dance, and theater to the main stage of NSS.",
    color: "#8b5cf6", // Violet
    category: "Performing Arts",
    iconName: "Music",
    themes: ["Music", "Dance", "Theater", "Production"],
    info: [
      { label: "Members", value: "150+" },
      { label: "Meetings", value: "Multi-Weekly" },
      { label: "Activity", value: "Very High" }
    ]
  },
  {
    slug: "social",
    name: "Social Club",
    tagline: "Make a positive impact on society through volunteering, empathy, and social work.",
    color: "#0d9488", // Teal
    category: "Community Service",
    iconName: "Heart",
    themes: ["Volunteering", "Social Work", "Charity", "Community"],
    info: [
      { label: "Members", value: "250+" },
      { label: "Meetings", value: "Monthly" },
      { label: "Activity", value: "High" }
    ]
  },
  {
    slug: "executive-team",
    name: "Executive Team",
    tagline: "Meet the visionary leaders, advisors, and coordinators steering the NSS Clubs towards excellence and impact.",
    color: "#D4A373", // Gold
    category: "Governance & Operations",
    iconName: "Shield",
    isSpecial: true,
    themes: ["Leadership", "Strategy", "Advising", "Operations"],
    info: [
      { label: "Officers", value: "15" },
      { label: "Meetings", value: "Weekly" },
      { label: "Activity", value: "Continuous" }
    ]
  },
];

function ClubIcon({ name, className }: { name: string; className?: string }) {
  const props = {
    className: className || "w-5 h-5",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.5,
    viewBox: "0 0 24 24"
  };

  switch (name) {
    case "Terminal":
      return (
        <svg {...props}>
          <polyline points="4 17 10 11 4 5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="12" y1="19" x2="20" y2="19" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "Trophy":
      return (
        <svg {...props}>
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 22h16" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 2a6 6 0 0 1 6 6c0 3.6-2 5.5-6 6.5-4-1-6-2.9-6-6.5a6 6 0 0 1 6-6Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "BookOpen":
      return (
        <svg {...props}>
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "Palette":
      return (
        <svg {...props}>
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.32115 19.4626 5.37256 20.2036 4.97549 20.7256C4.42398 21.4507 3.50428 21.8491 2.5 22C4.52044 22 8.78453 22 12 22Z" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="7.5" cy="10.5" r="1" fill="currentColor" />
          <circle cx="11.5" cy="7.5" r="1" fill="currentColor" />
          <circle cx="16.5" cy="9.5" r="1" fill="currentColor" />
          <circle cx="15.5" cy="14.5" r="1" fill="currentColor" />
        </svg>
      );
    case "Music":
      return (
        <svg {...props}>
          <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      );
    case "Heart":
      return (
        <svg {...props}>
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "Shield":
      return (
        <svg {...props}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

/* ─── zoom animation constants ─── */
const ZOOM_DURATION = 2400;
const NUCLEUS_ZOOM_DURATION = 3200; // longer for the dramatic separation + zoom
const ZOOM_SCALE_FACTOR = 5.5;
const ELECTRON_TARGET_X = 490; // CX + orbit rx = 320 + 170
const ELECTRON_TARGET_Y = 320; // CY

/** Rotation offset (radians) to bring each club's electron to the Literature Club position (right-center of horizontal orbit). */
const ROTATION_OFFSETS: Record<string, number> = {
  stem: (60 * Math.PI) / 180,
  sports: (-120 * Math.PI) / 180,
  literature: 0,
  arts: Math.PI,
  entertainment: (-60 * Math.PI) / 180,
  social: (120 * Math.PI) / 180,
  "executive-team": 0,
};

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

/** Find the .hero-atom-origin that has layout (not display:none). */
function getLayoutElement(selector: string): HTMLElement | null {
  const els = document.querySelectorAll<HTMLElement>(selector);
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

type Phase = "hero" | "animating" | "clubs" | "zooming" | "zoomed";

interface AnimState {
  direction: "forward" | "reverse";
  startTime: number;
  scrollStart: number;
  scrollEnd: number;
}

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

export default function HomeScrollExperience() {
  /* ── refs ── */
  const clubsAnchorRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const phaseRef = useRef<Phase>("hero");
  const animRef = useRef<AnimState | null>(null);
  const atomProgressRef = useRef(0);
  const touchStartRef = useRef<number | null>(null);
  const prevShowTextRef = useRef(false);
  const initializedRef = useRef(false);
  const rotationOffsetRef = useRef(0);
  const nucleusSeparationRef = useRef(0);
  const zoomAnimRef = useRef<ZoomAnimState | null>(null);
  const pendingZoomSlugRef = useRef<string | null>(null);
  const initZoomRef = useRef<(slug: string) => void>(() => {});

  const [clubsTextVisible, setClubsTextVisible] = useState(false);
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [cardRevealVisible, setCardRevealVisible] = useState(false);

  /* ── Trigger a section-snap transition ── */
  const startTransition = useCallback((direction: "forward" | "reverse") => {
    if (phaseRef.current === "animating") return;
    if (direction === "forward" && phaseRef.current !== "hero") return;
    if (direction === "reverse" && phaseRef.current !== "clubs") return;

    const clubsSection = document.getElementById("clubs");
    if (!clubsSection) return;

    const clubsAbsTop = clubsSection.getBoundingClientRect().top + window.scrollY;
    const scrollTarget = clubsAbsTop - HEADER_H;

    phaseRef.current = "animating";
    animRef.current = {
      direction,
      startTime: performance.now(),
      scrollStart: window.scrollY,
      scrollEnd: direction === "forward" ? scrollTarget : 0,
    };
  }, []);

  /* ── Zoom initialization (stored in ref for access from rAF tick) ── */
  initZoomRef.current = (slug: string) => {
    const clubsAnchor = clubsAnchorRef.current;
    if (!clubsAnchor) return;
    const clubsRect = clubsAnchor.getBoundingClientRect();

    const clubsCx = clubsRect.left + clubsRect.width / 2;
    const clubsCy = clubsRect.top + clubsRect.height / 2;
    const clubsScale = clubsRect.width / CANVAS_INTRINSIC;
    const clubsFloatX = clubsCx - CANVAS_INTRINSIC / 2;
    const clubsFloatY = clubsCy - CANVAS_INTRINSIC / 2;

    const isNucleus = slug === "executive-team";
    const targetRotation = ROTATION_OFFSETS[slug] ?? 0;
    const electronCanvasX = isNucleus ? CANVAS_INTRINSIC / 2 : ELECTRON_TARGET_X;
    const electronCanvasY = isNucleus ? CANVAS_INTRINSIC / 2 : ELECTRON_TARGET_Y;

    setSelectedClub(slug);
    setCardRevealVisible(false);

    phaseRef.current = "zooming";
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
  };

  /* ── Electron & Nucleus Click Handler ── */
  const handleElectronClick = useCallback((slug: string) => {
    if (phaseRef.current === "zooming" || phaseRef.current === "zoomed") return;

    if (phaseRef.current === "hero") {
      startTransition("forward");
      pendingZoomSlugRef.current = slug;
    } else if (phaseRef.current === "clubs") {
      initZoomRef.current(slug);
    }
  }, [startTransition]);

  /* ── Close club card and reverse zoom ── */
  const handleCloseClub = useCallback(() => {
    if (phaseRef.current !== "zoomed") return;
    const slug = selectedClub;
    if (!slug) return;

    const clubsAnchor = clubsAnchorRef.current;
    if (!clubsAnchor) return;
    const clubsRect = clubsAnchor.getBoundingClientRect();

    const clubsCx = clubsRect.left + clubsRect.width / 2;
    const clubsCy = clubsRect.top + clubsRect.height / 2;
    const clubsScale = clubsRect.width / CANVAS_INTRINSIC;
    const clubsFloatX = clubsCx - CANVAS_INTRINSIC / 2;
    const clubsFloatY = clubsCy - CANVAS_INTRINSIC / 2;

    const isNucleus = slug === "executive-team";
    const targetRotation = ROTATION_OFFSETS[slug] ?? 0;
    const electronCanvasX = isNucleus ? CANVAS_INTRINSIC / 2 : ELECTRON_TARGET_X;
    const electronCanvasY = isNucleus ? CANVAS_INTRINSIC / 2 : ELECTRON_TARGET_Y;

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
  }, [selectedClub]);

  /* ── Main animation loop ── */
  useEffect(() => {
    const tick = (now: number) => {
      const heroAnchor = getLayoutElement(".hero-atom-origin");
      const clubsAnchor = clubsAnchorRef.current;
      const floating = floatingRef.current;
      const canvasWrap = canvasWrapRef.current;

      if (!heroAnchor || !clubsAnchor || !floating || !canvasWrap) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      /* ── Initialize phase from scroll position on first frame ── */
      if (!initializedRef.current) {
        initializedRef.current = true;
        const clubsSection = document.getElementById("clubs");
        if (clubsSection) {
          const clubsAbsTop = clubsSection.getBoundingClientRect().top + window.scrollY;
          if (window.scrollY >= clubsAbsTop - HEADER_H - 50) {
            phaseRef.current = "clubs";
            atomProgressRef.current = 1;
            prevShowTextRef.current = true;
            setClubsTextVisible(true);
          }
        }
        floating.style.opacity = "1";
      }

      /* ── Compute position‑t and atom progress ── */
      let posT = 0;

      if (phaseRef.current === "hero") {
        posT = 0;
        atomProgressRef.current = 0;
      } else if (phaseRef.current === "clubs" || phaseRef.current === "zooming" || phaseRef.current === "zoomed") {
        posT = 1;
        atomProgressRef.current = 1;
      } else if (phaseRef.current === "animating" && animRef.current) {
        const anim = animRef.current;
        const elapsed = now - anim.startTime;
        const rawT = clamp01(elapsed / TRANSITION_MS);
        const easedT = easeInOutQuart(rawT);

        if (anim.direction === "forward") {
          posT = easedT;
          atomProgressRef.current = easedT;
        } else {
          posT = 1 - easedT;
          atomProgressRef.current = 1 - easedT;
        }

        // Programmatic scroll
        window.scrollTo(0, lerp(anim.scrollStart, anim.scrollEnd, easedT));

        // Finished?
        if (rawT >= 1) {
          const finalPhase: Phase = anim.direction === "forward" ? "clubs" : "hero";
          phaseRef.current = finalPhase;
          animRef.current = null;

          // Trigger pending zoom after hero→clubs transition
          if (finalPhase === "clubs" && pendingZoomSlugRef.current) {
            const slug = pendingZoomSlugRef.current;
            pendingZoomSlugRef.current = null;
            initZoomRef.current(slug);
          }
        }
      }

      /* ── Interpolate atom position between hero & clubs anchors ── */
      const heroRect = heroAnchor.getBoundingClientRect();
      const clubsRect = clubsAnchor.getBoundingClientRect();

      const fromCx = heroRect.left + heroRect.width / 2;
      const fromCy = heroRect.top + heroRect.height / 2;
      const toCx = clubsRect.left + clubsRect.width / 2;
      const toCy = clubsRect.top + clubsRect.height / 2;

      const cx = lerp(fromCx, toCx, posT);
      const cy = lerp(fromCy, toCy, posT);
      const size = lerp(heroRect.width, clubsRect.width, posT);

      floating.style.transform =
        `translate(${cx - CANVAS_INTRINSIC / 2}px, ${cy - CANVAS_INTRINSIC / 2}px)`;
      canvasWrap.style.transform = `scale(${size / CANVAS_INTRINSIC})`;

      /* ── Zoom phase overrides ── */
      if ((phaseRef.current === "zooming" || phaseRef.current === "zoomed") && zoomAnimRef.current) {
        const zoom = zoomAnimRef.current;
        const isNucleusZoom = zoom.slug === "executive-team";
        const duration = isNucleusZoom ? NUCLEUS_ZOOM_DURATION : ZOOM_DURATION;

        // Compute zoomed-state target transforms
        // canvasWrap uses transform-origin: center, so a canvas point (ex,ey) maps to
        // viewport as: vpX = floatX + halfC + (ex - halfC) * scale
        const zTargetScale = zoom.clubsScale * ZOOM_SCALE_FACTOR;
        const zTargetVpX = window.innerWidth * 0.18;
        const zTargetVpY = window.innerHeight * 0.5;
        const halfC = CANVAS_INTRINSIC / 2;
        const zoomedFloatX = zTargetVpX - halfC - (zoom.electronCanvasX - halfC) * zTargetScale;
        const zoomedFloatY = zTargetVpY - halfC - (zoom.electronCanvasY - halfC) * zTargetScale;

        if (phaseRef.current === "zoomed") {
          // Maintain final zoomed state
          rotationOffsetRef.current = zoom.targetRotation;
          if (isNucleusZoom) nucleusSeparationRef.current = 1;
          floating.style.transform = `translate(${zoomedFloatX}px, ${zoomedFloatY}px)`;
          canvasWrap.style.transform = `scale(${zTargetScale})`;
        } else {
          const zElapsed = now - zoom.startTime;
          const totalT = clamp01(zElapsed / duration);

          if (zoom.direction === "forward") {
            if (isNucleusZoom) {
              /* ═══ SPECIAL NUCLEUS SEPARATION ANIMATION ═══ */

              /* Phase 1 — Separation (0 → 0.30): orbits slide right, nucleus stays */
              const sepT = clamp01(totalT / 0.30);
              nucleusSeparationRef.current = easeInOutQuart(sepT);

              /* Phase 2 — Zoom into isolated nucleus (0.22 → 0.78) */
              const zoomT = clamp01((totalT - 0.22) / 0.56);
              const zEased = easeInOutQuart(zoomT);

              const curFloatX = lerp(zoom.clubsFloatX, zoomedFloatX, zEased);
              const curFloatY = lerp(zoom.clubsFloatY, zoomedFloatY, zEased);
              const curScale = lerp(zoom.clubsScale, zTargetScale, zEased);

              floating.style.transform = `translate(${curFloatX}px, ${curFloatY}px)`;
              canvasWrap.style.transform = `scale(${curScale})`;

              /* Phase 3 — Card reveal (0.72 → 1.0) */
              if (totalT > 0.72) {
                setCardRevealVisible(true);
              }

              if (totalT >= 1) {
                phaseRef.current = "zoomed";
              }
            } else {
              /* ═══ STANDARD ELECTRON ZOOM ═══ */

              /* Phase 1 — Rotation (0 → 0.35) */
              const rotT = zoom.targetRotation === 0 ? 1 : clamp01(totalT / 0.35);
              rotationOffsetRef.current = easeInOutQuart(rotT) * zoom.targetRotation;

              /* Phase 2 — Zoom (0.15 → 0.80) */
              const zoomT = clamp01((totalT - 0.15) / 0.65);
              const zEased = easeInOutQuart(zoomT);

              const curFloatX = lerp(zoom.clubsFloatX, zoomedFloatX, zEased);
              const curFloatY = lerp(zoom.clubsFloatY, zoomedFloatY, zEased);
              const curScale = lerp(zoom.clubsScale, zTargetScale, zEased);

              floating.style.transform = `translate(${curFloatX}px, ${curFloatY}px)`;
              canvasWrap.style.transform = `scale(${curScale})`;

              /* Phase 3 — Card reveal (0.72 → 1.0) */
              if (totalT > 0.72) {
                setCardRevealVisible(true);
              }

              if (totalT >= 1) {
                phaseRef.current = "zoomed";
              }
            }
          } else {
            /* ── REVERSE ── */
            if (isNucleusZoom) {
              /* ═══ REVERSE NUCLEUS SEPARATION ═══ */

              /* Phase 1 — Zoom reverse (0.05 → 0.60) */
              const zoomRevT = clamp01((totalT - 0.05) / 0.55);
              const zRevEased = easeInOutQuart(zoomRevT);

              const curFloatX = lerp(zoomedFloatX, zoom.clubsFloatX, zRevEased);
              const curFloatY = lerp(zoomedFloatY, zoom.clubsFloatY, zRevEased);
              const curScale = lerp(zTargetScale, zoom.clubsScale, zRevEased);

              floating.style.transform = `translate(${curFloatX}px, ${curFloatY}px)`;
              canvasWrap.style.transform = `scale(${curScale})`;

              /* Phase 2 — Rejoin: orbits come back (0.55 → 1.0) */
              const rejoinT = clamp01((totalT - 0.55) / 0.45);
              nucleusSeparationRef.current = 1 - easeInOutQuart(rejoinT);

              if (totalT >= 1) {
                phaseRef.current = "clubs";
                zoomAnimRef.current = null;
                rotationOffsetRef.current = 0;
                nucleusSeparationRef.current = 0;
                setSelectedClub(null);
                setCardRevealVisible(false);
              }
            } else {
              /* ═══ REVERSE STANDARD ═══ */

              /* Phase 1 — Zoom reverse (0.05 → 0.70) */
              const zoomRevT = clamp01((totalT - 0.05) / 0.65);
              const zRevEased = easeInOutQuart(zoomRevT);

              const curFloatX = lerp(zoomedFloatX, zoom.clubsFloatX, zRevEased);
              const curFloatY = lerp(zoomedFloatY, zoom.clubsFloatY, zRevEased);
              const curScale = lerp(zTargetScale, zoom.clubsScale, zRevEased);

              floating.style.transform = `translate(${curFloatX}px, ${curFloatY}px)`;
              canvasWrap.style.transform = `scale(${curScale})`;

              /* Phase 2 — Rotation reverse (0.50 → 1.0) */
              const rotRevT = zoom.targetRotation === 0 ? 1 : clamp01((totalT - 0.50) / 0.50);
              rotationOffsetRef.current = (1 - easeInOutQuart(rotRevT)) * zoom.targetRotation;

              if (totalT >= 1) {
                phaseRef.current = "clubs";
                zoomAnimRef.current = null;
                rotationOffsetRef.current = 0;
                setSelectedClub(null);
                setCardRevealVisible(false);
              }
            }
          }
        }
      }

      /* ── Clubs text visibility ── */
      const showText = posT > 0.55;
      if (showText !== prevShowTextRef.current) {
        prevShowTextRef.current = showText;
        setClubsTextVisible(showText);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  /* ── Wheel & touch handlers for section-snap ── */
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (phaseRef.current === "animating" || phaseRef.current === "zooming" || phaseRef.current === "zoomed") {
        e.preventDefault();
        return;
      }

      // Hero → Clubs
      if (e.deltaY > 0 && phaseRef.current === "hero") {
        e.preventDefault();
        if (Math.abs(e.deltaY) >= 10) startTransition("forward");
        return;
      }

      // Clubs → Hero (only if at clubs section top)
      if (e.deltaY < 0 && phaseRef.current === "clubs") {
        const clubsSection = document.getElementById("clubs");
        if (clubsSection) {
          const clubsAbsTop = clubsSection.getBoundingClientRect().top + window.scrollY;
          const clubsScrollY = clubsAbsTop - HEADER_H;
          if (window.scrollY <= clubsScrollY + 15) {
            e.preventDefault();
            if (Math.abs(e.deltaY) >= 10) startTransition("reverse");
          }
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = e.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartRef.current === null) return;
      const deltaY = touchStartRef.current - (e.touches[0]?.clientY ?? 0);

      if (phaseRef.current === "animating" || phaseRef.current === "zooming" || phaseRef.current === "zoomed") {
        e.preventDefault();
        return;
      }

      if (deltaY > 0 && phaseRef.current === "hero") {
        e.preventDefault();
        if (Math.abs(deltaY) >= 20) {
          startTransition("forward");
          touchStartRef.current = null;
        }
      } else if (deltaY < 0 && phaseRef.current === "clubs") {
        const clubsSection = document.getElementById("clubs");
        if (clubsSection) {
          const clubsAbsTop = clubsSection.getBoundingClientRect().top + window.scrollY;
          const clubsScrollY = clubsAbsTop - HEADER_H;
          if (window.scrollY <= clubsScrollY + 15) {
            e.preventDefault();
            if (Math.abs(deltaY) >= 20) {
              startTransition("reverse");
              touchStartRef.current = null;
            }
          }
        }
      }
    };

    const opts: AddEventListenerOptions = { capture: true, passive: false };
    window.addEventListener("wheel", handleWheel, opts);
    window.addEventListener("mousewheel", handleWheel as EventListener, opts);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, opts);

    return () => {
      window.removeEventListener("wheel", handleWheel, opts);
      window.removeEventListener("mousewheel", handleWheel as EventListener, opts);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove, opts);
    };
  }, [startTransition]);

  return (
    <div className="home-scroll-experience bg-bg">
      {/* ═══ CSS ANIMATIONS & DEBOSSED CARVED TEXT ═══ */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flicker-in {
          0% { opacity: 0; }
          10% { opacity: 0.4; }
          15% { opacity: 0.1; }
          25% { opacity: 0.85; }
          35% { opacity: 0.2; }
          50% { opacity: 0.95; }
          60% { opacity: 0.45; }
          70% { opacity: 0.8; }
          80% { opacity: 0.6; }
          90% { opacity: 0.9; }
          100% { opacity: 1; }
        }
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(16px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-in-card {
          0% {
            opacity: 0;
            transform: translateX(-80px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-flicker-in {
          animation: flicker-in 1.4s ease-out forwards;
        }
        .animate-fade-in-delayed {
          opacity: 0;
          animation: fade-in-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 1.4s;
        }
        .animate-slide-in-card {
          animation: slide-in-card 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        /* Debossed/Carved Text Effects */
        .text-carved-dark {
          color: rgba(255, 255, 255, 0.9);
          text-shadow: -1px -1px 0.5px rgba(0, 0, 0, 0.9), 1px 1px 0.5px rgba(255, 255, 255, 0.15);
        }
        .text-carved-light {
          color: rgba(1, 31, 91, 0.9);
          text-shadow: -1px -1px 0.5px rgba(0, 0, 0, 0.3), 1px 1px 0.5px rgba(255, 255, 255, 0.6);
        }
        
        /* Premium Metallic Card Styling */
        .metallic-card {
          position: relative;
          overflow: hidden;
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .metallic-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: -150%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0) 10%,
            rgba(255, 255, 255, 0.08) 35%,
            rgba(255, 255, 255, 0.18) 50%,
            rgba(255, 255, 255, 0.08) 65%,
            rgba(255, 255, 255, 0) 90%,
            transparent
          );
          transform: skewX(-25deg);
          transition: left 0.85s cubic-bezier(0.25, 1, 0.5, 1);
          pointer-events: none;
          z-index: 10;
        }
        
        .metallic-card:hover::before {
          left: 150%;
        }

        .metallic-card-gold {
          border: 1px solid rgba(255, 255, 255, 0.45);
          box-shadow: 
            inset 0 1.5px 0.5px rgba(255, 255, 255, 0.5),
            inset 0 -1.5px 1px rgba(0, 0, 0, 0.12),
            0 12px 28px -4px rgba(0, 0, 0, 0.15),
            0 20px 40px -15px rgba(212, 163, 115, 0.25);
        }

        .metallic-card-standard {
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 
            inset 0 1.5px 0.5px rgba(255, 255, 255, 0.22),
            inset 0 -1.5px 1px rgba(0, 0, 0, 0.3),
            0 12px 28px -4px rgba(0, 0, 0, 0.25);
        }
      `}} />

      {/* ═══ HERO ═══ */}
      <div className="[&_.hero-atom-origin]:invisible">
        <Hero />
      </div>

      {/* ═══ CLUBS SECTION ═══ */}
      <section
        id="clubs"
        className="relative flex min-h-[calc(100svh-4rem)] scroll-mt-16 overflow-hidden bg-white px-6 py-12 sm:px-8 lg:px-10"
      >
        <div className="mx-auto grid w-full max-w-7xl grid-rows-[1fr_auto] items-center gap-8 lg:grid-cols-2 lg:grid-rows-1 lg:gap-10">
          {/* Left column – sizing placeholder for atom */}
          <div className="flex min-h-[42svh] items-center justify-center lg:min-h-0">
            <div
              ref={clubsAnchorRef}
              className="relative flex aspect-square w-[min(78vw,25rem)] items-center justify-center sm:w-[30rem] lg:w-[34rem]"
            />
          </div>

          {/* Right column – dynamic interactive area */}
          <div
            className={`relative flex min-h-[34svh] items-center justify-center lg:min-h-0 transition-all duration-700 ease-out ${
              clubsTextVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            {/* 1. Default Heading - Fades out slowly and moves to the right when a club is selected */}
            <div
              className={`flex flex-col items-center justify-center text-center transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${
                selectedClub
                  ? "opacity-0 translate-x-[80px] pointer-events-none absolute"
                  : "opacity-100 translate-x-0"
              }`}
            >
              <h2 className="font-display text-[clamp(3.5rem,11vw,8.5rem)] font-black leading-[0.88] text-primary">
                Our
                <span className="block text-accent">Clubs.</span>
              </h2>
              <p className="mt-4 font-body text-slate-400 text-sm font-medium animate-pulse">
                Click any electron node or the nucleus to explore
              </p>
            </div>

            {/* 2. Selected Club Details - Premium Credit Card Aesthetic (Spacious & Clean Layout) */}
            <div
              className={`transition-all duration-500 ease-out ${
                cardRevealVisible
                  ? "opacity-100 translate-x-0 scale-100"
                  : "opacity-0 translate-x-10 scale-[0.97] pointer-events-none"
              }`}
              style={{ willChange: "transform, opacity" }}
            >
            {CLUBS_DETAILS.map((club) => {
              const isActive = selectedClub === club.slug;
              if (!isActive) return null;

              // Special Luxury Golden Executive Card (Nucleus) - Simplified Clean gold background
              if (club.isSpecial) {
                return (
                  <div
                    key={club.slug}
                    className="animate-slide-in-card metallic-card metallic-card-gold relative flex flex-col justify-between pt-10 pb-6 px-10 sm:pt-12 sm:pb-8 sm:px-12 rounded-3xl bg-accent w-full max-w-lg min-h-[460px] overflow-hidden"
                  >
                    {/* Left connection indicator - emerges from the orbit */}
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-primary/20" />

                    {/* Close / Dismiss button at top right */}
                    <button
                      onClick={handleCloseClub}
                      className="absolute top-6 right-6 p-2 rounded-full text-primary/60 hover:text-primary hover:bg-primary/5 transition-all duration-200 z-20"
                      aria-label="Back to clubs"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    <div className="flex flex-col h-full justify-between gap-6">
                      {/* Header Area */}
                      <div>
                        {/* Category Indicator & Icon */}
                        <div className="flex items-center gap-2 mb-2.5 opacity-90 animate-flicker-in">
                          <ClubIcon name={club.iconName} className="w-4 h-4 text-primary/70" />
                          <span className="text-[11px] font-bold tracking-[0.2em] text-primary/75 uppercase font-body">
                            {club.category}
                          </span>
                        </div>

                        {/* Large Title */}
                        <h3 className="animate-flicker-in text-carved-light font-display text-4xl sm:text-5xl font-black mb-6 tracking-tight">
                          {club.name}
                        </h3>

                        {/* Club Tags / Themes */}
                        <div className="animate-fade-in-delayed flex flex-wrap gap-x-2 gap-y-1 text-xs font-semibold text-slate-800/80 font-body">
                          {club.themes.map((theme, i) => (
                            <span key={theme} className="flex items-center">
                              {theme}
                              {i < club.themes.length - 1 && <span className="ml-2 mr-0.5 opacity-60">•</span>}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Description */}
                      <div className="flex-grow flex items-center">
                        <p className="animate-fade-in-delayed font-body text-slate-800 text-sm sm:text-base leading-relaxed max-w-md font-medium">
                          {club.tagline}
                        </p>
                      </div>

                      {/* Club Information Row */}
                      <div className="animate-fade-in-delayed border-t border-primary/10 pt-5 mt-auto">
                        <div className="grid grid-cols-3 gap-4">
                          {club.info.map((item) => (
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

                      {/* Action Area */}
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

              // Standard Club Cards - Simplified Clean primary deep navy background
              return (
                <div
                  key={club.slug}
                  className="animate-slide-in-card metallic-card metallic-card-standard relative flex flex-col justify-between pt-10 pb-6 px-10 sm:pt-12 sm:pb-8 sm:px-12 rounded-3xl bg-primary w-full max-w-lg min-h-[460px] overflow-hidden"
                  style={{
                    boxShadow: `inset 0 1.5px 0.5px rgba(255, 255, 255, 0.22), inset 0 -1.5px 1px rgba(0, 0, 0, 0.3), 0 12px 28px -4px rgba(0, 0, 0, 0.25), 0 15px 35px -5px ${club.color}25`
                  }}
                >
                  {/* Left connection indicator - emerges from the orbit */}
                  <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ backgroundColor: club.color }} />

                  {/* Close / Dismiss button at top right */}
                  <button
                    onClick={handleCloseClub}
                    className="absolute top-6 right-6 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/8 transition-all duration-200 z-20"
                    aria-label="Back to clubs"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="flex flex-col h-full justify-between gap-6">
                    {/* Header Area */}
                    <div>
                      {/* Category Indicator & Icon */}
                      <div className="flex items-center gap-2 mb-2.5 opacity-90 animate-flicker-in">
                        <ClubIcon name={club.iconName} className="w-4 h-4 text-white/70" />
                        <span className="text-[11px] font-bold tracking-[0.2em] text-white/60 uppercase font-body">
                          {club.category}
                        </span>
                      </div>

                      {/* Large Title */}
                      <h3 className="animate-flicker-in text-carved-dark font-display text-4xl sm:text-5xl font-black mb-6 tracking-tight">
                        {club.name}
                      </h3>

                      {/* Club Tags / Themes */}
                      <div className="animate-fade-in-delayed flex flex-wrap gap-x-2 gap-y-1 text-xs font-medium text-slate-300/80 font-body">
                        {club.themes.map((theme, i) => (
                          <span key={theme} className="flex items-center">
                            {theme}
                            {i < club.themes.length - 1 && <span className="ml-2 mr-0.5 opacity-60">•</span>}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="flex-grow flex items-center">
                      <p className="animate-fade-in-delayed font-body text-slate-200/90 text-sm sm:text-base leading-relaxed max-w-md">
                        {club.tagline}
                      </p>
                    </div>

                    {/* Club Information Row */}
                    <div className="animate-fade-in-delayed border-t border-white/10 pt-5 mt-auto">
                      <div className="grid grid-cols-3 gap-4">
                        {club.info.map((item) => (
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

                    {/* Action Area */}
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

      {/* ═══ SINGLE FLOATING ATOM ═══ */}
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
          style={{ width: CANVAS_INTRINSIC, height: CANVAS_INTRINSIC, willChange: "transform" }}
        >
          {/* pointer-events-auto so listeners on canvas work! */}
          <div className="pointer-events-auto">
            <HeroAtom
              progressRef={atomProgressRef}
              rotationOffsetRef={rotationOffsetRef}
              nucleusSeparationRef={nucleusSeparationRef}
              onElectronClick={handleElectronClick}
            />
          </div>
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        {phaseRef.current === "animating" ? "Moving between sections" : ""}
      </span>
    </div>
  );
}
