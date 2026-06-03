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
  {
    slug: "executive-team",
    name: "Executive Team",
    tagline: "Meet the visionary leaders, advisors, and coordinators steering the NSS Clubs towards excellence and impact.",
    color: "#D4A373", // Gold
    isSpecial: true,
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

  /* ── Electron & Nucleus Click Handler ── */
  const handleElectronClick = useCallback((slug: string) => {
    if (phaseRef.current === "hero") {
      // Trigger transition down first
      startTransition("forward");
      // And automatically select the node right as we finish the scroll
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
            {CLUBS_DETAILS.map((club) => {
              const isActive = selectedClub === club.slug;
              if (!isActive) return null; // Unmount to trigger full mounting animation timeline fresh!

              // Special Luxury Golden Executive Card (Nucleus) - Simplified Clean gold background
              if (club.isSpecial) {
                return (
                  <div
                    key={club.slug}
                    className="animate-slide-in-card relative flex flex-col justify-between p-8 sm:p-12 rounded-3xl bg-accent border border-white/20 w-full max-w-lg min-h-[380px] sm:min-h-[400px] shadow-[0_15px_35px_-5px_rgba(212,163,115,0.3)] overflow-hidden"
                  >
                    <div>
                      {/* Display Text: [Executive Team] (Flickers carved in, generous spacing) */}
                      <h3 className="animate-flicker-in text-carved-light font-display text-4xl sm:text-5xl font-black mb-8 tracking-tight">
                        {club.name}
                      </h3>

                      {/* Description Text (Spaced out, clean styling) */}
                      <p className="animate-fade-in-delayed font-body text-slate-800 text-sm sm:text-base leading-relaxed mb-10 font-semibold">
                        {club.tagline}
                      </p>
                    </div>

                    {/* CTA buttons */}
                    <div className="animate-fade-in-delayed flex flex-col sm:flex-row gap-4 w-full">
                      <Link
                        href="#executive-team"
                        className="inline-flex items-center justify-center bg-primary hover:bg-primary/95 text-white text-sm font-semibold tracking-wide px-6 py-2.5 rounded transition-all duration-300 active:scale-95 shadow-md shadow-primary/10 font-body"
                      >
                        Meet the Team
                      </Link>
                      <button
                        onClick={() => setSelectedClub(null)}
                        className="inline-flex items-center justify-center bg-transparent text-primary/80 hover:text-primary hover:bg-primary/5 text-sm font-semibold px-6 py-2.5 rounded border border-primary/20 transition-all duration-300 active:scale-95 font-body"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                );
              }

              // Standard Club Cards - Simplified Clean primary deep navy background
              return (
                <div
                  key={club.slug}
                  className="animate-slide-in-card relative flex flex-col justify-between p-8 sm:p-12 rounded-3xl bg-primary border border-white/10 w-full max-w-lg min-h-[380px] sm:min-h-[400px] shadow-2xl overflow-hidden"
                  style={{
                    boxShadow: `0 15px 35px -5px ${club.color}15`
                  }}
                >
                  <div>
                    {/* Display Text: Club Name (Flickers carved in, generous spacing) */}
                    <h3 className="animate-flicker-in text-carved-dark font-display text-4xl sm:text-5xl font-black mb-8 tracking-tight">
                      {club.name}
                    </h3>

                    {/* Description Text (Spaced out, clean styling) */}
                    <p className="animate-fade-in-delayed font-body text-slate-200/90 text-sm sm:text-base leading-relaxed mb-10">
                      {club.tagline}
                    </p>
                  </div>

                  {/* CTA button & Back control */}
                  <div className="animate-fade-in-delayed flex flex-col sm:flex-row gap-4 w-full">
                    <Link
                      href={`/clubs/${club.slug}`}
                      className="inline-flex items-center justify-center bg-white hover:bg-slate-100 text-primary text-sm font-semibold tracking-wide px-6 py-2.5 rounded transition-all duration-300 active:scale-95 shadow-lg shadow-white/5 font-body"
                    >
                      Explore Club
                    </Link>
                    <button
                      onClick={() => setSelectedClub(null)}
                      className="inline-flex items-center justify-center bg-transparent text-white/80 hover:text-white hover:bg-white/10 text-sm font-semibold px-6 py-2.5 rounded border border-white/20 transition-all duration-300 active:scale-95 font-body"
                    >
                      Back
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
