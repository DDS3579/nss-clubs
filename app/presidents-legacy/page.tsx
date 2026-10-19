import type { Metadata } from "next";
import Image from "next/image";
import ConstellationFooter from "@/components/layout/ConstellationFooter";
import PageHero from "@/components/pages/PageHero";
import { sanityCoverUrl } from "@/sanity/lib/imageMeta";
import {
  getPresidentLegacies,
  type Achievement,
  type PresidentLegacy,
} from "@/sanity/lib/presidentLegacy";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "President's Legacy | NSS Clubs",
  description:
    "The presidents who led NSS Clubs through the years, and what each of them achieved in their era.",
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function Portrait({
  legacy,
  px,
  className,
}: {
  legacy: PresidentLegacy;
  px: number;
  className: string;
}) {
  const { president } = legacy;
  return (
    <div
      className={`relative overflow-hidden rounded-full bg-primary/5 ring-4 ring-accent/40 ${className}`}
    >
      {president.photo ? (
        <Image
          src={sanityCoverUrl(president.photo, px * 2, px * 2)}
          alt={president.name}
          fill
          unoptimized
          sizes={`${px}px`}
          className="object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-full w-full items-center justify-center font-display text-2xl font-bold text-primary/60"
        >
          {initials(president.name)}
        </span>
      )}
    </div>
  );
}

function AchievementTimeline({ items }: { items: Achievement[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-text/70">Achievements will be added soon.</p>;
  }

  return (
    <ol className="relative space-y-6 border-l-2 border-accent/40 pl-6">
      {items.map((item) => (
        <li key={item._key} className="relative">
          <span
            aria-hidden="true"
            className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-accent ring-4 ring-white"
          />
          {item.date && (
            <p className="text-xs font-bold uppercase tracking-wider text-accent">{item.date}</p>
          )}
          <h4 className="font-display text-base font-bold text-primary">{item.title}</h4>
          {item.description && (
            <p className="mt-1 text-sm text-text/80">{item.description}</p>
          )}
          {item.image && (
            <div className="relative mt-3 aspect-[3/2] w-full max-w-sm overflow-hidden rounded-card bg-primary/5">
              <Image
                src={sanityCoverUrl(item.image, 720, 480)}
                alt={item.title}
                fill
                unoptimized
                sizes="(min-width: 640px) 384px, 100vw"
                className="object-cover"
              />
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

function CurrentPresident({ legacy }: { legacy: PresidentLegacy }) {
  const { president } = legacy;
  return (
    <article className="rounded-card-lg bg-white p-6 shadow-lg ring-1 ring-primary/5 sm:p-10">
      <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:text-left">
        <Portrait legacy={legacy} px={160} className="h-40 w-40 shrink-0" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            President · {legacy.academicYear}
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-primary sm:text-4xl">
            {president.name}
          </h2>
          {president.grade && <p className="mt-1 text-sm text-text/70">{president.grade}</p>}
          {legacy.tagline && (
            <p className="mt-3 text-lg font-medium text-text/80">{legacy.tagline}</p>
          )}
          {legacy.message && (
            <blockquote className="mt-4 border-l-4 border-accent/60 pl-4 text-left text-sm italic text-text/80">
              {legacy.message}
            </blockquote>
          )}
        </div>
      </div>

      <h3 className="mt-10 font-display text-xl font-bold text-primary">Achievements</h3>
      <div className="mt-5">
        <AchievementTimeline items={legacy.achievements} />
      </div>
    </article>
  );
}

function PastPresident({ legacy }: { legacy: PresidentLegacy }) {
  const count = legacy.achievements.length;
  return (
    <li>
      <details className="group rounded-card bg-white p-5 shadow-sm ring-1 ring-primary/5">
        <summary className="flex cursor-pointer list-none items-center gap-4 [&::-webkit-details-marker]:hidden">
          <Portrait legacy={legacy} px={56} className="h-14 w-14 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-bold text-primary">{legacy.president.name}</p>
            <p className="truncate text-sm text-text/60">
              {legacy.academicYear}
              {legacy.tagline ? ` · ${legacy.tagline}` : ""}
            </p>
          </div>
          <span className="shrink-0 text-sm font-medium text-text/60">
            {count} {count === 1 ? "achievement" : "achievements"}
          </span>
        </summary>

        <div className="mt-6">
          {legacy.message && (
            <blockquote className="mb-6 border-l-4 border-accent/60 pl-4 text-sm italic text-text/80">
              {legacy.message}
            </blockquote>
          )}
          <AchievementTimeline items={legacy.achievements} />
        </div>
      </details>
    </li>
  );
}

export default async function PresidentsLegacyPage() {
  const legacies = await getPresidentLegacies();
  const [current, ...past] = legacies;

  return (
    <>
      <main id="main-content">
        <PageHero
          eyebrow="Leadership through the years"
          title="President's Legacy"
          subtitle="The students who led NSS Clubs, and everything they achieved in their era."
        />

        <section aria-label="Current president" className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
          {current ? (
            <CurrentPresident legacy={current} />
          ) : (
            <p className="rounded-card bg-primary/5 px-6 py-8 text-center text-text/80">
              Our presidents&apos; legacies will appear here soon.
            </p>
          )}
        </section>

        {past.length > 0 && (
          <section aria-labelledby="past-presidents-heading" className="bg-slate-50 py-12">
            <div className="mx-auto max-w-4xl px-6 lg:px-8">
              <h2
                id="past-presidents-heading"
                className="font-display text-2xl font-bold text-primary"
              >
                Past presidents
              </h2>
              <ul className="mt-6 flex flex-col gap-3">
                {past.map((legacy) => (
                  <PastPresident key={legacy._id} legacy={legacy} />
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
      <ConstellationFooter />
    </>
  );
}
