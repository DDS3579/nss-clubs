"use client";

import { useEffect, type CSSProperties, type RefObject } from "react";
import Link from "next/link";
import { ALL_NODES, type ClubNode } from "@/lib/clubs";
import ClubIcon from "./ClubIcon";
import ClubCallouts from "./ClubCallouts";

interface ClubsSectionProps {
  /** Where the floating atom parks while you are in this section. */
  clubsAnchorRef: RefObject<HTMLDivElement | null>;
  /** Slug of the club/nucleus currently zoomed into, or null. */
  selectedClub: string | null;
  /** Fades in the title block once the atom has arrived. */
  clubsTextVisible: boolean;
  cardWrapperRef: RefObject<HTMLDivElement | null>;
  /** True once the zoom has finished and the detail card should be visible. */
  cardRevealVisible: boolean;
  handleCloseClub: () => void;
  /** Called when someone taps a club label (same as tapping its electron). */
  onSelectNode: (slug: string) => void;
}

/** Start delay for each part of the card's staggered entrance (the CSS reads --d). */
const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/* ───────── the club / executive team card ───────── */

function ClubCard({ club, onClose }: { club: ClubNode; onClose: () => void }) {
  const gold = Boolean(club.isSpecial);

  const tone = gold
    ? {
        card: "metallic-card-gold bg-accent text-primary",
        close: "text-primary/60 hover:bg-primary/5 hover:text-primary",
        icon: "text-primary/70",
        category: "text-primary/75",
        title: "text-carved-light",
        themes: "font-semibold text-slate-800/80",
        tagline: "font-medium text-slate-800",
        divider: "border-primary/10",
        statLabel: "text-primary/65",
        statValue: "font-black text-slate-900",
        cta: "bg-primary text-white hover:bg-primary/95 shadow-[0_4px_12px_rgba(2,59,142,0.15)]",
      }
    : {
        card: "metallic-card-standard bg-primary text-white",
        close: "text-white/60 hover:bg-white/10 hover:text-white",
        icon: "text-white/70",
        category: "text-white/60",
        title: "text-carved-dark",
        themes: "font-medium text-slate-300/80",
        tagline: "text-slate-200/90",
        divider: "border-white/10",
        statLabel: "text-white/45",
        statValue: "font-bold text-white",
        cta: "bg-white text-primary hover:bg-slate-100 shadow-[0_4px_12px_rgba(255,255,255,0.15)]",
      };

  return (
    <div
      data-club-card
      className={`clubs-card metallic-card ${tone.card} relative flex min-h-0 w-full max-w-lg flex-col justify-between overflow-hidden rounded-3xl px-6 pb-5 pt-8 sm:min-h-[460px] sm:px-12 sm:pb-8 sm:pt-12`}
      style={
        gold
          ? undefined
          : {
              boxShadow: `inset 0 1.5px 0.5px rgba(255, 255, 255, 0.22), inset 0 -1.5px 1px rgba(0, 0, 0, 0.3), 0 12px 28px -4px rgba(0, 0, 0, 0.25), 0 15px 35px -5px ${club.color}25`,
            }
      }
    >
      {/* Left accent bar */}
      <div
        className={`absolute bottom-0 left-0 top-0 w-[4px] ${gold ? "bg-primary/20" : ""}`}
        style={gold ? undefined : { backgroundColor: club.color }}
      />

      {/* Little sheet handle (phones only) */}
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-2.5 h-1 w-10 -translate-x-1/2 rounded-full bg-current opacity-25 lg:hidden"
      />

      <button
        type="button"
        onClick={onClose}
        className={`absolute right-4 top-4 z-20 rounded-full p-3 transition-all duration-200 sm:right-6 sm:top-6 ${tone.close}`}
        aria-label="Back to clubs"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex h-full flex-col justify-between gap-4 sm:gap-6">
        <div>
          <div className="cc-item mb-2.5 flex items-center gap-2" style={delay(120)}>
            <ClubIcon name={club.iconName} className={`h-4 w-4 ${tone.icon}`} />
            <span
              className={`font-body text-[11px] font-bold uppercase tracking-[0.2em] ${tone.category}`}
            >
              {club.category}
            </span>
          </div>
          <h3
            className={`cc-item mb-4 font-display text-3xl font-black tracking-tight sm:mb-6 sm:text-5xl ${tone.title}`}
            style={delay(200)}
          >
            {club.name}
          </h3>
          <div
            className={`cc-item flex flex-wrap gap-x-2 gap-y-1 font-body text-xs ${tone.themes}`}
            style={delay(300)}
          >
            {club.themes.map((theme, i) => (
              <span key={theme} className="flex items-center">
                {theme}
                {i < club.themes.length - 1 && (
                  <span className="ml-2 mr-0.5 opacity-60">•</span>
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-grow items-center">
          <p
            className={`cc-item max-w-md font-body text-sm leading-relaxed sm:text-base ${tone.tagline}`}
            style={delay(380)}
          >
            {club.tagline}
          </p>
        </div>

        <div className={`cc-item mt-auto border-t pt-5 ${tone.divider}`} style={delay(460)}>
          <div className="grid grid-cols-3 gap-4">
            {club.stats.map((item) => (
              <div key={item.label}>
                <div
                  className={`font-body text-[10px] font-semibold uppercase tracking-wider ${tone.statLabel}`}
                >
                  {item.label}
                </div>
                <div className={`mt-0.5 font-display text-sm sm:text-base ${tone.statValue}`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cc-item w-full" style={delay(540)}>
          <Link
            href={gold ? "/executive-team" : `/clubs/${club.slug}`}
            className={`inline-flex w-full items-center justify-center rounded-xl px-8 py-3.5 font-body text-sm font-bold tracking-wide transition-all duration-300 active:scale-95 ${tone.cta}`}
          >
            {gold ? "Meet the Executive Team" : "Explore Club Profile"}
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ───────── the section ───────── */

/** The "Explore our clubs" section, including the storyline callouts and the club detail card. */
export default function ClubsSection({
  clubsAnchorRef,
  selectedClub,
  clubsTextVisible,
  cardWrapperRef,
  cardRevealVisible,
  handleCloseClub,
  onSelectNode,
}: ClubsSectionProps) {
  // Esc closes the open club
  useEffect(() => {
    if (!selectedClub) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleCloseClub();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedClub, handleCloseClub]);

  return (
    <section
      id="clubs"
      // Tapping the empty area (outside the card) closes the open club
      onClick={(event) => {
        if (selectedClub && !(event.target as HTMLElement).closest("[data-club-card]")) {
          handleCloseClub();
        }
      }}
      className="relative flex min-h-[calc(100svh-4rem)] scroll-mt-16 overflow-hidden bg-white px-6 py-12 sm:px-8 lg:px-10"
    >
      {/* Soft scrim that appears behind an open card, so the eye goes to the card */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-primary/[0.08] transition-opacity duration-700 ${
          selectedClub ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="mx-auto grid w-full max-w-7xl grid-rows-[1fr_auto] items-center gap-8 lg:grid-cols-2 lg:grid-rows-1 lg:gap-10">
        <div className="flex min-h-[42svh] items-center justify-center lg:min-h-0">
          {/* The atom parks here. Its size is capped by screen height, so the hint never falls below the fold. */}
          <div
            ref={clubsAnchorRef}
            className="relative flex aspect-square w-[min(64vw,15rem,calc(100svh_-_9rem))] items-center justify-center sm:w-[min(22rem,calc(100svh_-_9rem))] lg:w-[min(34rem,calc(100svh_-_12rem))]"
          >
            <div className="clubs-glow" aria-hidden="true" />
            <ClubCallouts onSelect={onSelectNode} />
          </div>
        </div>

        <div
          className={`relative flex min-h-[34svh] items-center justify-center transition-all duration-700 ease-out lg:min-h-0 ${
            selectedClub ? "z-[60]" : "z-10"
          } ${clubsTextVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <div
            className={`flex flex-col items-center justify-center text-center transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${
              selectedClub
                ? "pointer-events-none absolute translate-x-[80px] opacity-0"
                : "translate-x-0 opacity-100"
            }`}
          >
            {/* The storyline fades this block out (see .clubs-intro-title in the CSS) */}
            <div className="clubs-intro-title flex flex-col items-center">
              <h2 className="font-display text-[clamp(3.5rem,11vw,8.5rem)] font-black leading-[0.88] text-primary">
                Our<span className="block text-[#b07a2c]">Clubs.</span>
              </h2>
              <p className="mt-4 animate-pulse font-body text-sm font-medium text-slate-400">
                Tap or click an electron, or the nucleus, to explore
              </p>
            </div>
          </div>

          {/* The card. The wrapper has no transform of its own (the zoom target is measured from it);
              the card inside does all the moving. */}
          <div
            ref={cardWrapperRef}
            data-reveal={cardRevealVisible ? "in" : "out"}
            className={`clubs-card-wrap absolute inset-x-0 bottom-0 flex justify-center lg:static lg:inset-auto lg:block ${
              cardRevealVisible ? "" : "pointer-events-none"
            }`}
          >
            {ALL_NODES.map((club) =>
              selectedClub === club.slug ? (
                <ClubCard key={club.slug} club={club} onClose={handleCloseClub} />
              ) : null,
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
