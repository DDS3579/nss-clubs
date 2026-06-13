"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Hero from "./Hero";
import HeroAtom, { TIMELINE_NODES } from "./HeroAtom";
import EventsConstellation, { DOTS } from "./EventsConstellation";
import GalleryOrbit from "./home/GalleryOrbit";
import ConstellationFooter from "./layout/ConstellationFooter";
import { urlFor } from "@/sanity/lib/image";
import type { HomepageData } from "@/sanity/lib/types";

/* ─── constants ─── */
const HEADER_H = 64;
const TRANSITION_MS_DEFAULT = 950;
const TRANSITION_MS_ABOUT = 1200;
const TRANSITION_MS_EVENTS = 2400;
const CANVAS_INTRINSIC = 640;

const CLUBS_DETAILS = [
  {
    slug: "stem",
    name: "STEM Club",
    tagline:
      "Innovate, build, and explore the frontiers of science, coding, and technology.",
    color: "#0284c7",
    category: "Science & Technology",
    iconName: "Terminal",
    themes: ["Science", "Tech", "Engineering", "Math"],
    info: [
      { label: "Members", value: "120+" },
      { label: "Meetings", value: "Weekly" },
      { label: "Activity", value: "High" },
    ],
  },
  {
    slug: "sports",
    name: "Sports Club",
    tagline:
      "Unleash your athletic potential, embrace teamwork, and chase victory.",
    color: "#f59e0b",
    category: "Athletics & Health",
    iconName: "Trophy",
    themes: ["Athletics", "Teamwork", "Tournaments", "Fitness"],
    info: [
      { label: "Members", value: "200+" },
      { label: "Meetings", value: "Bi-Weekly" },
      { label: "Activity", value: "Very High" },
    ],
  },
  {
    slug: "literature",
    name: "Literature Club",
    tagline:
      "Celebrate the power of words, creative writing, poetry, and deep debates.",
    color: "#10b981",
    category: "Arts & Letters",
    iconName: "BookOpen",
    themes: ["Creative Writing", "Poetry", "Debate", "Storytelling"],
    info: [
      { label: "Members", value: "80+" },
      { label: "Meetings", value: "Weekly" },
      { label: "Activity", value: "Active" },
    ],
  },
  {
    slug: "arts",
    name: "Arts & Craft Club",
    tagline:
      "Express yourself visually through beautiful paintings, sketches, and manual crafts.",
    color: "#f43f5e",
    category: "Creative & Design",
    iconName: "Palette",
    themes: ["Painting", "Crafts", "Sketching", "Design"],
    info: [
      { label: "Members", value: "90+" },
      { label: "Meetings", value: "Weekly" },
      { label: "Activity", value: "Active" },
    ],
  },
  {
    slug: "entertainment",
    name: "Entertainment Club",
    tagline: "Bring joy, music, dance, and theater to the main stage of NSS.",
    color: "#8b5cf6",
    category: "Performing Arts",
    iconName: "Music",
    themes: ["Music", "Dance", "Theater", "Production"],
    info: [
      { label: "Members", value: "150+" },
      { label: "Meetings", value: "Multi-Weekly" },
      { label: "Activity", value: "Very High" },
    ],
  },
  {
    slug: "social",
    name: "Social Club",
    tagline:
      "Make a positive impact on society through volunteering, empathy, and social work.",
    color: "#0d9488",
    category: "Community Service",
    iconName: "Heart",
    themes: ["Volunteering", "Social Work", "Charity", "Community"],
    info: [
      { label: "Members", value: "250+" },
      { label: "Meetings", value: "Monthly" },
      { label: "Activity", value: "High" },
    ],
  },
  {
    slug: "executive-team",
    name: "Executive Team",
    tagline:
      "Meet the visionary leaders, advisors, and coordinators steering the NSS Clubs towards excellence and impact.",
    color: "#D4A373",
    category: "Governance & Operations",
    iconName: "Shield",
    isSpecial: true,
    themes: ["Leadership", "Strategy", "Advising", "Operations"],
    info: [
      { label: "Officers", value: "15" },
      { label: "Meetings", value: "Weekly" },
      { label: "Activity", value: "Continuous" },
    ],
  },
];

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

