import type { RefObject } from "react";
import Link from "next/link";
import { ALL_NODES } from "@/lib/clubs";
import ClubIcon from "./ClubIcon";

interface ClubsSectionProps {
  /** Where the floating atom parks while you are in this section. */
  clubsAnchorRef: RefObject<HTMLDivElement | null>;
  /** Slug of the club/nucleus currently zoomed into, or null. */
  selectedClub: string | null;
  /** Fades in the "click an electron" hint once the atom has arrived. */
  clubsTextVisible: boolean;
  cardWrapperRef: RefObject<HTMLDivElement | null>;
  /** True once the zoom has finished and the detail card should be visible. */
  cardRevealVisible: boolean;
  handleCloseClub: () => void;
}

/** The "Explore our clubs" section, including the zoomed club detail card. */
export default function ClubsSection({
  clubsAnchorRef,
  selectedClub,
  clubsTextVisible,
  cardWrapperRef,
  cardRevealVisible,
  handleCloseClub,
}: ClubsSectionProps) {
  return (
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
  );
}