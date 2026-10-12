import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import ClubIcon from "@/components/home/ClubIcon";
import ConstellationFooter from "@/components/layout/ConstellationFooter";
import EventCard from "@/components/pages/EventCard";
import { CLUBS, EXECUTIVE_TEAM } from "@/lib/clubs";
import { sanityCoverUrl } from "@/sanity/lib/imageMeta";
import { getClubBySlug } from "@/sanity/lib/queries";
import { getClubEvents, getClubPhotos } from "@/sanity/lib/clubQueries";
import type { ClubHead } from "@/sanity/lib/types";

export const revalidate = 60;

// Only the six real clubs exist. Any other /clubs/whatever returns a proper 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return CLUBS.map((club) => ({ slug: club.slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const club = CLUBS.find((c) => c.slug === slug);
  if (!club) return {};

  const data = await getClubBySlug(slug);
  const description = data?.description?.replace(/\s+/g, " ").trim().slice(0, 160) || club.tagline;

  return {
    title: `${club.name} | NSS Clubs`,
    description,
    openGraph: {
      title: club.name,
      description,
      ...(data?.heroImage
        ? { images: [{ url: sanityCoverUrl(data.heroImage, 1200, 630), width: 1200, height: 630 }] }
        : {}),
    },
  };
}

function SectionHeading({ id, color, children }: { id: string; color: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="flex items-center gap-3 font-display text-2xl font-bold text-primary sm:text-3xl">
      <span aria-hidden="true" className="h-7 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {children}
    </h2>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function PersonCard({ person, role, color }: { person: ClubHead; role: string; color: string }) {
  return (
    <li className="flex items-center gap-4 rounded-card bg-white p-4 shadow-md ring-1 ring-primary/5">
      <div
        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-primary/5 ring-2"
        style={{ "--tw-ring-color": color } as CSSProperties}
      >
        {person.photo ? (
          <Image
            src={sanityCoverUrl(person.photo, 160, 160)}
            alt={person.name}
            fill
            unoptimized
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center font-display text-lg font-bold text-primary/60"
          >
            {initials(person.name)}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate font-display text-base font-bold text-primary">{person.name}</p>
        <p className="text-sm text-text/70">{[role, person.grade].filter(Boolean).join(" · ")}</p>
      </div>
    </li>
  );
}

export default async function ClubPage({ params }: PageProps) {
  const { slug } = await params;

  const club = CLUBS.find((c) => c.slug === slug);
  if (!club) notFound();

  // Each piece falls back gracefully if Sanity has nothing for this club yet
  const [data, events, photos] = await Promise.all([
    getClubBySlug(slug),
    getClubEvents(slug),
    getClubPhotos(slug, 8),
  ]);

  const name = data?.name ?? club.name;
  const description = data?.description || club.tagline;
  const achievements = data?.achievements ?? [];
  const leaders = [
    ...(data?.clubHeads ?? []).map((person) => ({ person, role: "Club Head" })),
    ...(data?.viceHeads ?? []).map((person) => ({ person, role: "Vice Head" })),
  ];

  const showingUpcoming = events.upcoming.length > 0;
  const shownEvents = showingUpcoming ? events.upcoming : events.past;

  const index = CLUBS.indexOf(club);
  const previous = CLUBS[(index - 1 + CLUBS.length) % CLUBS.length];
  const next = CLUBS[(index + 1) % CLUBS.length];

  return (
    <>
      <main id="main-content" className="bg-slate-50">
        {/* ═══ Hero: dark brand background, the club colour as an accent (always readable) ═══ */}
        <section className="relative isolate overflow-hidden bg-[#011f5b] text-white">
          {data?.heroImage && (
            <Image
              src={sanityCoverUrl(data.heroImage, 1600, 800)}
              alt=""
              fill
              priority
              unoptimized
              sizes="100vw"
              className="-z-20 object-cover opacity-35"
            />
          )}
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full opacity-40 blur-3xl"
            style={{ backgroundColor: club.color }}
          />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-b from-[#011f5b]/40 to-[#011f5b]" />

          <div className="mx-auto max-w-6xl px-6 pb-14 pt-8 sm:pb-20 lg:px-8 lg:pb-24">
            <Link
              href="/#clubs"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-white/85 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              All clubs
            </Link>

            <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
              <div
                className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-white/10 ring-2 backdrop-blur-sm sm:h-28 sm:w-28"
                style={{ "--tw-ring-color": club.color } as CSSProperties}
              >
                {data?.logo ? (
                  <Image
                    src={sanityCoverUrl(data.logo, 224, 224)}
                    alt={`${name} logo`}
                    fill
                    unoptimized
                    sizes="112px"
                    className="object-contain p-3"
                  />
                ) : (
                  <ClubIcon name={club.iconName} className="h-10 w-10 text-white" />
                )}
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">{club.category}</p>
                <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {name}
                </h1>
                <p className="mt-3 max-w-2xl text-base text-white/85 sm:text-lg">{club.tagline}</p>
              </div>
            </div>

            <ul className="mt-8 flex flex-wrap gap-2" aria-label="What this club is about">
              {club.themes.map((theme) => (
                <li
                  key={theme}
                  className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white ring-1 ring-white/15"
                >
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: club.color }}
                  />
                  {theme}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#events"
                className="inline-flex min-h-12 items-center justify-center rounded-button bg-white px-6 text-sm font-semibold text-primary shadow-md transition hover:bg-accent"
              >
                See events
              </a>
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center justify-center rounded-button px-6 text-sm font-semibold text-white ring-1 ring-white/40 transition hover:bg-white/10"
              >
                Join this club
              </Link>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl space-y-16 px-6 py-14 lg:px-8 lg:py-20">
          {/* ═══ About ═══ */}
          <section aria-labelledby="about-heading">
            <SectionHeading id="about-heading" color={club.color}>
              About the club
            </SectionHeading>
            <p className="mt-5 max-w-3xl whitespace-pre-wrap text-lg leading-relaxed text-text/90">
              {description}
            </p>
          </section>

          {/* ═══ Leadership ═══ */}
          {leaders.length > 0 && (
            <section aria-labelledby="leadership-heading">
              <SectionHeading id="leadership-heading" color={club.color}>
                Leadership
              </SectionHeading>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {leaders.map(({ person, role }) => (
                  <PersonCard key={`${role}-${person._id}`} person={person} role={role} color={club.color} />
                ))}
              </ul>
            </section>
          )}

          {/* ═══ Achievements ═══ */}
          {achievements.length > 0 && (
            <section aria-labelledby="achievements-heading">
              <SectionHeading id="achievements-heading" color={club.color}>
                Achievements
              </SectionHeading>
              <ul className="mt-6 grid gap-3 md:grid-cols-2">
                {achievements.map((achievement, i) => (
                  <li
                    key={`${i}-${achievement}`}
                    className="flex items-start gap-3 rounded-card bg-white p-4 shadow-sm ring-1 ring-primary/5"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: club.color }}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-text/90">{achievement}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ═══ Events ═══ */}
          <section id="events" aria-labelledby="events-heading" className="scroll-mt-20">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <SectionHeading id="events-heading" color={club.color}>
                {showingUpcoming ? "Upcoming events" : "Recent events"}
              </SectionHeading>
              <Link
                href="/events"
                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary hover:text-accent"
              >
                All events
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            {shownEvents.length > 0 ? (
              <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {shownEvents.map((event) => (
                  <li key={event._id}>
                    <EventCard event={event} past={!showingUpcoming} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 rounded-card bg-primary/5 px-6 py-8 text-center text-text/80">
                No events yet for this club. Check back soon.
              </p>
            )}
          </section>

          {/* ═══ Photos ═══ */}
          {photos.length > 0 && (
            <section aria-labelledby="photos-heading">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <SectionHeading id="photos-heading" color={club.color}>
                  From the club
                </SectionHeading>
                <Link
                  href="/gallery"
                  className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary hover:text-accent"
                >
                  Open gallery
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {photos.map((photo) => (
                  <li
                    key={photo._id}
                    className="relative aspect-square overflow-hidden rounded-xl bg-primary/5"
                  >
                    <Image
                      src={sanityCoverUrl(photo.image, 500, 500)}
                      alt={photo.title}
                      fill
                      unoptimized
                      sizes="(min-width: 640px) 25vw, 50vw"
                      className="object-cover"
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ═══ Other clubs ═══ */}
          <section aria-labelledby="more-heading">
            <SectionHeading id="more-heading" color={club.color}>
              Explore more
            </SectionHeading>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[previous, next].map((other, i) => (
                <li key={other.slug}>
                  <Link
                    href={`/clubs/${other.slug}`}
                    className="group flex h-full min-h-20 items-center gap-3 rounded-card bg-white p-4 text-text shadow-md ring-1 ring-primary/5 transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: other.color }}
                      aria-hidden="true"
                    >
                      <ClubIcon name={other.iconName} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold uppercase tracking-wide text-text/60">
                        {i === 0 ? "Previous club" : "Next club"}
                      </span>
                      <span className="block truncate font-display text-base font-bold text-primary">
                        {other.name}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
              <li className="sm:col-span-2">
                <Link
                  href="/executive-team"
                  className="flex min-h-14 items-center justify-between gap-3 rounded-card bg-primary p-4 text-white shadow-md transition hover:bg-primary/90"
                >
                  <span className="font-display text-base font-bold">Meet the {EXECUTIVE_TEAM.name}</span>
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </main>
      <ConstellationFooter />
    </>
  );
}