function getLayoutElement(selector: string): HTMLElement | null {
  const els = document.querySelectorAll<HTMLElement>(selector);
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

function getAboutEventsTriggerPoint(aboutSection: HTMLElement) {
  const scrollableH = Math.max(aboutSection.offsetHeight - window.innerHeight, 1);
  const progressTrigger = scrollableH * ABOUT_EVENTS_TRIGGER_RATIO;
  const viewportLeadTrigger = scrollableH - window.innerHeight * 0.28;
  return Math.max(
    0,
    Math.min(scrollableH - 5, Math.max(progressTrigger, viewportLeadTrigger)),
  );
}

function getEventsGalleryTriggerPoint(eventsSection: HTMLElement) {
  const scrollableH = Math.max(eventsSection.offsetHeight - window.innerHeight, 1);
  const progressTrigger = scrollableH * 0.75;
  const viewportLeadTrigger = scrollableH - window.innerHeight * 0.2;
  return Math.max(
    0,
    Math.min(scrollableH - 5, Math.max(progressTrigger, viewportLeadTrigger)),
  );
}

type MorphPoint = {
  x: number;
  y: number;
  size: number;
};

type PlanetDotMorph = {
  key: string;
  selectors: string[];
  dotId: number;
  fromColor: string;
  toColor: string;
  stagger: number;
};

const PLANET_DOT_MORPHS: PlanetDotMorph[] = [
  {
    key: "mercury",
    selectors: ["#about .solar-desktop .p-mercury"],
    dotId: 0,
    fromColor: "#b8c0c9",
    toColor: "#1a3378",
    stagger: 0,
  },
  {
    key: "venus",
    selectors: ["#about .solar-desktop .p-venus"],
    dotId: 5,
    fromColor: "#d9a763",
    toColor: "#1a3378",
    stagger: 0.06,
  },
  {
    key: "earth",
    selectors: ["#about .solar-desktop .p-earth", "#about .solar-mobile .mob-dot-earth"],
    dotId: 2,
    fromColor: "#3e8fb0",
    toColor: "#1a3378",
    stagger: 0.12,
  },
  {
    key: "sun",
    selectors: ["#about .solar-desktop .p-sun", "#about .solar-mobile .mob-sun"],
    dotId: 4,
    fromColor: "#ffb703",
    toColor: "#c8903a",
    stagger: 0.3,
  },
  {
    key: "mars",
    selectors: ["#about .solar-desktop .p-mars"],
    dotId: 1,
    fromColor: "#cf5a3c",
    toColor: "#1a3378",
    stagger: 0.18,
  },
  {
    key: "jupiter",
    selectors: ["#about .solar-desktop .p-jupiter", "#about .solar-mobile .mob-dot-jupiter"],
    dotId: 3,
    fromColor: "#d4924c",
    toColor: "#1a3378",
    stagger: 0.24,
  },
  {
    key: "saturn",
    selectors: ["#about .solar-desktop .p-saturn-wrap"],
    dotId: 12,
    fromColor: "#d0a45f",
    toColor: "#1a3378",
    stagger: 0.28,
  },
];

const MORPH_DURATION_FRACTION = 0.7;
const MORPH_DOT_IDS = PLANET_DOT_MORPHS.map((item) => item.dotId);
const ABOUT_EVENTS_TRIGGER_RATIO = 0.68;

type Phase = "hero" | "animating" | "clubs" | "zooming" | "zoomed" | "about" | "events" | "gallery";
interface AnimState {
  targetPhase: "hero" | "clubs" | "about" | "events" | "gallery";
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

export default function HomeScrollExperience({ data }: { data: HomepageData }) {
  /* ── refs ── */
  const clubsAnchorRef = useRef<HTMLDivElement>(null);
  const aboutAnchorRef = useRef<HTMLDivElement>(null);
  const aboutCardRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const phaseRef = useRef<Phase>("hero");
  const animRef = useRef<AnimState | null>(null);
  const atomProgressRef = useRef(0);
  const aboutProgressRef = useRef(0);
  const touchStartRef = useRef<number | null>(null);
  const prevShowTextRef = useRef(false);
  const initializedRef = useRef(false);
  const rotationOffsetRef = useRef(0);
  const nucleusSeparationRef = useRef(0);
  const zoomAnimRef = useRef<ZoomAnimState | null>(null);
  const pendingZoomSlugRef = useRef<string | null>(null);
  const initZoomRef = useRef<(slug: string) => void>(() => {});
  const activeAboutNodeRef = useRef(0);
  const prevActiveNodeRef = useRef(-1);
  const lastTransitionTimeRef = useRef(0);
  const eventsMorphRef = useRef(0);
  const morphGhostRefs = useRef<(HTMLDivElement | null)[]>([]);
  const morphedDotsVisibleRef = useRef(false);
  const galleryHandoffRef = useRef(false);

  const [clubsTextVisible, setClubsTextVisible] = useState(false);
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [cardRevealVisible, setCardRevealVisible] = useState(false);
  const [activeAboutNode, setActiveAboutNode] = useState(0);
  const [morphedDotIds, setMorphedDotIds] = useState<number[]>([]);
  const cardWrapperRef = useRef<HTMLDivElement>(null);

  const [projectorCoords, setProjectorCoords] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    x3: number;
    y3: number;
  } | null>(null);

  /* ── Trigger a section-snap transition ── */
  const startTransition = useCallback(
    (targetPhase: "hero" | "clubs" | "about" | "events") => {
      if (phaseRef.current === "animating") return;
      if (phaseRef.current === "zooming" || phaseRef.current === "zoomed")
        return;

      let scrollTarget = 0;
      if (targetPhase === "hero") {
        scrollTarget = 0;
      } else if (targetPhase === "clubs") {
        const clubsSection = document.getElementById("clubs");
        if (clubsSection) {
          scrollTarget =
            clubsSection.getBoundingClientRect().top +
            window.scrollY -
            HEADER_H;
        }
      } else if (targetPhase === "about") {
        const aboutSection = document.getElementById("about");
        if (aboutSection) {
          scrollTarget =
            aboutSection.getBoundingClientRect().top +
            window.scrollY -
            HEADER_H;
        } else {
          // 🛡️ FALLBACK: If #about is missing, scroll down 80% of a viewport from clubs
          const clubsSection = document.getElementById("clubs");
          if (clubsSection) {
            scrollTarget =
              clubsSection.getBoundingClientRect().top +
              window.scrollY +
              window.innerHeight * 0.8 -
              HEADER_H;
          }
        }
      } else if (targetPhase === "events") {
        const eventsSection = document.getElementById("events");
        if (eventsSection) {
          scrollTarget =
            eventsSection.getBoundingClientRect().top +
            window.scrollY -
            HEADER_H;
        } else {
          // 🛡️ FALLBACK: If #events is missing, scroll down 80% of a viewport from about
          const aboutSection = document.getElementById("about");
          if (aboutSection) {
            scrollTarget =
              aboutSection.getBoundingClientRect().top +
              window.scrollY +
              aboutSection.offsetHeight -
              HEADER_H;
          }
        }
      }

      phaseRef.current = "animating";
      animRef.current = {
        targetPhase,
        startTime: performance.now(),
        scrollStart: window.scrollY,
        scrollEnd: scrollTarget,
      };
    },
    [],
  );

  /* ── Trigger the events → gallery smooth morph transition ── */
  const startGalleryTransition = useCallback(() => {
    if (phaseRef.current === "animating") return;
    if (phaseRef.current === "zooming" || phaseRef.current === "zoomed") return;

    const gallerySection = document.getElementById("gallery");
    let scrollTarget = 0;
    if (gallerySection) {
      scrollTarget =
        gallerySection.getBoundingClientRect().top +
        window.scrollY -
        HEADER_H;
    } else {
      // 🛡️ FALLBACK: If #gallery is missing, scroll down ~1.5 viewports from the events section
      const eventsSection = document.getElementById("events");
      if (eventsSection) {
        scrollTarget =
          eventsSection.getBoundingClientRect().top +
          window.scrollY +
          eventsSection.offsetHeight -
          HEADER_H;
      } else {
        scrollTarget = window.scrollY + window.innerHeight * 1.5;
      }
    }

    phaseRef.current = "animating";
    animRef.current = {
      targetPhase: "gallery",
      startTime: performance.now(),
      scrollStart: window.scrollY,
      scrollEnd: scrollTarget,
    };
  }, []);

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
    const targetRotation = ROTATION_OFFSETS[slug] ?? 0;
    const electronCanvasX = isNucleus
      ? CANVAS_INTRINSIC / 2
      : ELECTRON_TARGET_X;
    const electronCanvasY = isNucleus
      ? CANVAS_INTRINSIC / 2
      : ELECTRON_TARGET_Y;

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
  }, []);

  useEffect(() => {
    initZoomRef.current = initZoom;
  }, [initZoom]);

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
        startTransition("clubs");
        pendingZoomSlugRef.current = slug;
      } else if (phaseRef.current === "clubs") {
        initZoomRef.current(slug);
      }
    },
    [startTransition],
  );

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
  }, [selectedClub]);

  /* ── Holographic Projector Coordinate Updater (Club zoom only) ── */
  const updateProjectorCoords = useCallback(() => {
    if (selectedClub && cardWrapperRef.current && phaseRef.current !== "about") {
      const cardRect = cardWrapperRef.current.getBoundingClientRect();
      const x1 = window.innerWidth * 0.18;
      const y1 = window.innerHeight * 0.5;
      const x2 = cardRect.left;
      const y2 = cardRect.top;
      const x3 = cardRect.left;
      const y3 = cardRect.bottom;
      setProjectorCoords({ x1, y1, x2, y2, x3, y3 });
    } else {
      setProjectorCoords(null);
    }
  }, [selectedClub]);

  const syncMorphedDots = (visible: boolean) => {
    if (morphedDotsVisibleRef.current === visible) return;
    morphedDotsVisibleRef.current = visible;
    setMorphedDotIds(visible ? MORPH_DOT_IDS : []);
  };

  const getMorphElementPoint = (selectors: string[]): MorphPoint | null => {
    for (const selector of selectors) {
      const el = getLayoutElement(selector);
      if (!el) continue;

      const rect = el.getBoundingClientRect();
      return {
        x: rect.left + window.scrollX + rect.width / 2,
        y: rect.top + window.scrollY + rect.height / 2,
        size: Math.max(rect.width, rect.height),
      };
    }

    return null;
  };

  const getConstellationDotPoint = (dotId: number): MorphPoint | null => {
    const svg = document.querySelector<SVGSVGElement>("#events .ec-constellation-svg");
    const dot = DOTS.find((item) => item.id === dotId);
    if (!svg || !dot) return null;

    const rect = svg.getBoundingClientRect();
    const scaleX = rect.width / 1000;
    const scaleY = rect.height / 600;

    return {
      x: rect.left + window.scrollX + dot.cx * scaleX,
      y: rect.top + window.scrollY + dot.cy * scaleY,
      size: Math.max(5, dot.r * 2 * Math.min(scaleX, scaleY)),
    };
  };

  const updateMorphGhosts = (progress: number) => {
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

      const from = getMorphElementPoint(morph.selectors);
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

      ghost.style.opacity = "1";
      ghost.style.left = `${x}px`;
      ghost.style.top = `${y}px`;
      ghost.style.width = `${size}px`;
      ghost.style.height = `${size}px`;
      ghost.style.transform = "translate3d(-50%, -50%, 0) scale(1)";
      ghost.style.background = `radial-gradient(circle at 32% 30%, ${shine} 0%, ${color} 52%, ${morph.toColor} 100%)`;
      ghost.style.boxShadow = `0 0 ${Math.max(12, size * 0.45)}px rgba(26, 51, 120, ${glow})`;
    });
  };

  useEffect(() => {
    if (cardRevealVisible && phaseRef.current !== "about") {
      const timer = setTimeout(() => {
        updateProjectorCoords();
      }, 50);
      window.addEventListener("resize", updateProjectorCoords);
      window.addEventListener("scroll", updateProjectorCoords);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", updateProjectorCoords);
        window.removeEventListener("scroll", updateProjectorCoords);
      };
    } else {
      setProjectorCoords(null);
    }
  }, [cardRevealVisible, updateProjectorCoords]);

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

      if (!initializedRef.current) {
        initializedRef.current = true;
        const clubsSection = document.getElementById("clubs");
        const aboutSection = document.getElementById("about");
        const eventsSection = document.getElementById("events");
        if (
          eventsSection &&
          window.scrollY >=
            eventsSection.getBoundingClientRect().top +
              window.scrollY -
              HEADER_H -
              50
        ) {
          phaseRef.current = "events";
          atomProgressRef.current = 1;
          aboutProgressRef.current = 1;
          eventsMorphRef.current = 1;
          prevShowTextRef.current = true;
          setClubsTextVisible(true);
        } else if (
          aboutSection &&
          window.scrollY >=
            aboutSection.getBoundingClientRect().top +
              window.scrollY -
              HEADER_H -
              50
        ) {
          phaseRef.current = "about";
          atomProgressRef.current = 1;
          aboutProgressRef.current = 1;
          eventsMorphRef.current = 0;
          prevShowTextRef.current = true;
          setClubsTextVisible(true);
        } else if (
          clubsSection &&
          window.scrollY >=
            clubsSection.getBoundingClientRect().top +
              window.scrollY -
              HEADER_H -
              50
        ) {
          phaseRef.current = "clubs";
          atomProgressRef.current = 1;
          aboutProgressRef.current = 0;
          eventsMorphRef.current = 0;
          prevShowTextRef.current = true;
          setClubsTextVisible(true);
        }
        floating.style.opacity = "1";
      }

      let posT = 0;
      let aboutT = 0;

      if (phaseRef.current === "animating" && animRef.current) {
        const anim = animRef.current;
        const elapsed = now - anim.startTime;

        const isAboutTransition =
          anim.targetPhase === "about" ||
          (anim.targetPhase === "clubs" && anim.scrollStart > anim.scrollEnd);
        const isEventsMorphTransition =
          anim.targetPhase === "events" ||
          (anim.targetPhase === "about" &&
            anim.scrollStart > anim.scrollEnd &&
            eventsMorphRef.current > 0.1);
        const duration = isEventsMorphTransition
          ? TRANSITION_MS_EVENTS
          : isAboutTransition
          ? TRANSITION_MS_ABOUT
          : TRANSITION_MS_DEFAULT;
        const rawT = clamp01(elapsed / duration);
        const easedT = easeInOutQuart(rawT);

        if (anim.targetPhase === "clubs") {
          if (anim.scrollStart < anim.scrollEnd) {
            posT = easedT;
            aboutT = 0;
          } else {
            posT = 1;
            aboutT = 1 - easedT;
          }
        } else if (anim.targetPhase === "hero") {
          posT = 1 - easedT;
          aboutT = 0;
        } else if (anim.targetPhase === "about") {
          posT = 1;
          if (anim.scrollStart < anim.scrollEnd) {
            aboutT = easedT;
          } else {
            aboutT = 1;
          }
        } else if (anim.targetPhase === "events") {
          posT = 1;
          aboutT = 1;
        } else if (anim.targetPhase === "gallery") {
          // Events → gallery smooth morph: preserve the events visual state
          // (atom + about fully shown, events morph complete) while the rAF
          // tick glides the page scroll to the gallery section. The
          // GalleryOrbit scroll-bridge particles animate off the raw scroll
          // position, so they ride the morph naturally.
          posT = 1;
          aboutT = 1;
        }

        if (anim.targetPhase === "events") {
          eventsMorphRef.current = easedT;
        } else if (anim.targetPhase === "about" && anim.scrollStart > anim.scrollEnd) {
          eventsMorphRef.current = 1 - easedT;
        } else {
          eventsMorphRef.current = 0;
        }

        atomProgressRef.current = posT;
        aboutProgressRef.current = aboutT;
        window.scrollTo(0, lerp(anim.scrollStart, anim.scrollEnd, easedT));

        if (rawT >= 1) {
          phaseRef.current = anim.targetPhase;
          animRef.current = null;
          lastTransitionTimeRef.current = performance.now();
          updateProjectorCoords();
          if (phaseRef.current === "clubs" && pendingZoomSlugRef.current) {
            const slug = pendingZoomSlugRef.current;
            pendingZoomSlugRef.current = null;
            initZoomRef.current(slug);
          }
        }
      } else if (
        phaseRef.current === "zooming" ||
        phaseRef.current === "zoomed"
      ) {
        posT = 1;
        aboutT = 0;
        eventsMorphRef.current = 0;
        atomProgressRef.current = 1;
        aboutProgressRef.current = 0;
      } else {
        const clubsSection = document.getElementById("clubs");
        const aboutSection = document.getElementById("about");
        const eventsSection = document.getElementById("events");
        const gallerySection = document.getElementById("gallery");

        if (clubsSection) {
          const clubsRect = clubsSection.getBoundingClientRect();
          const clubsScrollY = clubsRect.top + window.scrollY - HEADER_H;

          // 🛡️ FALLBACK: If #about is missing, use a safe distance below clubs
          const aboutScrollY = aboutSection
            ? aboutSection.getBoundingClientRect().top +
              window.scrollY -
              HEADER_H
            : clubsScrollY + window.innerHeight * 0.8;

          // 🛡️ FALLBACK: If #events is missing, use a safe distance below about
          const eventsScrollY = eventsSection
            ? eventsSection.getBoundingClientRect().top +
              window.scrollY -
              HEADER_H
            : aboutScrollY + (aboutSection ? aboutSection.offsetHeight : window.innerHeight * 0.8);

          // 🛡️ FALLBACK: If #gallery is missing, use a safe distance below events
          const galleryScrollY = gallerySection
            ? gallerySection.getBoundingClientRect().top +
              window.scrollY -
              HEADER_H
            : eventsScrollY + (eventsSection ? eventsSection.offsetHeight : window.innerHeight * 0.8);

          const sy = window.scrollY;

          if (sy < clubsScrollY) {
            phaseRef.current = "hero";
            posT = clamp01(sy / Math.max(clubsScrollY, 1));
            aboutT = 0;
            eventsMorphRef.current = 0;
          } else if (sy < aboutScrollY) {
            phaseRef.current = "clubs";
            posT = 1;
            aboutT = clamp01(
              (sy - clubsScrollY) / Math.max(aboutScrollY - clubsScrollY, 1),
            );
            eventsMorphRef.current = 0;
          } else if (sy < eventsScrollY) {
            phaseRef.current = "about";
            posT = 1;
            aboutT = 1;
            eventsMorphRef.current = 0;

            if (aboutSection) {
              const aRect = aboutSection.getBoundingClientRect();
              const sectionScrolled = -(aRect.top - HEADER_H);
              const scrollableH =
                aboutSection.offsetHeight - window.innerHeight;
              const subProg = clamp01(
                sectionScrolled / Math.max(scrollableH, 1),
              );
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
        }
        atomProgressRef.current = posT;
        aboutProgressRef.current = aboutT;
      }

      const heroRect = heroAnchor.getBoundingClientRect();
      const clubsRect = clubsAnchor.getBoundingClientRect();
      const aboutAnchor = aboutAnchorRef.current;

      let cx = 0,
        cy = 0,
        size = 0;
      if (aboutProgressRef.current > 0.001 && aboutAnchor) {
        // Calculate target positions dynamically based on the bounding rect of the about anchor element
        const anchorRect = aboutAnchor.getBoundingClientRect();
        const targetX = anchorRect.left + anchorRect.width / 2;
        const targetY = anchorRect.top + anchorRect.height / 2;
        const targetSize = anchorRect.width;

        const fromCx = clubsRect.left + clubsRect.width / 2;
        const fromCy = clubsRect.top + clubsRect.height / 2;

        cx = lerp(fromCx, targetX, aboutProgressRef.current);
        cy = lerp(fromCy, targetY, aboutProgressRef.current);
        size = lerp(clubsRect.width, targetSize, aboutProgressRef.current);
      } else {
        const fromCx = heroRect.left + heroRect.width / 2;
        const fromCy = heroRect.top + heroRect.height / 2;
        const toCx = clubsRect.left + clubsRect.width / 2;
        const toCy = clubsRect.top + clubsRect.height / 2;
        cx = lerp(fromCx, toCx, atomProgressRef.current);
        cy = lerp(fromCy, toCy, atomProgressRef.current);
        size = lerp(heroRect.width, clubsRect.width, atomProgressRef.current);
      }

      floating.style.transform = `translate(${cx - CANVAS_INTRINSIC / 2}px, ${cy - CANVAS_INTRINSIC / 2}px)`;
      canvasWrap.style.transform = `scale(${size / CANVAS_INTRINSIC})`;

      // Fade canvas out during the about transition so the HTML solar system takes over
      // The atom morph animation in HeroAtom handles the visual transformation (nucleus→sun, electrons→planets)
      // while this opacity crossfade ensures a seamless handoff to the static HTML planets
      if (aboutProgressRef.current > 0.001) {
        const fadeOut = 1 - clamp01((aboutProgressRef.current - 0.55) / 0.35);
        floating.style.opacity = `${fadeOut}`;
      } else {
        floating.style.opacity = '1';
      }

      // Add/remove .revealed and .exhaled classes on #about section for responsive CSS burst animations
      const aboutSection = document.getElementById("about");
      if (aboutSection) {
        const isTransitioningToEvents = phaseRef.current === "animating" && animRef.current?.targetPhase === "events";
        const isEvents = phaseRef.current === "events" || isTransitioningToEvents;

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

      updateMorphGhosts(eventsMorphRef.current);

      if (
        (phaseRef.current === "zooming" || phaseRef.current === "zoomed") &&
        zoomAnimRef.current
      ) {
        const zoom = zoomAnimRef.current;
        const isNucleusZoom = zoom.slug === "executive-team";
        const duration = isNucleusZoom ? NUCLEUS_ZOOM_DURATION : ZOOM_DURATION;
        const zTargetScale = zoom.clubsScale * ZOOM_SCALE_FACTOR;
        const zTargetVpX = window.innerWidth * 0.18;
        const zTargetVpY = window.innerHeight * 0.5;
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
                setSelectedClub(null);
                setCardRevealVisible(false);
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
                setSelectedClub(null);
                setCardRevealVisible(false);
              }
            }
          }
        }
      }

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
    const releaseEventsHandoff = (direction: number) => {
      if (
        direction <= 0 ||
        phaseRef.current !== "animating" ||
        animRef.current?.targetPhase !== "events"
      ) {
        return false;
      }

      const eventsSection = document.getElementById("events");
      if (!eventsSection) return false;

      const eventsTop = eventsSection.getBoundingClientRect().top;
      if (eventsTop > HEADER_H + 18) return false;

      phaseRef.current = "events";
      animRef.current = null;
      eventsMorphRef.current = 1;
      atomProgressRef.current = 1;
      aboutProgressRef.current = 1;
      lastTransitionTimeRef.current = performance.now() - 800;
      return true;
    };

    const isBelowEventsStart = () => {
      const eventsSection = document.getElementById("events");
      if (!eventsSection) return false;

      const eventsScrollY =
        eventsSection.getBoundingClientRect().top + window.scrollY - HEADER_H;
      return window.scrollY > eventsScrollY + 12;
    };

    const getSectionScrollY = (id: string) => {
      const section = document.getElementById(id);
      if (!section) return null;
      return section.getBoundingClientRect().top + window.scrollY - HEADER_H;
    };

    const smoothScrollToSection = (id: string) => {
      const targetY = getSectionScrollY(id);
      if (targetY === null || galleryHandoffRef.current) return false;

      galleryHandoffRef.current = true;
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: "smooth",
      });

      window.setTimeout(() => {
        galleryHandoffRef.current = false;
      }, 950);

      return true;
    };

    const handleEventsGalleryHandoff = (direction: number) => {
      if (phaseRef.current !== "events" || galleryHandoffRef.current) {
        return false;
      }

      const eventsSection = document.getElementById("events");
      const gallerySection = document.getElementById("gallery");
      if (!eventsSection || !gallerySection) return false;

      const eventsY = getSectionScrollY("events");
      const galleryY = getSectionScrollY("gallery");
      if (eventsY === null || galleryY === null) return false;

      const sy = window.scrollY;
      const nearEventsStart = Math.abs(sy - eventsY) < 90;
      const nearGalleryStart = Math.abs(sy - galleryY) < 120;

      const eRect = eventsSection.getBoundingClientRect();
      const sectionScrolled = -(eRect.top - HEADER_H);
      const triggerPoint = getEventsGalleryTriggerPoint(eventsSection);
      const nearEventsEnd = sectionScrolled >= triggerPoint;

      if (direction > 0 && nearEventsEnd) {
        startGalleryTransition();
        return true;
      }

      if (direction < 0 && nearGalleryStart) {
        startTransition("events");
        return true;
      }

      return false;
    };

    const handleWheel = (e: WheelEvent) => {
      if (releaseEventsHandoff(e.deltaY)) return;

      if (handleEventsGalleryHandoff(e.deltaY)) {
        e.preventDefault();
        return;
      }

      if (phaseRef.current === "events" && e.deltaY > 0) return;
      if (phaseRef.current === "events" && isBelowEventsStart()) return;

      if (
        phaseRef.current === "animating" ||
        phaseRef.current === "zooming" ||
        phaseRef.current === "zoomed"
      ) {
        e.preventDefault();
        return;
      }

      // Snapping transition cooldown: block new snapping transitions within 700ms of the last one completing
      const isCooldown = performance.now() - lastTransitionTimeRef.current < 700;

      const clubsSection = document.getElementById("clubs");
      const aboutSection = document.getElementById("about");
      const eventsSection = document.getElementById("events");
      if (!clubsSection) return;
      const clubsAbsTop =
        clubsSection.getBoundingClientRect().top + window.scrollY;
      const clubsScrollY = clubsAbsTop - HEADER_H;

      if (e.deltaY > 0 && phaseRef.current === "hero") {
        e.preventDefault();
        if (isCooldown) return;
        if (Math.abs(e.deltaY) >= 30) startTransition("clubs");
        return;
      }
      if (phaseRef.current === "clubs") {
        if (e.deltaY < 0) {
          if (window.scrollY <= clubsScrollY + 15) {
            e.preventDefault();
            if (isCooldown) return;
            if (Math.abs(e.deltaY) >= 30) startTransition("hero");
          }
        } else if (e.deltaY > 0) {
          e.preventDefault();
          if (isCooldown) return;
          if (Math.abs(e.deltaY) >= 30) startTransition("about");
        }
        return;
      }
      if (phaseRef.current === "about" && aboutSection) {
        if (e.deltaY < 0) {
          const aRect = aboutSection.getBoundingClientRect();
          const sectionScrolled = -(aRect.top - HEADER_H);
          if (sectionScrolled <= 5) {
            e.preventDefault();
            if (isCooldown) return;
            if (Math.abs(e.deltaY) >= 30) startTransition("clubs");
          }
        } else if (e.deltaY > 0) {
          const aRect = aboutSection.getBoundingClientRect();
          const sectionScrolled = -(aRect.top - HEADER_H);
          if (sectionScrolled >= getAboutEventsTriggerPoint(aboutSection)) {
            e.preventDefault();
            if (isCooldown) return;
            if (Math.abs(e.deltaY) >= 30) startTransition("events");
          }
        }
        return;
      }
      if (phaseRef.current === "events" && eventsSection) {
        if (e.deltaY > 0) {
          const eRect = eventsSection.getBoundingClientRect();
          const sectionScrolled = -(eRect.top - HEADER_H);
          const triggerPoint = getEventsGalleryTriggerPoint(eventsSection);
          if (sectionScrolled >= triggerPoint) {
            e.preventDefault();
            if (isCooldown) return;
            if (Math.abs(e.deltaY) >= 30) startGalleryTransition();
          }
          return;
        }

        if (e.deltaY < 0) {
          const eRect = eventsSection.getBoundingClientRect();
          const sectionScrolled = -(eRect.top - HEADER_H);
          if (sectionScrolled <= 5) {
            e.preventDefault();
            if (isCooldown) return;
            if (Math.abs(e.deltaY) >= 30) startTransition("about");
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

      if (releaseEventsHandoff(deltaY)) return;

      if (handleEventsGalleryHandoff(deltaY)) {
        e.preventDefault();
        touchStartRef.current = null;
        return;
      }

      if (phaseRef.current === "events" && deltaY > 0) return;
      if (phaseRef.current === "events" && isBelowEventsStart()) return;

      if (
        phaseRef.current === "animating" ||
        phaseRef.current === "zooming" ||
        phaseRef.current === "zoomed"
      ) {
        e.preventDefault();
        return;
      }

      // Snapping transition cooldown
      const isCooldown = performance.now() - lastTransitionTimeRef.current < 700;

      const clubsSection = document.getElementById("clubs");
      const aboutSection = document.getElementById("about");
      const eventsSection = document.getElementById("events");
      if (!clubsSection) return;
      const clubsAbsTop =
        clubsSection.getBoundingClientRect().top + window.scrollY;
      const clubsScrollY = clubsAbsTop - HEADER_H;

      if (deltaY > 0 && phaseRef.current === "hero") {
        e.preventDefault();
        if (isCooldown) return;
        if (Math.abs(deltaY) >= 40) {
          startTransition("clubs");
          touchStartRef.current = null;
        }
      } else if (phaseRef.current === "clubs") {
        if (deltaY < 0) {
          if (window.scrollY <= clubsScrollY + 15) {
            e.preventDefault();
            if (isCooldown) return;
            if (Math.abs(deltaY) >= 40) {
              startTransition("hero");
              touchStartRef.current = null;
            }
          }
        } else if (deltaY > 0) {
          e.preventDefault();
          if (isCooldown) return;
          if (Math.abs(deltaY) >= 40) {
            startTransition("about");
            touchStartRef.current = null;
          }
        }
      } else if (phaseRef.current === "about" && aboutSection) {
        const aRect = aboutSection.getBoundingClientRect();
        const sectionScrolled = -(aRect.top - HEADER_H);
        if (deltaY < 0) {
          if (sectionScrolled <= 5) {
            e.preventDefault();
            if (isCooldown) return;
            if (Math.abs(deltaY) >= 40) {
              startTransition("clubs");
              touchStartRef.current = null;
            }
          }
        } else if (deltaY > 0) {
          if (sectionScrolled >= getAboutEventsTriggerPoint(aboutSection)) {
            e.preventDefault();
            if (isCooldown) return;
            if (Math.abs(deltaY) >= 40) {
              startTransition("events");
              touchStartRef.current = null;
            }
          }
        }
      } else if (phaseRef.current === "events" && eventsSection) {
        if (deltaY > 0) {
          const eRect = eventsSection.getBoundingClientRect();
          const sectionScrolled = -(eRect.top - HEADER_H);
          const triggerPoint = getEventsGalleryTriggerPoint(eventsSection);
          if (sectionScrolled >= triggerPoint) {
            e.preventDefault();
            if (isCooldown) return;
            if (Math.abs(deltaY) >= 40) {
              startGalleryTransition();
              touchStartRef.current = null;
            }
          }
          return;
        }

        if (deltaY < 0) {
          const eRect = eventsSection.getBoundingClientRect();
          const sectionScrolled = -(eRect.top - HEADER_H);
          if (sectionScrolled <= 5) {
            e.preventDefault();
            if (isCooldown) return;
            if (Math.abs(deltaY) >= 40) {
              startTransition("about");
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
      window.removeEventListener(
        "mousewheel",
        handleWheel as EventListener,
        opts,
      );
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove, opts);
    };
  }, [startTransition]);

  /* ═══ FLAWLESS SCROLL OBSERVER FOR ABOUT SECTION ═══ */
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

  return (
    <div className="home-scroll-experience bg-bg">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes flicker-in { 0% { opacity: 0; } 10% { opacity: 0.4; } 15% { opacity: 0.1; } 25% { opacity: 0.85; } 35% { opacity: 0.2; } 50% { opacity: 0.95; } 60% { opacity: 0.45; } 70% { opacity: 0.8; } 80% { opacity: 0.6; } 90% { opacity: 0.9; } 100% { opacity: 1; } }
            @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(16px); } 100% { opacity: 1; transform: translateY(0); } }
            @keyframes slide-in-card { 0% { opacity: 0; transform: translateX(-80px); } 100% { opacity: 1; transform: translateX(0); } }
            .animate-flicker-in { animation: flicker-in 1.4s ease-out forwards; }
            .animate-fade-in-delayed { opacity: 0; animation: fade-in-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: 1.4s; }
            .animate-slide-in-card { animation: slide-in-card 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            .text-carved-dark { color: rgba(255, 255, 255, 0.9); text-shadow: -1px -1px 0.5px rgba(0, 0, 0, 0.9), 1px 1px 0.5px rgba(255, 255, 255, 0.15); }
            .text-carved-light { color: rgba(1, 31, 91, 0.9); text-shadow: -1px -1px 0.5px rgba(0, 0, 0, 0.3), 1px 1px 0.5px rgba(255, 255, 255, 0.6); }
            .metallic-card { position: relative; overflow: hidden; transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.45s cubic-bezier(0.16, 1, 0.3, 1); }
            .metallic-card::before { content: ""; position: absolute; top: 0; left: -150%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0) 10%, rgba(255, 255, 255, 0.08) 35%, rgba(255, 255, 255, 0.18) 50%, rgba(255, 255, 255, 0.08) 65%, rgba(255, 255, 255, 0) 90%, transparent); transform: skewX(-25deg); transition: left 0.85s cubic-bezier(0.25, 1, 0.5, 1); pointer-events: none; z-index: 10; }
            .metallic-card:hover::before { left: 150%; }
            .metallic-card-gold { border: 1px solid rgba(255, 255, 255, 0.45); box-shadow: inset 0 1.5px 0.5px rgba(255, 255, 255, 0.5), inset 0 -1.5px 1px rgba(0, 0, 0, 0.12), 0 12px 28px -4px rgba(0, 0, 0, 0.15), 0 20px 40px -15px rgba(212, 163, 115, 0.25); }
            .metallic-card-standard { border: 1px solid rgba(255, 255, 255, 0.18); box-shadow: inset 0 1.5px 0.5px rgba(255, 255, 255, 0.22), inset 0 -1.5px 1px rgba(0, 0, 0, 0.3), 0 12px 28px -4px rgba(0, 0, 0, 0.25); }
            @keyframes projector-flicker { 0%, 100% { opacity: 0.85; } 5% { opacity: 0.70; } 10% { opacity: 0.90; } 17% { opacity: 0.75; } 25% { opacity: 0.95; } 30% { opacity: 0.80; } 45% { opacity: 0.98; } 55% { opacity: 0.82; } 68% { opacity: 0.90; } 75% { opacity: 0.78; } 85% { opacity: 0.95; } 92% { opacity: 0.85; } }
            .projector-beam { animation: projector-flicker 4s ease-in-out infinite; mix-blend-mode: screen; transform-origin: left center; transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
            @keyframes edge-glow { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
            .projector-edge-line { animation: edge-glow 2s ease-in-out infinite; }
            .about-panel-active { opacity: 1; transform: translateY(0) scale(1); transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1); }
            .about-panel-inactive { opacity: 0.08; transform: translateY(20px) scale(0.97); transition: opacity 0.5s ease-out, transform 0.5s ease-out; }
            @keyframes about-heading-glow { 0%, 100% { text-shadow: 0 0 18px rgba(212, 163, 115, 0.34), 0 0 28px rgba(2, 59, 142, 0.22); } 50% { text-shadow: 0 0 26px rgba(212, 163, 115, 0.58), 0 0 42px rgba(2, 59, 142, 0.32); } }
            .about-heading-glow { animation: about-heading-glow 3s ease-in-out infinite; }
          `,
        }}
      />

      <div className="[&_.hero-atom-origin]:invisible">
        <Hero />
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
              {CLUBS_DETAILS.map((club) => {
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
        className="about-solar-section"
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

        <style dangerouslySetInnerHTML={{ __html: `
          /* ═══════════════════════════════════════════════════════════
             ABOUT SOLAR SECTION — ALL STYLES SCOPED TO #about
          ════════════════════════════════════════════════════════════ */
          #about.about-solar-section {
            position: relative; overflow: hidden; background: #f8fafc;
            padding: 100px 0 80px;
          }

          /* ── Sun anchor for canvas morph target ── */
          #about .about-sun-anchor {
            width: 110px; height: 110px;
            top: 100px; left: 50%;
            transform: translateX(-50%);
          }
          @media (min-width: 769px) {
            #about .about-sun-anchor {
              /* Align with the center column sun sphere on desktop */
              top: 220px;
            }
          }

          /* ── Title ── */
          #about .as-title { text-align: center; margin: 0 auto 60px; max-width: 800px; padding: 0 24px; }
          #about .as-title h2 {
            font-size: clamp(36px, 5vw, 52px); font-weight: 900;
            color: #0d2460; line-height: 1.1; margin: 0; letter-spacing: -0.02em;
          }
          #about .as-title h2 em { font-style: italic; color: #c8903a; }
          #about .as-subtitle { margin-top: 16px; font-size: 14px; color: #94a3b8; line-height: 1.6; }

          /* ── Desktop Base / Unrevealed States (Fly back to sun, glow fades back in) ── */
          #about .solar-desktop .orbit-line-h {
            opacity: 0; transform: scaleX(0);
            transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s, opacity 0.8s ease 0.3s;
          }
          #about .solar-desktop .p-sun {
            opacity: 0; transform: scale(0);
            transition: transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s, opacity 0.5s ease 0.4s;
          }
          #about .solar-desktop .p-sun::after {
            opacity: 1; filter: drop-shadow(0 0 16px #D4A373);
            transition: opacity 0.7s ease 0.4s;
          }
          #about .solar-desktop .as-card {
            opacity: 0; transform: translateY(24px);
            transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease;
          }

          /* Left Planets Base Transitions (Reverse delays) */
          #about .solar-desktop .p-mercury {
            --burst-x: 160px;
            opacity: 0; transform: translate(var(--burst-x), 0) scale(0);
            transition: transform 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s, opacity 0.5s ease 0.3s;
          }
          #about .solar-desktop .p-mercury::after {
            opacity: 1; transform: scale(1.15); filter: drop-shadow(0 0 14px #00d2ff);
            transition: opacity 0.75s ease 0.3s, transform 0.75s ease 0.3s;
          }
          #about .solar-desktop .p-venus {
            --burst-x: 220px;
            opacity: 0; transform: translate(var(--burst-x), 0) scale(0);
            transition: transform 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s, opacity 0.5s ease 0.2s;
          }
          #about .solar-desktop .p-venus::after {
            opacity: 1; transform: scale(1.15); filter: drop-shadow(0 0 14px #00d2ff);
            transition: opacity 0.75s ease 0.2s, transform 0.75s ease 0.2s;
          }
          #about .solar-desktop .p-earth {
            --burst-x: 280px;
            opacity: 0; transform: translate(var(--burst-x), 0) scale(0);
            transition: transform 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s, opacity 0.5s ease 0.1s;
          }
          #about .solar-desktop .p-earth::after {
            opacity: 1; transform: scale(1.15); filter: drop-shadow(0 0 14px #00d2ff);
            transition: opacity 0.75s ease 0.1s, transform 0.75s ease 0.1s;
          }

          /* Right Planets Base Transitions (Reverse delays) */
          #about .solar-desktop .p-mars {
            --burst-x: -160px;
            opacity: 0; transform: translate(var(--burst-x), 0) scale(0);
            transition: transform 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 0.35s, opacity 0.5s ease 0.35s;
          }
          #about .solar-desktop .p-mars::after {
            opacity: 1; transform: scale(1.15); filter: drop-shadow(0 0 14px #00d2ff);
            transition: opacity 0.75s ease 0.35s, transform 0.75s ease 0.35s;
          }
          #about .solar-desktop .p-jupiter {
            --burst-x: -220px;
            opacity: 0; transform: translate(var(--burst-x), 0) scale(0);
            transition: transform 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 0.25s, opacity 0.5s ease 0.25s;
          }
          #about .solar-desktop .p-jupiter::after {
            opacity: 1; transform: scale(1.15); filter: drop-shadow(0 0 14px #00d2ff);
            transition: opacity 0.75s ease 0.25s, transform 0.75s ease 0.25s;
          }
          #about .solar-desktop .p-saturn-wrap {
            --burst-x: -280px;
            opacity: 0; transform: translate(var(--burst-x), 0) scale(0);
            transition: transform 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s, opacity 0.5s ease 0.15s;
          }
          #about .solar-desktop .p-saturn-wrap::after {
            opacity: 1; transform: scale(1.15); filter: drop-shadow(0 0 14px #00d2ff);
            transition: opacity 0.75s ease 0.15s, transform 0.75s ease 0.15s;
          }

          /* ── Exhaled State (ghost planets carry the travel motion) ── */
          #about.exhaled .solar-desktop .p-mercury,
          #about.exhaled .solar-desktop .p-venus,
          #about.exhaled .solar-desktop .p-earth,
          #about.exhaled .solar-desktop .p-sun,
          #about.exhaled .solar-desktop .p-mars,
          #about.exhaled .solar-desktop .p-jupiter,
          #about.exhaled .solar-desktop .p-saturn-wrap,
          #about.exhaled .solar-desktop .p-neptune {
            opacity: 0;
            transform: none;
            transition: opacity 0.2s ease;
          }

          #about.exhaled .solar-mobile .mob-sun,
          #about.exhaled .solar-mobile .mob-dot {
            opacity: 0;
            transform: none;
            transition: opacity 0.2s ease;
          }

          #about.exhaled .solar-mobile .mob-card {
            opacity: 0;
            transform: translateY(40px) scale(0.85);
            transition: transform 0.65s ease-out, opacity 0.55s ease;
          }
          #about.exhaled .solar-mobile .mob-card[data-node="0"] { transition-delay: 0.06s; }
          #about.exhaled .solar-mobile .mob-card[data-node="1"] { transition-delay: 0.12s; }
          #about.exhaled .solar-mobile .mob-card[data-node="2"] { transition-delay: 0.18s; }

          /* ── Mobile Base / Unrevealed States (Reverse delays) ── */
          #about .solar-mobile .mob-spine {
            opacity: 0; transform: scaleY(0); transform-origin: top;
            transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease;
          }
          #about .solar-mobile .mob-sun {
            opacity: 0; transform: scale(0);
            transition: transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s, opacity 0.5s ease 0.8s;
          }
          #about .solar-mobile .mob-sun::after {
            opacity: 1; filter: drop-shadow(0 0 16px #D4A373);
            transition: opacity 0.8s ease 0.8s;
          }
          #about .solar-mobile .mob-sun + .mob-connector {
            opacity: 0; transform: scaleY(0); transform-origin: top;
            transition: transform 0.5s ease 0.75s, opacity 0.5s ease 0.75s;
          }
          #about .solar-mobile .mob-card[data-node="0"] {
            opacity: 0; transform: scale(0.85) translateY(24px);
            transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.7s, opacity 0.7s ease 0.7s;
          }
          #about .solar-mobile .mob-card[data-node="0"] + .mob-connector {
            opacity: 0; transform: scaleY(0); transform-origin: top;
            transition: transform 0.5s ease 0.55s, opacity 0.5s ease 0.55s;
          }
          #about .solar-mobile .mob-dot-earth {
            opacity: 0; transform: scale(0);
            transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s, opacity 0.6s ease 0.5s;
          }
          #about .solar-mobile .mob-dot-earth::after {
            opacity: 1; transform: scale(1.15); filter: drop-shadow(0 0 14px #00d2ff);
            transition: opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s;
          }
          #about .solar-mobile .mob-dot-earth + .mob-connector {
            opacity: 0; transform: scaleY(0); transform-origin: top;
            transition: transform 0.5s ease 0.45s, opacity 0.5s ease 0.45s;
          }
          #about .solar-mobile .mob-card[data-node="1"] {
            opacity: 0; transform: scale(0.85) translateY(24px);
            transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.4s, opacity 0.7s ease 0.4s;
          }
          #about .solar-mobile .mob-card[data-node="1"] + .mob-connector {
            opacity: 0; transform: scaleY(0); transform-origin: top;
            transition: transform 0.5s ease 0.25s, opacity 0.5s ease 0.25s;
          }
          #about .solar-mobile .mob-dot-jupiter {
            opacity: 0; transform: scale(0);
            transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s, opacity 0.6s ease 0.2s;
          }
          #about .solar-mobile .mob-dot-jupiter::after {
            opacity: 1; transform: scale(1.15); filter: drop-shadow(0 0 14px #00d2ff);
            transition: opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s;
          }
          #about .solar-mobile .mob-dot-jupiter + .mob-connector {
            opacity: 0; transform: scaleY(0); transform-origin: top;
            transition: transform 0.5s ease 0.15s, opacity 0.5s ease 0.15s;
          }
          #about .solar-mobile .mob-card[data-node="2"] {
            opacity: 0; transform: scale(0.85) translateY(24px);
            transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.7s ease;
          }

          /* ── Relative positioning helpers for pseudo overlays ── */
          #about .p-sphere { position: relative; }
          #about .mob-dot { position: relative; }

          #about .p-sphere::after,
          #about .p-saturn-wrap::after,
          #about .mob-sun::after,
          #about .mob-dot::after {
            content: ''; position: absolute; inset: 0; border-radius: 50%;
            pointer-events: none; opacity: 0; z-index: 10;
          }
          #about .p-saturn-wrap::after {
            width: 70px; height: 70px; top: 0; left: 0;
          }
          #about .p-sphere::after,
          #about .p-saturn-wrap::after,
          #about .mob-dot::after {
            background: radial-gradient(circle at 35% 35%, #ffffff 0%, #00d2ff 45%, rgba(2, 59, 142, 0.8) 75%, transparent 100%);
          }
          #about .p-sun::after,
          #about .mob-sun::after {
            background: radial-gradient(circle at 38% 38%, #fff7d4 0%, #ffd54f 25%, #d4a373 60%, #a06800 100%);
          }

          /* ── Desktop Revealed States (Forward delays) ── */
          #about.revealed .solar-desktop .orbit-line-h {
            opacity: 0.14; transform: scaleX(1);
            transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s, opacity 1.2s ease 0.3s;
          }
          #about.revealed .solar-desktop .p-sun {
            opacity: 1; transform: scale(1);
            transition: transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s, opacity 0.5s ease 0.05s;
          }
          #about.revealed .solar-desktop .p-sun::after {
            opacity: 0; filter: drop-shadow(0 0 0px transparent);
            transition: opacity 0.8s ease 0.05s;
          }
          #about.revealed .solar-desktop .as-card {
            opacity: 1; transform: translateY(0);
            transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s, opacity 0.8s ease 0.5s;
          }

          /* Left Planets Revealed Transitions (Forward delays) */
          #about.revealed .solar-desktop .p-mercury {
            opacity: 1; transform: translate(0, 0) scale(1);
            transition: transform 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s, opacity 0.5s ease 0.15s;
          }
          #about.revealed .solar-desktop .p-mercury::after {
            opacity: 0; transform: scale(1); filter: drop-shadow(0 0 0px transparent);
            transition: opacity 0.75s ease 0.15s, transform 0.75s ease 0.15s;
          }
          #about.revealed .solar-desktop .p-venus {
            opacity: 1; transform: translate(0, 0) scale(1);
            transition: transform 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 0.25s, opacity 0.5s ease 0.25s;
          }
          #about.revealed .solar-desktop .p-venus::after {
            opacity: 0; transform: scale(1); filter: drop-shadow(0 0 0px transparent);
            transition: opacity 0.75s ease 0.25s, transform 0.75s ease 0.25s;
          }
          #about.revealed .solar-desktop .p-earth {
            opacity: 1; transform: translate(0, 0) scale(1);
            transition: transform 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 0.35s, opacity 0.5s ease 0.35s;
          }
          #about.revealed .solar-desktop .p-earth::after {
            opacity: 0; transform: scale(1); filter: drop-shadow(0 0 0px transparent);
            transition: opacity 0.75s ease 0.35s, transform 0.75s ease 0.35s;
          }

          /* Right Planets Revealed Transitions (Forward delays) */
          #about.revealed .solar-desktop .p-mars {
            opacity: 1; transform: translate(0, 0) scale(1);
            transition: transform 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s, opacity 0.5s ease 0.2s;
          }
          #about.revealed .solar-desktop .p-mars::after {
            opacity: 0; transform: scale(1); filter: drop-shadow(0 0 0px transparent);
            transition: opacity 0.75s ease 0.2s, transform 0.75s ease 0.2s;
          }
          #about.revealed .solar-desktop .p-jupiter {
            opacity: 1; transform: translate(0, 0) scale(1);
            transition: transform 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s, opacity 0.5s ease 0.3s;
          }
          #about.revealed .solar-desktop .p-jupiter::after {
            opacity: 0; transform: scale(1); filter: drop-shadow(0 0 0px transparent);
            transition: opacity 0.75s ease 0.3s, transform 0.75s ease 0.3s;
          }
          #about.revealed .solar-desktop .p-saturn-wrap {
            opacity: 1; transform: translate(0, 0) scale(1);
            transition: transform 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s, opacity 0.5s ease 0.4s;
          }
          #about.revealed .solar-desktop .p-saturn-wrap::after {
            opacity: 0; transform: scale(1); filter: drop-shadow(0 0 0px transparent);
            transition: opacity 0.75s ease 0.4s, transform 0.75s ease 0.4s;
          }
          #about.revealed .solar-desktop .p-neptune {
            opacity: 1; transform: translate(0, 0) scale(1);
            transition: transform 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 0.45s, opacity 0.5s ease 0.45s;
          }
          #about.revealed .solar-desktop .p-neptune::after {
            opacity: 0; transform: scale(1); filter: drop-shadow(0 0 0px transparent);
            transition: opacity 0.75s ease 0.45s, transform 0.75s ease 0.45s;
          }

          /* ── Mobile Revealed States (Forward delays) ── */
          #about.revealed .solar-mobile .mob-spine {
            opacity: 1; transform: scaleY(1); transform-origin: top;
            transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.2s ease;
          }
          #about.revealed .solar-mobile .mob-sun {
            opacity: 1; transform: scale(1);
            transition: transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease;
          }
          #about.revealed .solar-mobile .mob-sun::after {
            opacity: 0; filter: drop-shadow(0 0 0px transparent);
            transition: opacity 0.8s ease;
          }
          #about.revealed .solar-mobile .mob-sun + .mob-connector {
            opacity: 1; transform: scaleY(1); transform-origin: top;
            transition: transform 0.5s ease 0.15s, opacity 0.5s ease 0.15s;
          }
          #about.revealed .solar-mobile .mob-card[data-node="0"] {
            opacity: 1; transform: scale(1) translateY(0);
            transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s, opacity 0.7s ease 0.2s;
          }
          #about.revealed .solar-mobile .mob-card[data-node="0"] + .mob-connector {
            opacity: 1; transform: scaleY(1); transform-origin: top;
            transition: transform 0.5s ease 0.35s, opacity 0.5s ease 0.35s;
          }
          #about.revealed .solar-mobile .mob-dot-earth {
            opacity: 1; transform: scale(1);
            transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s, opacity 0.6s ease 0.4s;
          }
          #about.revealed .solar-mobile .mob-dot-earth::after {
            opacity: 0; transform: scale(1); filter: drop-shadow(0 0 0px transparent);
            transition: opacity 0.6s ease 0.4s, transform 0.6s ease 0.4s;
          }
          #about.revealed .solar-mobile .mob-dot-earth + .mob-connector {
            opacity: 1; transform: scaleY(1); transform-origin: top;
            transition: transform 0.5s ease 0.45s, opacity 0.5s ease 0.45s;
          }
          #about.revealed .solar-mobile .mob-card[data-node="1"] {
            opacity: 1; transform: scale(1) translateY(0);
            transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.5s, opacity 0.7s ease 0.5s;
          }
          #about.revealed .solar-mobile .mob-card[data-node="1"] + .mob-connector {
            opacity: 1; transform: scaleY(1); transform-origin: top;
            transition: transform 0.5s ease 0.65s, opacity 0.5s ease 0.65s;
          }
          #about.revealed .solar-mobile .mob-dot-jupiter {
            opacity: 1; transform: scale(1);
            transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.7s, opacity 0.6s ease 0.7s;
          }
          #about.revealed .solar-mobile .mob-dot-jupiter::after {
            opacity: 0; transform: scale(1); filter: drop-shadow(0 0 0px transparent);
            transition: opacity 0.6s ease 0.7s, transform 0.6s ease 0.7s;
          }
          #about.revealed .solar-mobile .mob-dot-jupiter + .mob-connector {
            opacity: 1; transform: scaleY(1); transform-origin: top;
            transition: transform 0.5s ease 0.75s, opacity 0.5s ease 0.75s;
          }
          #about.revealed .solar-mobile .mob-card[data-node="2"] {
            opacity: 1; transform: scale(1) translateY(0);
            transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.8s, opacity 0.7s ease 0.8s;
          }

          /* ── Desktop Solar System ── */
          #about .solar-desktop {
            display: grid; position: relative; max-width: 1400px;
            margin: 0 auto; padding: 0 32px;
            grid-template-columns: 1fr 1.4fr 1fr;
            gap: 32px; align-items: start;
          }
          #about .solar-mobile { display: none; }

          /* ── Orbit Line (single horizontal line through all planets) ── */
          #about .orbit-line-h {
            position: absolute; top: 56px; left: 6%; right: 6%;
            height: 1.5px; opacity: 0.14; pointer-events: none; z-index: 0;
            background: linear-gradient(to right, transparent 0%, #0d2460 6%, #0d2460 94%, transparent 100%);
          }

          /* ── Planet Columns ── */
          #about .p-col {
            display: flex; flex-direction: column;
            align-items: stretch; position: relative; z-index: 1;
          }
          #about .p-col-sun { align-items: center; }

          /* ── Planet Zone (fixed height aligns card tops) ── */
          #about .p-zone {
            display: flex; flex-direction: row; align-items: center;
            justify-content: center; gap: 18px;
            min-height: 140px; width: 100%;
          }
          /* Center column has no planet row — sun only */
          #about .p-col-sun .p-zone { flex-direction: column; gap: 0; }

          /* ── Planet Spheres (3D radial gradient) ── */
          #about .p-sphere { border-radius: 50%; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.12); }

          #about .p-mercury {
            width: 38px; height: 38px;
            background: radial-gradient(circle at 35% 35%, #c7d3e3 0%, #8a9db8 40%, #5d6e85 75%, #3a4a5c 100%);
          }
          #about .p-venus {
            width: 54px; height: 54px;
            background: radial-gradient(circle at 35% 35%, #fce0b0 0%, #e8a952 40%, #c47b2a 75%, #8a4e10 100%);
          }
          #about .p-earth {
            width: 60px; height: 60px;
            background: radial-gradient(circle at 35% 35%, #7ec8e3 0%, #3e8fb0 35%, #1a8b57 65%, #0d4b3e 100%);
          }
          #about .p-sun {
            width: 110px; height: 110px; margin-top: 0;
            background: radial-gradient(circle at 38% 38%, #fff7d4 0%, #ffd54f 25%, #ffab00 50%, #e65100 80%, #bf360c 100%);
            box-shadow: 0 0 0 5px rgba(255,171,0,0.15), 0 0 0 12px rgba(255,171,0,0.08), 0 0 36px rgba(255,171,0,0.22);
          }
          #about .p-mars {
            width: 48px; height: 48px;
            background: radial-gradient(circle at 35% 35%, #e8a89a 0%, #c97a6a 40%, #9a4a3a 75%, #6a2a1c 100%);
          }
          #about .p-jupiter {
            width: 84px; height: 84px;
            background: radial-gradient(circle at 35% 35%, #f0c88a 0%, #d4924c 35%, #a0603a 65%, #6d3a25 100%);
          }
          #about .p-saturn-wrap { position: relative; }
          #about .p-saturn {
            width: 70px; height: 70px;
            background: radial-gradient(circle at 35% 35%, #f5e6c8 0%, #c9a96e 40%, #9e7c4a 70%, #6b5030 100%);
          }
          #about .p-saturn-ring {
            position: absolute; top: 50%; left: 50%;
            transform: translate(-50%, -50%) rotateX(70deg);
            width: 104px; height: 30px;
            border: 2px solid rgba(201,169,110,0.3); border-radius: 50%;
            pointer-events: none; box-shadow: 0 2px 6px rgba(107,80,48,0.1);
          }
          #about .p-neptune {
            width: 62px; height: 62px;
            background: radial-gradient(circle at 35% 35%, #7bb8e0 0%, #4a82c7 40%, #2a4fa0 70%, #1a3070 100%);
          }

          /* ── Connectors (sun → president card only; side cards have no connector) ── */
          #about .p-connector {
            width: 1px; height: 36px;
            background: linear-gradient(to bottom, rgba(13,36,96,0.22) 0%, rgba(13,36,96,0) 100%);
          }

          /* ── Cards (expanded) ── */
          #about .as-card {
            width: 100%; border-radius: 18px; padding: 32px 30px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          #about .as-card:hover { transform: translateY(-2px); }
          #about .as-card-dark {
            background: #1a3378; color: #fff;
            box-shadow: 0 4px 20px rgba(13,36,96,0.15);
          }
          #about .as-card-dark:hover { box-shadow: 0 8px 30px rgba(13,36,96,0.25); }
          #about .as-card-light {
            background: #fff; color: #0d2460;
            border: 1.5px solid #c8903a;
            box-shadow: 0 4px 20px rgba(200,144,58,0.1);
          }
          #about .as-card-light:hover { box-shadow: 0 8px 30px rgba(200,144,58,0.18); }

          #about .as-card-cat { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
          #about .as-card-cat-icon { width: 16px; height: 16px; }
          #about .as-card-dark .as-card-cat-icon { color: rgba(255,255,255,0.55); }
          #about .as-card-light .as-card-cat-icon { color: rgba(13,36,96,0.5); }
          #about .as-card-cat-label {
            font-size: 11px; font-weight: 700; letter-spacing: 0.18em;
            text-transform: uppercase;
          }
          #about .as-card-dark .as-card-cat-label { color: rgba(255,255,255,0.5); }
          #about .as-card-light .as-card-cat-label { color: rgba(13,36,96,0.5); }

          #about .as-card h3 {
            font-size: 26px; font-weight: 900; margin: 0 0 14px;
            line-height: 1.18; letter-spacing: -0.015em;
          }
          #about .as-card-dark h3 { color: rgba(255,255,255,0.95); }
          #about .as-card-light h3 { color: #0d2460; }

          #about .as-card-body {
            font-size: 15px; line-height: 1.7; margin: 0;
          }
          #about .as-card-dark .as-card-body { color: rgba(255,255,255,0.72); }
          #about .as-card-light .as-card-body { color: #475569; }

          #about .as-card-stats {
            display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
            margin-top: 22px; padding-top: 18px;
          }
          #about .as-card-dark .as-card-stats { border-top: 1px solid rgba(255,255,255,0.1); }
          #about .as-card-light .as-card-stats { border-top: 1px solid rgba(0,0,0,0.08); }
          #about .as-stat-label {
            font-size: 10px; text-transform: uppercase;
            letter-spacing: 0.12em; font-weight: 600;
          }
          #about .as-card-dark .as-stat-label { color: rgba(255,255,255,0.4); }
          #about .as-card-light .as-stat-label { color: rgba(13,36,96,0.4); }
          #about .as-stat-value { font-size: 22px; font-weight: 900; margin-top: 4px; }
          #about .as-card-dark .as-stat-value { color: #fff; }
          #about .as-card-light .as-stat-value { color: #0d2460; }

          /* ── President Card Specifics ── */
          #about .as-pres-photo {
            width: 88px; height: 88px; border-radius: 50%; overflow: hidden;
            border: 3px solid rgba(200,144,58,0.3); margin: 6px auto 14px;
            flex-shrink: 0;
          }
          #about .as-pres-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
          #about .as-pres-quote {
            font-style: italic; text-align: center;
            font-size: 15px; line-height: 1.7; color: #475569;
            margin: 8px 0 0;
          }
          #about .as-pres-footer {
            text-align: center; font-size: 10px; font-weight: 700;
            text-transform: uppercase; letter-spacing: 0.18em;
            color: rgba(13,36,96,0.5); margin-top: 16px; padding-top: 12px;
            border-top: 1px solid rgba(0,0,0,0.08);
          }

          /* ── Legacy Stats ── */
          #about .as-legacy { max-width: 1280px; margin: 60px auto 0; padding: 0 32px; }
          #about .as-legacy-inner {
            background: #0d2460; border-radius: 20px; padding: 36px 32px;
            border: 1px solid rgba(212,163,115,0.2);
            box-shadow: 0 8px 30px rgba(13,36,96,0.15);
          }
          #about .as-legacy-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; text-align: center; }
          #about .as-legacy-val { font-size: clamp(24px, 3vw, 36px); font-weight: 900; color: #c8903a; }
          #about .as-legacy-label {
            font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em;
            color: rgba(255,255,255,0.55); font-weight: 600; margin-top: 6px;
          }

          /* ═══════════════════════════════════════════════════════════
             SMALL MOBILE — max-width: 480px
          ════════════════════════════════════════════════════════════ */
          @media (max-width: 480px) {
            #about.about-solar-section { padding: 48px 16px 60px; }
            #about .as-title { margin-bottom: 32px; padding: 0 12px; }
            #about .as-title h2 { font-size: 24px; }
            #about .as-subtitle { font-size: 12px; }
            #about .solar-desktop { display: none; }
            #about .solar-mobile {
              display: flex; flex-direction: column; align-items: center;
              position: relative; max-width: 100%; margin: 0 auto;
              padding: 0;
            }
            #about .mob-spine {
              position: absolute; top: 0; bottom: 0; left: 50%; width: 1px;
              background: linear-gradient(to bottom, transparent 0%, rgba(13,36,96,0.1) 8%, rgba(13,36,96,0.1) 92%, transparent 100%);
              transform: translateX(-50%); z-index: 0;
            }
            #about .mob-sun {
              width: 52px; height: 52px; border-radius: 50%; flex-shrink: 0;
              background: radial-gradient(circle at 38% 38%, #fff7d4 0%, #ffd54f 25%, #ffab00 50%, #e65100 80%, #bf360c 100%);
              box-shadow: 0 0 0 3px rgba(255,171,0,0.15), 0 0 0 7px rgba(255,171,0,0.08), 0 0 16px rgba(255,171,0,0.2);
              position: relative; z-index: 1;
            }
            #about .mob-dot-earth {
              background: radial-gradient(circle at 35% 35%, #7ec8e3 0%, #3e8fb0 50%, #0d4b3e 100%);
            }
            #about .mob-dot-jupiter {
              background: radial-gradient(circle at 35% 35%, #f0c88a 0%, #d4924c 50%, #6d3a25 100%);
            }
            #about .mob-card-gap { display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%; }
            #about .mob-connector {
              width: 1px; height: 28px; flex-shrink: 0; z-index: 1;
              background: linear-gradient(to bottom, rgba(13,36,96,0.15) 0%, rgba(13,36,96,0) 100%);
            }
            #about .mob-dot {
              width: 16px; height: 16px; border-radius: 50%;
              flex-shrink: 0; z-index: 1; box-shadow: 0 1px 4px rgba(0,0,0,0.1);
            }
            #about .mob-card {
              width: 100%; border-radius: 12px !important; padding: 16px !important;
            }
            #about .as-card h3 { font-size: 18px; margin-bottom: 10px; }
            #about .as-card-body { font-size: 13px; line-height: 1.6; }
            #about .as-card-stats { gap: 8px; margin-top: 16px; padding-top: 14px; }
            #about .as-stat-value { font-size: 18px; }
            #about .as-stat-label { font-size: 9px; }
            #about .as-pres-photo { width: 64px; height: 64px; }
            #about .as-pres-quote { font-size: 13px; }
            #about .as-legacy { margin-top: 32px; padding: 0; }
            #about .as-legacy-inner { padding: 22px 16px; border-radius: 14px; }
            #about .as-legacy-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
            #about .as-legacy-val { font-size: 20px; }
            #about .as-legacy-label { font-size: 9px; }
            #about .about-sun-anchor { width: 52px; height: 52px; top: 80px; }
          }

          /* ═══════════════════════════════════════════════════════════
             MOBILE — 481px to 768px
          ════════════════════════════════════════════════════════════ */
          @media (min-width: 481px) and (max-width: 768px) {
            #about.about-solar-section { padding: 60px 20px; }
            #about .as-title { margin-bottom: 40px; }
            #about .as-title h2 { font-size: 28px; }
            #about .solar-desktop { display: none; }
            #about .solar-mobile {
              display: flex; flex-direction: column; align-items: center;
              position: relative; max-width: 560px; margin: 0 auto;
            }
            #about .mob-spine {
              position: absolute; top: 0; bottom: 0; left: 50%; width: 1px;
              background: linear-gradient(to bottom, transparent 0%, rgba(13,36,96,0.1) 8%, rgba(13,36,96,0.1) 92%, transparent 100%);
              transform: translateX(-50%); z-index: 0;
            }
            #about .mob-sun {
              width: 64px; height: 64px; border-radius: 50%; flex-shrink: 0;
              background: radial-gradient(circle at 38% 38%, #fff7d4 0%, #ffd54f 25%, #ffab00 50%, #e65100 80%, #bf360c 100%);
              box-shadow: 0 0 0 3px rgba(255,171,0,0.15), 0 0 0 7px rgba(255,171,0,0.08), 0 0 20px rgba(255,171,0,0.2);
              position: relative; z-index: 1;
            }
            #about .mob-connector {
              width: 1px; height: 40px; flex-shrink: 0; z-index: 1;
              background: linear-gradient(to bottom, rgba(13,36,96,0.15) 0%, rgba(13,36,96,0) 100%);
            }
            #about .mob-dot {
              width: 20px; height: 20px; border-radius: 50%;
              flex-shrink: 0; z-index: 1; box-shadow: 0 1px 4px rgba(0,0,0,0.1);
            }
            #about .mob-dot-earth {
              background: radial-gradient(circle at 35% 35%, #7ec8e3 0%, #3e8fb0 50%, #0d4b3e 100%);
            }
            #about .mob-dot-jupiter {
              background: radial-gradient(circle at 35% 35%, #f0c88a 0%, #d4924c 50%, #6d3a25 100%);
            }
            #about .mob-card {
              width: 100%; border-radius: 12px !important; padding: 18px !important;
              position: relative; z-index: 1;
            }
            #about .mob-card-gap { display: flex; flex-direction: column; align-items: center; gap: 16px; width: 100%; }
            #about .as-legacy { padding: 0; margin-top: 40px; }
            #about .as-legacy-grid { grid-template-columns: repeat(2, 1fr); }
            #about .as-legacy-inner { padding: 28px 20px; }
            #about .about-sun-anchor { width: 64px; height: 64px; top: 90px; }
          }

          /* ═══════════════════════════════════════════════════════════
             TABLET — 769px to 1024px
          ════════════════════════════════════════════════════════════ */
          @media (min-width: 769px) and (max-width: 1024px) {
            #about .p-mercury { width: 26px; height: 26px; }
            #about .p-venus { width: 36px; height: 36px; }
            #about .p-earth { width: 40px; height: 40px; }
            #about .p-sun {
              width: 76px; height: 76px;
              box-shadow: 0 0 0 3px rgba(255,171,0,0.15), 0 0 0 8px rgba(255,171,0,0.08);
            }
            #about .p-mars { width: 32px; height: 32px; }
            #about .p-jupiter { width: 56px; height: 56px; }
            #about .p-saturn { width: 46px; height: 46px; }
            #about .p-saturn-ring { width: 68px; height: 20px; }
            #about .p-neptune { width: 42px; height: 42px; }
            #about .p-zone { min-height: 110px; gap: 12px; }
            #about .orbit-line-h { top: 38px; }
            #about .as-card h3 { font-size: 20px; }
            #about .as-card-body { font-size: 13px; }
            #about .as-card { padding: 24px 22px; }
            #about .as-card h3 {
              display: -webkit-box; -webkit-line-clamp: 2;
              -webkit-box-orient: vertical; overflow: hidden; line-height: 1.2;
            }
            #about .as-pres-photo { width: 64px; height: 64px; }
            #about .as-pres-quote { font-size: 12px; }
            #about .solar-desktop { padding: 0 20px; gap: 20px; }
            #about .as-legacy { padding: 0 20px; }
            #about .about-sun-anchor { width: 76px; height: 76px; top: 200px; }
          }

          /* ═══════════════════════════════════════════════════════════
             LARGE DESKTOP — min-width: 1400px
          ════════════════════════════════════════════════════════════ */
          @media (min-width: 1400px) {
            #about .solar-desktop { max-width: 1500px; gap: 40px; }
            #about .as-card { padding: 36px 34px; }
            #about .as-card h3 { font-size: 28px; }
            #about .as-card-body { font-size: 16px; }
          }
        ` }} />

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
              <div className="p-sphere p-mercury" />
              <div className="p-sphere p-venus" />
              <div className="p-sphere p-earth" />
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
              <div className="p-sphere p-sun" />
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
              <div className="p-sphere p-mars" />
              <div className="p-sphere p-jupiter" />
              <div className="p-saturn-wrap">
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
              left: 0,
              top: 0,
              transform: "translate3d(-50%, -50%, 0) scale(0.6)",
              willChange: "left, top, width, height, transform, opacity",
            }}
          />
        ))}
      </div>

      {/* ═══ EVENTS CONSTELLATION SECTION ═══ */}
      <EventsConstellation
        events={data?.featuredEvents || []}
        morphedDotIds={morphedDotIds}
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
              aboutProgressRef={aboutProgressRef}
              activeAboutNodeRef={activeAboutNodeRef}
              onElectronClick={handleElectronClick}
            />
          </div>
        </div>
      </div>

      {/* Projector beam only during club zoom, NOT during about section */}
      {projectorCoords &&
        cardRevealVisible &&
        (() => {
          const activeClubData = CLUBS_DETAILS.find(
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
