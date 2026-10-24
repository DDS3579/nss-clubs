"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Calendar,
  ChevronRight,
  Crown,
  ListChecks,
  Quote,
  Star,
  Trophy,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

/* ───────── data shapes (filled in by app/presidents-legacy/page.tsx) ───────── */

export interface AchievementView {
  key: string;
  title: string;
  description: string | null;
  date: string | null;
  imageUrl: string | null;
}

export interface EventView {
  key: string;
  title: string;
  date: string | null;
  description: string | null;
}

export interface InterSchoolView {
  key: string;
  title: string;
  host: string | null;
  date: string | null;
  result: string | null;
}

export interface LegacyEraView {
  key: string;
  academicYear: string;
  isCurrent: boolean;
  hasDetails: boolean;
  presidentName: string;
  grade: string | null;
  photoUrl: string | null;
  photoLargeUrl: string | null;
  tagline: string | null;
  message: string | null;
  eventsConductedCount: number;
  interSchoolCount: number;
  peakAchievements: string[];
  achievements: AchievementView[];
  reforms: string[];
  eventsConducted: EventView[];
  interSchoolEvents: InterSchoolView[];
}

/* ───────── small pieces ───────── */

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function Portrait({
  era,
  size,
  className,
}: {
  era: LegacyEraView;
  size: number;
  className: string;
}) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full ring-2 ring-accent/70 ${className}`}
      style={{ width: size, height: size }}
    >
      {era.photoUrl ? (
        <Image
          src={era.photoUrl}
          alt={era.presidentName}
          fill
          unoptimized
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-full w-full items-center justify-center font-display font-bold"
          style={{ fontSize: size / 3 }}
        >
          {initials(era.presidentName)}
        </span>
      )}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  badge,
  children,
}: {
  icon: LucideIcon;
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3 border-b border-accent/40 pb-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-accent">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <h4 className="font-display text-lg font-bold text-primary">{title}</h4>
        {badge && (
          <span className="ml-auto rounded-full bg-accent px-3 py-1 text-xs font-bold text-primary">
            {badge}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function AchievementTimeline({ items }: { items: AchievementView[] }) {
  return (
    <ol className="relative space-y-6 border-l-2 border-accent/50 pl-7">
      {items.map((item) => (
        <li key={item.key} className="relative">
          <span
            aria-hidden="true"
            className="absolute -left-[37px] top-1 h-4 w-4 rounded-full bg-accent ring-4 ring-white"
          />
          {item.date && (
            <p className="text-xs font-bold uppercase tracking-wider text-accent">{item.date}</p>
          )}
          <p className="font-display text-base font-bold text-primary">{item.title}</p>
          {item.description && (
            <p className="mt-1 text-[15px] leading-relaxed text-text/80">{item.description}</p>
          )}
          {item.imageUrl && (
            <div className="relative mt-3 aspect-[3/2] w-full max-w-sm overflow-hidden rounded-2xl bg-primary/5 shadow-md">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                unoptimized
                sizes="384px"
                className="object-cover"
              />
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

/* ───────── the legacy card ───────── */

function EraCard({ era, onClose }: { era: LegacyEraView; onClose: () => void }) {
  const stats = [
    { icon: Calendar, value: era.eventsConductedCount, label: "Events conducted" },
    { icon: Users, value: era.interSchoolCount, label: "Inter-school events" },
    { icon: ListChecks, value: era.reforms.length, label: "Reforms made" },
  ];

  return (
    <article className="overflow-hidden rounded-[2rem] bg-white ring-1 ring-accent/50">
      {/* gold crest line */}
      <div
        aria-hidden="true"
        className="h-1.5 bg-gradient-to-r from-accent/50 via-accent to-accent/50"
      />

      {/* ───── banner: big portrait with the name over it ───── */}
      <header className="relative overflow-hidden bg-primary text-white">
        <div className="relative aspect-[4/3] w-full">
          {era.photoLargeUrl ? (
            <Image
              src={era.photoLargeUrl}
              alt={era.presidentName}
              fill
              unoptimized
              sizes="(min-width: 1536px) 704px, (min-width: 1280px) 576px, (min-width: 1024px) 416px, 100vw"
              className="object-cover object-top"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary via-primary to-primary/70">
              <span
                aria-hidden="true"
                className="font-display text-8xl font-black text-accent/80"
              >
                {initials(era.presidentName)}
              </span>
            </div>
          )}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-primary via-primary/55 to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/25 blur-3xl"
          />

          <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary shadow-lg">
            <Crown className="h-3.5 w-3.5" aria-hidden="true" />
            {era.isCurrent ? "Current President" : "Former President"}
          </span>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close legacy card"
            className="absolute right-4 top-4 rounded-full bg-black/35 p-2.5 text-white backdrop-blur transition hover:bg-black/55"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="absolute inset-x-0 bottom-0 p-6 pb-12 sm:p-8 sm:pb-14">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
              President · {era.academicYear} BS
            </p>
            <h3 className="mt-2 font-display text-3xl font-black leading-tight text-white sm:text-4xl">
              {era.presidentName}
            </h3>
            {era.grade && <p className="mt-1 text-sm text-white/75">{era.grade}</p>}
            {era.tagline && (
              <p className="mt-3 max-w-md text-base leading-snug text-white/90">{era.tagline}</p>
            )}
          </div>
        </div>
      </header>

      {/* ───── big numbers, overlapping the banner ───── */}
      {era.hasDetails && (
        <ul className="relative -mt-8 grid grid-cols-3 gap-3 px-5 sm:px-8">
          {stats.map(({ icon: Icon, value, label }) => (
            <li
              key={label}
              className="rounded-2xl bg-white p-4 text-center shadow-xl ring-1 ring-primary/10"
            >
              <Icon className="mx-auto h-6 w-6 text-accent" aria-hidden="true" />
              <p className="mt-2 font-display text-3xl font-black text-primary">{value}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase leading-tight tracking-wide text-text/60">
                {label}
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* ───── the story ───── */}
      <div className="space-y-10 p-5 pt-8 text-text sm:p-8 sm:pt-10">
        {!era.hasDetails && (
          <p className="rounded-2xl bg-primary/5 px-5 py-8 text-center text-base text-text/80">
            The full story of this era is being added. Check back soon.
          </p>
        )}

        {era.message && (
          <figure className="relative rounded-2xl bg-primary/5 p-6 pt-8">
            <Quote
              className="absolute -top-4 left-6 h-9 w-9 fill-accent text-accent"
              aria-hidden="true"
            />
            <blockquote className="font-display text-lg italic leading-relaxed text-primary">
              {era.message}
            </blockquote>
            <figcaption className="mt-3 text-sm font-semibold text-primary/70">
              {era.presidentName}, President {era.academicYear} BS
            </figcaption>
          </figure>
        )}

        {era.peakAchievements.length > 0 && (
          <Section icon={Star} title="Peak achievements">
            <ul className="space-y-3">
              {era.peakAchievements.map((text, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 rounded-2xl bg-gradient-to-r from-accent/25 to-accent/5 px-5 py-4 text-[15px] font-semibold leading-snug text-primary ring-1 ring-accent/40"
                >
                  <Star
                    className="mt-0.5 h-5 w-5 shrink-0 fill-accent text-accent"
                    aria-hidden="true"
                  />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {era.achievements.length > 0 && (
          <Section icon={Trophy} title="Achievements">
            <AchievementTimeline items={era.achievements} />
          </Section>
        )}

        {era.reforms.length > 0 && (
          <Section icon={ListChecks} title="Reforms made" badge={String(era.reforms.length)}>
            <ol className="space-y-3">
              {era.reforms.map((text, index) => (
                <li key={index} className="flex items-start gap-3 text-[15px] leading-relaxed text-text/85">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-accent">
                    {index + 1}
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {era.eventsConducted.length > 0 && (
          <Section
            icon={Calendar}
            title="Events conducted"
            badge={String(era.eventsConductedCount)}
          >
            <ul className="divide-y divide-primary/10 overflow-hidden rounded-2xl ring-1 ring-primary/10">
              {era.eventsConducted.map((event) => (
                <li key={event.key} className="flex items-start justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-primary">{event.title}</p>
                    {event.description && (
                      <p className="mt-1 text-sm text-text/70">{event.description}</p>
                    )}
                  </div>
                  {event.date && (
                    <span className="shrink-0 text-xs font-semibold text-text/60">{event.date}</span>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {era.interSchoolEvents.length > 0 && (
          <Section
            icon={Users}
            title="Inter-school events our students joined"
            badge={String(era.interSchoolCount)}
          >
            <ul className="divide-y divide-primary/10 overflow-hidden rounded-2xl ring-1 ring-primary/10">
              {era.interSchoolEvents.map((event) => (
                <li key={event.key} className="flex items-start justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-primary">{event.title}</p>
                    <p className="mt-1 text-sm text-text/70">
                      {[event.host, event.date].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  {event.result && (
                    <span className="shrink-0 rounded-full bg-accent/30 px-3 py-1 text-xs font-bold text-primary">
                      {event.result}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      {/* ───── closing line ───── */}
      <footer className="bg-primary px-6 py-5 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
          With gratitude to {era.presidentName}
        </p>
      </footer>
    </article>
  );
}

/* ───────── the page body: rows + right-side card ───────── */

export default function LegacyExplorer({ eras }: { eras: LegacyEraView[] }) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const rowRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const selected = eras.find((era) => era.key === selectedKey) ?? null;

  const close = useCallback(() => setSelectedKey(null), []);

  // Esc closes the card
  useEffect(() => {
    if (!selectedKey) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedKey, close]);

  const toggle = (key: string) => {
    const next = selectedKey === key ? null : key;
    setSelectedKey(next);

    // On phones the card opens under the row, so bring that row to the top of the screen
    if (next && window.matchMedia("(max-width: 1023px)").matches) {
      window.setTimeout(() => {
        rowRefs.current[next]?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    }
  };

  return (
    <section
      aria-labelledby="eras-heading"
      className={`mx-auto px-6 py-12 lg:px-8 ${
        selected
          ? "max-w-[90rem] lg:grid lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_36rem] 2xl:grid-cols-[minmax(0,1fr)_44rem]"
          : "max-w-6xl"
      }`}
    >
      <div>
        <h2 id="eras-heading" className="font-display text-2xl font-bold text-primary">
          Eras
        </h2>
        <p className="mb-5 mt-1 text-sm text-text/70">
          Select a year to open that president&apos;s legacy. Years are in Bikram Sambat (BS).
        </p>

        <ul className="flex flex-col gap-3">
          {eras.map((era) => {
            const isSelected = era.key === selectedKey;
            return (
              <li
                key={era.key}
                ref={(el) => {
                  rowRefs.current[era.key] = el;
                }}
                className="scroll-mt-20"
              >
                <button
                  type="button"
                  onClick={() => toggle(era.key)}
                  aria-expanded={isSelected}
                  className={`group flex w-full items-center gap-4 rounded-card-lg bg-white p-4 text-left shadow-sm ring-1 transition hover:shadow-md sm:gap-6 sm:p-5 ${
                    isSelected ? "ring-2 ring-accent" : "ring-primary/10"
                  }`}
                >
                  <div className="shrink-0 text-center">
                    <p className="font-display text-2xl font-black leading-none text-primary sm:text-3xl">
                      {era.academicYear}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                      BS
                    </p>
                  </div>

                  <span aria-hidden="true" className="h-10 w-px shrink-0 bg-primary/15" />

                  <Portrait era={era} size={48} className="bg-primary/10 text-primary/70" />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-base font-bold leading-snug text-primary sm:text-lg">
                        {era.presidentName}
                      </p>
                      {era.isCurrent && (
                        <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                          Current era
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm text-text/60">
                      {era.tagline ?? "President of NSS Clubs"}
                    </p>
                  </div>

                  {era.hasDetails && (
                    <p className="hidden shrink-0 text-right text-xs text-text/60 md:block">
                      <span className="font-bold text-primary">{era.eventsConductedCount}</span> events
                      <br />
                      <span className="font-bold text-primary">{era.interSchoolCount}</span>{" "}
                      inter-school
                    </p>
                  )}

                  <ChevronRight
                    aria-hidden="true"
                    className={`h-5 w-5 shrink-0 text-primary/50 transition-transform ${
                      isSelected ? "rotate-90 text-accent lg:rotate-0" : "group-hover:translate-x-0.5"
                    }`}
                  />
                </button>

                {/* Phones and tablets: the card opens right under the row */}
                {isSelected && (
                  <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300 lg:hidden">
                    <EraCard era={era} onClose={close} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Desktop: the card slides in on the right and follows you while you scroll */}
      {selected && (
        <aside
          aria-label={`${selected.presidentName}, ${selected.academicYear} legacy`}
          className="hidden lg:block"
        >
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-[2rem] shadow-2xl animate-in fade-in slide-in-from-right-8 duration-500">
            <EraCard era={selected} onClose={close} />
          </div>
        </aside>
      )}
    </section>
  );
}
