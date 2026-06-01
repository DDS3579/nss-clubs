"use client";

import { useEffect, useRef, useState } from "react";
import Hero from "./Hero";
import HeroToClubAnimation from "./HeroToClubAnimation";

const AUTO_SCROLL_COOLDOWN_MS = 950;
const ACTIVATION_RATIO = 0.48;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function HomeScrollExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const clubsRef = useRef<HTMLElement>(null);
  const isAutoScrollingRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);
  const scrollFrameRef = useRef<number | null>(null);

  const [clubsActive, setClubsActive] = useState(false);
  const [clubsSettled, setClubsSettled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const clubs = clubsRef.current;
    if (!clubs) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isFocused = entry.isIntersecting && entry.intersectionRatio >= ACTIVATION_RATIO;
        setClubsActive(isFocused);

        if (!isFocused) {
          setClubsSettled(false);
        }
      },
      { threshold: [0, 0.25, ACTIVATION_RATIO, 0.7, 1] },
    );

    observer.observe(clubs);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateProgress = () => {
      scrollFrameRef.current = null;

      const clubs = clubsRef.current;
      if (!clubs) return;

      const rect = clubs.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const progress = clamp(1 - rect.top / viewportHeight, 0, 1);

      setScrollProgress(progress);
    };

    const requestProgress = () => {
      if (scrollFrameRef.current !== null) return;
      scrollFrameRef.current = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", requestProgress, { passive: true });
    window.addEventListener("resize", requestProgress);

    return () => {
      window.removeEventListener("scroll", requestProgress);
      window.removeEventListener("resize", requestProgress);

      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const scrollToClubs = () => {
      const clubs = clubsRef.current;
      if (!clubs || isAutoScrollingRef.current) return;

      isAutoScrollingRef.current = true;
      setClubsActive(true);
      clubs.scrollIntoView({ behavior: "smooth", block: "start" });

      window.setTimeout(() => {
        isAutoScrollingRef.current = false;
      }, AUTO_SCROLL_COOLDOWN_MS);
    };

    const scrollToHero = () => {
      const hero = heroRef.current;
      if (!hero || isAutoScrollingRef.current) return;

      isAutoScrollingRef.current = true;
      setClubsActive(false);
      hero.scrollIntoView({ behavior: "smooth", block: "start" });

      window.setTimeout(() => {
        isAutoScrollingRef.current = false;
      }, AUTO_SCROLL_COOLDOWN_MS);
    };

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 16 || isAutoScrollingRef.current) return;

      const hero = heroRef.current;
      const clubs = clubsRef.current;
      if (!hero || !clubs) return;

      const heroRect = hero.getBoundingClientRect();
      const clubsRect = clubs.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;

      const heroIsDominant = heroRect.bottom > viewportHeight * 0.42;
      const clubsIsAtTop = clubsRect.top < viewportHeight * 0.2 && clubsRect.top > -viewportHeight * 0.4;

      if (event.deltaY > 0 && heroIsDominant) {
        event.preventDefault();
        scrollToClubs();
      }

      if (event.deltaY < 0 && clubsIsAtTop) {
        event.preventDefault();
        scrollToHero();
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touchStartY = touchStartYRef.current;
      if (touchStartY === null || isAutoScrollingRef.current) return;

      const currentY = event.touches[0]?.clientY;
      if (typeof currentY !== "number") return;

      const deltaY = touchStartY - currentY;
      if (Math.abs(deltaY) < 36) return;

      const hero = heroRef.current;
      const clubs = clubsRef.current;
      if (!hero || !clubs) return;

      const heroRect = hero.getBoundingClientRect();
      const clubsRect = clubs.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;

      if (deltaY > 0 && heroRect.bottom > viewportHeight * 0.42) {
        event.preventDefault();
        touchStartYRef.current = null;
        scrollToClubs();
      }

      if (deltaY < 0 && clubsRect.top < viewportHeight * 0.2 && clubsRect.top > -viewportHeight * 0.4) {
        event.preventDefault();
        touchStartYRef.current = null;
        scrollToHero();
      }
    };

    root.addEventListener("wheel", handleWheel, { passive: false });
    root.addEventListener("touchstart", handleTouchStart, { passive: true });
    root.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      root.removeEventListener("wheel", handleWheel);
      root.removeEventListener("touchstart", handleTouchStart);
      root.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  const atomParallax = (1 - scrollProgress) * 42;
  const copyParallax = (1 - scrollProgress) * -28;
  const copyOpacity = clamp(scrollProgress * 1.7, 0, 1);

  return (
    <div ref={rootRef} className="bg-bg">
      <div ref={heroRef} className="snap-start">
        <Hero />
      </div>

      <section
        ref={clubsRef}
        id="clubs"
        className="relative isolate flex min-h-[calc(100svh-4rem)] snap-start scroll-mt-16 overflow-hidden bg-white px-6 py-12 sm:px-8 lg:px-10"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_45%,rgba(2,59,142,0.09),transparent_28%),radial-gradient(circle_at_78%_52%,rgba(212,163,115,0.13),transparent_30%)]" />
        <div className="absolute left-1/2 top-8 -z-10 h-px w-[min(78rem,86vw)] -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/15 to-transparent" />

        <div className="mx-auto grid w-full max-w-7xl grid-rows-[1fr_auto] items-center gap-8 lg:grid-cols-2 lg:grid-rows-1 lg:gap-10">
          <div
            className="flex min-h-[42svh] items-center justify-center lg:min-h-0"
            style={{
              transform: `translate3d(0, ${atomParallax}px, 0)`,
              transition: clubsSettled ? "transform 500ms ease" : undefined,
            }}
          >
            <div className="relative flex aspect-square w-[min(78vw,25rem)] items-center justify-center sm:w-[30rem] lg:w-[34rem]">
              <div className="absolute inset-8 rounded-full border border-primary/10 bg-white/30 shadow-[0_24px_80px_rgba(26,54,93,0.08)]" />
              <HeroToClubAnimation
                active={clubsActive}
                onComplete={() => setClubsSettled(true)}
                className="relative w-full"
              />
            </div>
          </div>

          <div
            className="flex min-h-[34svh] items-center justify-center text-center lg:min-h-0"
            style={{
              opacity: copyOpacity,
              transform: `translate3d(0, ${copyParallax}px, 0)`,
            }}
          >
            <h2 className="font-display text-[clamp(3.5rem,11vw,8.5rem)] font-black leading-[0.88] text-primary">
              Our
              <span className="block text-accent">Clubs.</span>
            </h2>
          </div>
        </div>
      </section>
    </div>
  );
}
