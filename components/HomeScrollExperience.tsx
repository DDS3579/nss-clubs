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
  },
  {
    slug: "sports",
    name: "Sports Club",
    tagline: "Unleash your athletic potential, embrace teamwork, and chase victory.",
    color: "#f59e0b", // Amber
  },
  {
    slug: "literature",
    name: "Literature Club",
    tagline: "Celebrate the power of words, creative writing, poetry, and deep debates.",
    color: "#10b981", // Emerald
  },
  {
    slug: "arts",
    name: "Arts & Craft Club",
    tagline: "Express yourself visually through beautiful paintings, sketches, and manual crafts.",
    color: "#f43f5e", // Rose
  },
  {
    slug: "entertainment",
    name: "Entertainment Club",
    tagline: "Bring joy, music, dance, and theater to the main stage of NSS.",
    color: "#8b5cf6", // Violet
  },
  {
    slug: "social",
    name: "Social Club",
    tagline: "Make a positive impact on society through volunteering, empathy, and social work.",
    color: "#0d9488", // Teal
  },
];

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

type Phase = "hero" | "animating" | "clubs";

interface AnimState {
  direction: "forward" | "reverse";
  startTime: number;
  scrollStart: number;
  scrollEnd: number;
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

  const [clubsTextVisible, setClubsTextVisible] = useState(false);
  const [selectedClub, setSelectedClub] = useState<string | null>(null);

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

  /* ── Electron Click and Hover Handlers ── */
  const handleElectronClick = useCallback((slug: string) => {
    if (phaseRef.current === "hero") {
      // Trigger transition down first
      startTransition("forward");
      // And automatically select the club right as we finish the scroll
      setTimeout(() => {
        setSelectedClub(slug);
      }, TRANSITION_MS);
    } else if (phaseRef.current === "clubs") {
      setSelectedClub(slug);
    }
  }, [startTransition]);

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
      } else if (phaseRef.current === "clubs") {
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
      if (phaseRef.current === "animating") {
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

      if (phaseRef.current === "animating") {
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
            {/* 1. Default Heading - Fades out when a club is selected */}
            <div
              className={`flex flex-col items-center justify-center text-center transition-all duration-500 ease-in-out ${
                selectedClub
                  ? "opacity-0 scale-95 pointer-events-none absolute"
                  : "opacity-100 scale-100"
              }`}
            >
              <h2 className="font-display text-[clamp(3.5rem,11vw,8.5rem)] font-black leading-[0.88] text-primary">
                Our
                <span className="block text-accent">Clubs.</span>
              </h2>
              <p className="mt-4 font-body text-slate-400 text-sm font-medium animate-pulse">
                Click any electron node to explore
              </p>
            </div>

            {/* 2. Selected Club Details - Fades in dynamically */}
            {CLUBS_DETAILS.map((club) => {
              const isActive = selectedClub === club.slug;
              return (
                <div
                  key={club.slug}
                  className={`flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl bg-slate-50/70 border border-slate-100/80 shadow-md max-w-md transition-all duration-500 ease-in-out ${
                    isActive
                      ? "opacity-100 scale-100 relative z-10"
                      : "opacity-0 scale-95 pointer-events-none absolute"
                  }`}
                >
                  <span
                    className="inline-block px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider mb-4"
                    style={{
                      backgroundColor: `${club.color}15`,
                      color: club.color,
                    }}
                  >
                    Active Node Connection
                  </span>

                  <h3 className="font-display text-4xl sm:text-5xl font-black text-primary mb-3">
                    {club.name}
                  </h3>

                  <p className="font-body text-slate-600 text-base leading-relaxed mb-6">
                    {club.tagline}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                    <Link
                      href={`/clubs/${club.slug}`}
                      className="inline-flex items-center justify-center text-white text-sm font-semibold tracking-wide px-6 py-3 rounded-button transition-all duration-300 active:scale-95 shadow-md shadow-primary/20 hover:shadow-lg"
                      style={{ backgroundColor: club.color }}
                    >
                      Explore Club →
                    </Link>
                    <button
                      onClick={() => setSelectedClub(null)}
                      className="inline-flex items-center justify-center bg-white text-slate-500 hover:text-slate-700 text-sm font-semibold px-6 py-3 rounded-button border border-slate-200 transition-all duration-300 active:scale-95 hover:bg-slate-50"
                    >
                      Back to All
                    </button>
                  </div>
                </div>
              );
            })}
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
