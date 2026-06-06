"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Hero from "./Hero";
import HeroAtom, { TIMELINE_NODES } from "./HeroAtom";
import { urlFor } from "@/sanity/lib/image";
import type { HomepageData } from "@/sanity/lib/types";

/* ─── constants ─── */
const HEADER_H = 64;
const TRANSITION_MS_DEFAULT = 1600;
const TRANSITION_MS_ABOUT = 2000;
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

function getLayoutElement(selector: string): HTMLElement | null {
  const els = document.querySelectorAll<HTMLElement>(selector);
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

type Phase = "hero" | "animating" | "clubs" | "zooming" | "zoomed" | "about";
interface AnimState {
  targetPhase: "hero" | "clubs" | "about";
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
  const desktopAboutAnchorRef = useRef<HTMLDivElement>(null);
  const mobileAboutAnchorRef = useRef<HTMLDivElement>(null);
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

  const [clubsTextVisible, setClubsTextVisible] = useState(false);
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [cardRevealVisible, setCardRevealVisible] = useState(false);
  const [activeAboutNode, setActiveAboutNode] = useState(0);
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
    (targetPhase: "hero" | "clubs" | "about") => {
      if (phaseRef.current === "animating") return;
      if (phaseRef.current === "zooming" || phaseRef.current === "zoomed")
        return;
      let scrollTarget = 0;
      if (targetPhase === "hero") {
        scrollTarget = 0;
      } else if (targetPhase === "clubs") {
        const clubsSection = document.getElementById("clubs");
        if (clubsSection)
          scrollTarget =
            clubsSection.getBoundingClientRect().top +
            window.scrollY -
            HEADER_H;
      } else if (targetPhase === "about") {
        const aboutSection = document.getElementById("about");
        if (aboutSection)
          scrollTarget =
            aboutSection.getBoundingClientRect().top +
            window.scrollY -
            HEADER_H;
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

  /* ── Zoom initialization ── */
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
  };

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

  /* ── Holographic Projector Coordinate Updater ── */
  const updateProjectorCoords = useCallback(() => {
    if (selectedClub && cardWrapperRef.current) {
      const cardRect = cardWrapperRef.current.getBoundingClientRect();
      const x1 = window.innerWidth * 0.18;
      const y1 = window.innerHeight * 0.5;
      const x2 = cardRect.left;
      const y2 = cardRect.top;
      const x3 = cardRect.left;
      const y3 = cardRect.bottom;
      setProjectorCoords({ x1, y1, x2, y2, x3, y3 });
    } else if (phaseRef.current === "about") {
      const isMobile =
        typeof window !== "undefined" && window.innerWidth < 1024;
      const aboutAnchor = isMobile
        ? mobileAboutAnchorRef.current
        : desktopAboutAnchorRef.current;
      if (aboutAnchor) {
        const anchorRect = aboutAnchor.getBoundingClientRect();
        const anchorCx = anchorRect.left + anchorRect.width / 2;
        const anchorCy = anchorRect.top + anchorRect.height / 2;
        const scale = anchorRect.width / CANVAS_INTRINSIC;
        const halfC = CANVAS_INTRINSIC / 2;
        const nodeIdx = activeAboutNodeRef.current;
        const nodeCanvasX = TIMELINE_NODES[nodeIdx]?.targetX ?? halfC;
        const nodeCanvasY = TIMELINE_NODES[nodeIdx]?.targetY ?? halfC;
        const x1 = anchorCx + (nodeCanvasX - halfC) * scale;
        const y1 = anchorCy + (nodeCanvasY - halfC) * scale;
        const activeCard = document.querySelector(
          `.about-panel[data-node="${nodeIdx}"]`,
        );
        if (activeCard) {
          const cardRect = activeCard.getBoundingClientRect();
          setProjectorCoords({
            x1,
            y1,
            x2: cardRect.left,
            y2: cardRect.top,
            x3: cardRect.left,
            y3: cardRect.bottom,
          });
        } else {
          setProjectorCoords(null);
        }
      }
    } else {
      setProjectorCoords(null);
    }
  }, [selectedClub]);

  useEffect(() => {
    const active = cardRevealVisible || phaseRef.current === "about";
    if (active) {
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
        if (
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
        const duration = isAboutTransition
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
          aboutT = easedT;
        }

        atomProgressRef.current = posT;
        aboutProgressRef.current = aboutT;
        window.scrollTo(0, lerp(anim.scrollStart, anim.scrollEnd, easedT));

        if (rawT >= 1) {
          phaseRef.current = anim.targetPhase;
          animRef.current = null;
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
        atomProgressRef.current = 1;
        aboutProgressRef.current = 0;
      } else {
        const clubsSection = document.getElementById("clubs");
        const aboutSection = document.getElementById("about");
        if (clubsSection && aboutSection) {
          const clubsScrollY =
            clubsSection.getBoundingClientRect().top +
            window.scrollY -
            HEADER_H;
          const aboutScrollY =
            aboutSection.getBoundingClientRect().top +
            window.scrollY -
            HEADER_H;
          const sy = window.scrollY;

          if (sy < clubsScrollY) {
            phaseRef.current = "hero";
            posT = clamp01(sy / Math.max(clubsScrollY, 1));
            aboutT = 0;
          } else if (sy < aboutScrollY) {
            phaseRef.current = "clubs";
            posT = 1;
            aboutT = clamp01(
              (sy - clubsScrollY) / Math.max(aboutScrollY - clubsScrollY, 1),
            );
          } else {
            phaseRef.current = "about";
            posT = 1;
            aboutT = 1;
            const aRect = aboutSection.getBoundingClientRect();
            const sectionScrolled = -(aRect.top - HEADER_H);
            const scrollableH = aboutSection.offsetHeight - window.innerHeight;
            const subProg = clamp01(sectionScrolled / Math.max(scrollableH, 1));
            const nodeIdx = subProg < 0.33 ? 0 : subProg < 0.66 ? 1 : 2;
            activeAboutNodeRef.current = nodeIdx;
            if (nodeIdx !== prevActiveNodeRef.current) {
              prevActiveNodeRef.current = nodeIdx;
              setActiveAboutNode(nodeIdx);
              updateProjectorCoords();
            }
          }
        }
        atomProgressRef.current = posT;
        aboutProgressRef.current = aboutT;
      }

      const heroRect = heroAnchor.getBoundingClientRect();
      const clubsRect = clubsAnchor.getBoundingClientRect();
      const isMobile =
        typeof window !== "undefined" && window.innerWidth < 1024;
      const aboutAnchor = isMobile
        ? mobileAboutAnchorRef.current
        : desktopAboutAnchorRef.current;

      let cx = 0,
        cy = 0,
        size = 0;
      if (aboutProgressRef.current > 0.001 && aboutAnchor) {
        const aboutRect = aboutAnchor.getBoundingClientRect();
        const fromCx = clubsRect.left + clubsRect.width / 2;
        const fromCy = clubsRect.top + clubsRect.height / 2;
        const toCx = aboutRect.left + aboutRect.width / 2;
        const toCy = aboutRect.top + aboutRect.height / 2;
        cx = lerp(fromCx, toCx, aboutProgressRef.current);
        cy = lerp(fromCy, toCy, aboutProgressRef.current);
        size = lerp(clubsRect.width, aboutRect.width, aboutProgressRef.current);
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
    const handleWheel = (e: WheelEvent) => {
      if (
        phaseRef.current === "animating" ||
        phaseRef.current === "zooming" ||
        phaseRef.current === "zoomed"
      ) {
        e.preventDefault();
        return;
      }
      const clubsSection = document.getElementById("clubs");
      const aboutSection = document.getElementById("about");
      if (!clubsSection) return;
      const clubsAbsTop =
        clubsSection.getBoundingClientRect().top + window.scrollY;
      const clubsScrollY = clubsAbsTop - HEADER_H;

      if (e.deltaY > 0 && phaseRef.current === "hero") {
        e.preventDefault();
        if (Math.abs(e.deltaY) >= 10) startTransition("clubs");
        return;
      }
      if (phaseRef.current === "clubs") {
        if (e.deltaY < 0) {
          if (window.scrollY <= clubsScrollY + 15) {
            e.preventDefault();
            if (Math.abs(e.deltaY) >= 10) startTransition("hero");
          }
        } else if (e.deltaY > 0) {
          e.preventDefault();
          if (Math.abs(e.deltaY) >= 10) startTransition("about");
        }
        return;
      }
      if (e.deltaY < 0 && phaseRef.current === "about" && aboutSection) {
        const aRect = aboutSection.getBoundingClientRect();
        const sectionScrolled = -(aRect.top - HEADER_H);
        if (sectionScrolled <= 5) {
          e.preventDefault();
          if (Math.abs(e.deltaY) >= 10) startTransition("clubs");
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = e.touches[0]?.clientY ?? null;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartRef.current === null) return;
      const deltaY = touchStartRef.current - (e.touches[0]?.clientY ?? 0);
      if (
        phaseRef.current === "animating" ||
        phaseRef.current === "zooming" ||
        phaseRef.current === "zoomed"
      ) {
        e.preventDefault();
        return;
      }
      const clubsSection = document.getElementById("clubs");
      const aboutSection = document.getElementById("about");
      if (!clubsSection) return;
      const clubsAbsTop =
        clubsSection.getBoundingClientRect().top + window.scrollY;
      const clubsScrollY = clubsAbsTop - HEADER_H;

      if (deltaY > 0 && phaseRef.current === "hero") {
        e.preventDefault();
        if (Math.abs(deltaY) >= 20) {
          startTransition("clubs");
          touchStartRef.current = null;
        }
      } else if (phaseRef.current === "clubs") {
        if (deltaY < 0) {
          if (window.scrollY <= clubsScrollY + 15) {
            e.preventDefault();
            if (Math.abs(deltaY) >= 20) {
              startTransition("hero");
              touchStartRef.current = null;
            }
          }
        } else if (deltaY > 0) {
          e.preventDefault();
          if (Math.abs(deltaY) >= 20) {
            startTransition("about");
            touchStartRef.current = null;
          }
        }
      } else if (deltaY < 0 && phaseRef.current === "about" && aboutSection) {
        const aRect = aboutSection.getBoundingClientRect();
        const sectionScrolled = -(aRect.top - HEADER_H);
        if (sectionScrolled <= 5) {
          e.preventDefault();
          if (Math.abs(deltaY) >= 20) {
            startTransition("clubs");
            touchStartRef.current = null;
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
        className="relative overflow-hidden bg-slate-50 py-20 lg:py-32"
      >
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-8">

          {/* ── Section Header ── */}
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-black text-primary tracking-tight">
              Our Journey & <span className="text-accent">Impact</span>
            </h2>
            <p className="mt-4 font-body text-slate-500 max-w-2xl mx-auto text-lg">
              From a small spark to a blazing constellation of student leadership.
            </p>
          </div>

          {/* ── Main Grid: 3 Columns on Desktop ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">

            {/* ── COLUMN 1: Our Origin ── */}
            <div data-node="0" className="about-panel flex">
              <div
                className={`metallic-card metallic-card-standard relative flex flex-col h-full w-full pt-8 pb-6 px-6 rounded-3xl bg-primary border border-accent/20 transition-all duration-500 ease-out ${
                  activeAboutNode === 0
                    ? "ring-2 ring-accent scale-[1.02] shadow-[0_20px_50px_-12px_rgba(212,163,115,0.3)] opacity-100 z-10"
                    : "opacity-85 hover:opacity-100 hover:scale-[1.01]"
                }`}
              >
                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-accent/80 rounded-l-3xl" />
                <div className="flex flex-col flex-grow gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3 opacity-95">
                      <ClubIcon name="BookOpen" className="w-4 h-4 text-accent" />
                      <span className="text-[11px] font-bold tracking-[0.2em] text-white/60 uppercase font-body">
                        History & Heritage
                      </span>
                    </div>
                    <h3
                      className={`font-display text-3xl font-black mb-2 tracking-tight text-carved-dark ${
                        activeAboutNode === 0 ? "about-heading-glow" : ""
                      }`}
                    >
                      Our Origin
                    </h3>
                    <p className="text-sm text-white/50 font-body font-semibold mb-4">
                      Where It All Began
                    </p>
                    <p className="font-body text-slate-200/90 text-sm leading-relaxed font-medium">
                      Founded in the heart of our institution, NSS Clubs began
                      as a small group of passionate students with a shared
                      dream — to create a vibrant community where every talent
                      finds its stage.
                    </p>
                  </div>
                  <div className="border-t border-white/10 pt-5 mt-auto">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-white/45 font-body font-semibold">Founded</div>
                        <div className="text-xl font-black font-display text-white mt-0.5">2018</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-white/45 font-body font-semibold">Founders</div>
                        <div className="text-xl font-black font-display text-white mt-0.5">12</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-white/45 font-body font-semibold">First Event</div>
                        <div className="text-xl font-black font-display text-white mt-0.5">2019</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── COLUMN 2: President's Message (Centerpiece) ── */}
            <div data-node="1" className="about-panel flex md:col-span-2 lg:col-span-1">
              <div
                className={`metallic-card relative flex flex-col h-full w-full pt-8 pb-6 px-6 rounded-3xl bg-white border-2 border-accent shadow-xl transition-all duration-500 ease-out ${
                  activeAboutNode === 1
                    ? "ring-4 ring-primary/20 scale-[1.02] shadow-[0_20px_50px_-12px_rgba(2,59,142,0.25)] opacity-100 z-10"
                    : "opacity-95 hover:opacity-100 hover:scale-[1.01]"
                }`}
              >
                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-primary rounded-l-3xl" />
                <div className="flex flex-col flex-grow gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ClubIcon name="Shield" className="w-4 h-4 text-primary" />
                      <span className="text-[11px] font-bold tracking-[0.2em] text-primary/60 uppercase font-body">
                        Leadership & Vision
                      </span>
                    </div>
                    <h3
                      className={`font-display text-3xl font-black mb-6 tracking-tight text-primary ${
                        activeAboutNode === 1 ? "about-heading-glow" : ""
                      }`}
                    >
                      A Message from <br/> the President
                    </h3>
                  </div>

                  <div className="flex-grow flex flex-col items-center justify-center gap-6">
                    {data?.presidentPhoto && (
                      <div className="relative w-28 h-28 flex-shrink-0 overflow-hidden rounded-full border-4 border-accent/30 shadow-lg bg-slate-100">
                        <Image
                          src={urlFor(data.presidentPhoto).width(256).height(256).fit("crop").auto("format").url()}
                          alt="President Photo"
                          width={128}
                          height={128}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    <p className="font-body text-slate-700 text-base leading-relaxed font-medium italic text-center max-w-sm">
                      &ldquo;{data?.presidentMessage || 'Empowering the next generation of leaders through passion, service, and innovation.'}&rdquo;
                    </p>
                  </div>

                  <div className="mt-auto text-center pt-4 border-t border-slate-200">
                     <p className="text-xs font-bold uppercase tracking-widest text-primary/80">NSS President</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── COLUMN 3: Our Vision ── */}
            <div data-node="2" className="about-panel flex">
              <div
                className={`metallic-card metallic-card-standard relative flex flex-col h-full w-full pt-8 pb-6 px-6 rounded-3xl bg-primary border border-accent/20 transition-all duration-500 ease-out ${
                  activeAboutNode === 2
                    ? "ring-2 ring-accent scale-[1.02] shadow-[0_20px_50px_-12px_rgba(212,163,115,0.3)] opacity-100 z-10"
                    : "opacity-85 hover:opacity-100 hover:scale-[1.01]"
                }`}
              >
                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-accent/80 rounded-l-3xl" />
                <div className="flex flex-col flex-grow gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3 opacity-95">
                      <ClubIcon name="Heart" className="w-4 h-4 text-accent" />
                      <span className="text-[11px] font-bold tracking-[0.2em] text-white/60 uppercase font-body">
                        Mission & Purpose
                      </span>
                    </div>
                    <h3
                      className={`font-display text-3xl font-black mb-2 tracking-tight text-carved-dark ${
                        activeAboutNode === 2 ? "about-heading-glow" : ""
                      }`}
                    >
                      Our Vision
                    </h3>
                    <p className="text-sm text-white/50 font-body font-semibold mb-4">
                      What Drives Us Forward
                    </p>
                    <p className="font-body text-slate-200/90 text-sm leading-relaxed font-medium">
                      We envision a campus where creativity knows no
                      boundaries, where a scientist can paint, a dancer can
                      code, and a writer can score goals. NSS Clubs exist to
                      blur the lines between disciplines.
                    </p>
                  </div>
                  <div className="border-t border-white/10 pt-5 mt-auto">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-white/45 font-body font-semibold">Clubs</div>
                        <div className="text-xl font-black font-display text-white mt-0.5">6</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-white/45 font-body font-semibold">Events/Year</div>
                        <div className="text-xl font-black font-display text-white mt-0.5">50+</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-white/45 font-body font-semibold">Impact</div>
                        <div className="text-xl font-black font-display text-white mt-0.5">1000+</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ── BOTTOM ROW: The Legacy (Stats Banner) ── */}
          {data?.legacyStats && data.legacyStats.length > 0 && (
            <div className="mt-12 metallic-card metallic-card-standard relative w-full pt-10 pb-10 px-8 rounded-3xl bg-primary border border-accent/20 shadow-lg">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                  {data.legacyStats.map((stat) => (
                    <div key={stat._key} className="flex flex-col items-center">
                      <div className="text-3xl md:text-4xl font-black font-display text-accent mt-0.5">
                        {stat.value}
                      </div>
                      <div className="text-[11px] uppercase tracking-widest text-white/60 font-body font-semibold mt-2">
                        {stat.label}
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

        </div>
      </section>

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

      {projectorCoords &&
        (cardRevealVisible || phaseRef.current === "about") &&
        (() => {
          const activeClubData = CLUBS_DETAILS.find(
            (c) => c.slug === selectedClub,
          );
          const isAboutProjector = phaseRef.current === "about";
          const connectorColor = isAboutProjector
            ? "#D4A373"
            : activeClubData
              ? activeClubData.color
              : "#023B8E";
          return (
            <svg
              className="fixed top-0 left-0 w-full h-full pointer-events-none z-40 transition-opacity duration-700 ease-out animate-flicker-in"
              style={{ opacity: cardRevealVisible || isAboutProjector ? 1 : 0 }}
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
              {isAboutProjector ? (
                <line
                  x1={projectorCoords.x1}
                  y1={projectorCoords.y1}
                  x2={projectorCoords.x2}
                  y2={(projectorCoords.y2 + projectorCoords.y3) / 2}
                  stroke={connectorColor}
                  strokeWidth="1.2"
                  className="projector-edge-line"
                  opacity="0.55"
                />
              ) : (
                <>
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
                </>
              )}
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
        {phaseRef.current === "animating" ? "Moving between sections" : ""}
      </span>
    </div>
  );
}
