import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, ExternalLink } from "lucide-react";
import Countdown from "@/components/events/Countdown";
import ConstellationFooter from "@/components/layout/ConstellationFooter";
import AlbumCard from "@/components/pages/AlbumCard";
import { isClubSlug } from "@/lib/clubs";
import { formatEventDate, formatEventTime, isUpcoming } from "@/lib/dates";
import { getEventBySlug, getEventSlugs } from "@/sanity/lib/queries";
import { sanityCoverUrl } from "@/sanity/lib/imageMeta";

export const revalidate = 60;

// Events added in Sanity after the last deploy are rendered on first visit, then cached.
export async function generateStaticParams() {
  const slugs = await getEventSlugs();
  return slugs.map((slug) => ({ slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return {};

  const description = event.description
    ? event.description.replace(/\s+/g, " ").trim().slice(0, 160)
    : `${event.title} by NSS Clubs on ${formatEventDate(event.eventDate)}.`;

  return {
    title: `${event.title} | NSS Clubs`,
    description,
    openGraph: {
      title: event.title,
      description,
      ...(event.coverImage
        ? { images: [{ url: sanityCoverUrl(event.coverImage, 1200, 630), width: 1200, height: 630 }] }
        : {}),
    },
  };
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const upcoming = isUpcoming(event.eventDate);
  const time = formatEventTime(event.eventDate);
  const registrationUrl =
    event.registrationLink && /^https?:\/\//.test(event.registrationLink)
      ? event.registrationLink
      : null;
  const showCountdown = event.countdownEnabled && upcoming;

  return (
    <>
      <main>
        {/* Banner */}
        <div className="relative h-56 bg-primary sm:h-80 lg:h-104">
          {event.coverImage && (
            <Image
              src={sanityCoverUrl(event.coverImage, 1600, 700)}
              alt=""
              fill
              priority
              unoptimized
              sizes="100vw"
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
        </div>

        <article className="relative mx-auto -mt-12 max-w-4xl px-6 pb-16 lg:px-8">
          <div className="rounded-card bg-white p-6 shadow-lg ring-1 ring-primary/5 sm:p-8">
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary/80 hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              All events
            </Link>

            {event.club && (
              <p className="mt-5">
                {isClubSlug(event.club.slug) ? (
                  <Link
                    href={`/clubs/${event.club.slug}`}
                    className="rounded-full bg-primary/5 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary hover:bg-primary/10"
                  >
                    {event.club.name}
                  </Link>
                ) : (
                  <span className="rounded-full bg-primary/5 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                    {event.club.name}
                  </span>
                )}
              </p>
            )}

            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              {event.title}
            </h1>

            <ul className="mt-5 flex flex-col gap-2 text-text sm:flex-row sm:flex-wrap sm:gap-x-6">
              <li className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="font-medium">{formatEventDate(event.eventDate)}</span>
              </li>
              {time && (
                <li className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
                  <span className="font-medium">{time}</span>
                </li>
              )}
            </ul>

            {showCountdown && (
              <div className="mt-6">
                <Countdown target={event.eventDate} />
              </div>
            )}

            {event.description && (
              <p className="mt-8 whitespace-pre-wrap text-base leading-relaxed text-text/90">
                {event.description}
              </p>
            )}

            {registrationUrl && upcoming && (
              <a
                href={registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-button bg-primary px-6 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-accent hover:text-primary active:scale-[0.98] sm:w-auto"
              >
                Register now
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
          </div>

          {event.albums.length > 0 && (
            <section aria-labelledby="albums-heading" className="mt-12">
              <h2 id="albums-heading" className="font-display text-2xl font-bold text-primary">
                Full album
              </h2>
              <ul className="mt-5 grid gap-6 sm:grid-cols-2">
                {event.albums.map((album) => (
                  <li key={album._id}>
                    <AlbumCard album={album} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {event.gallery.length > 0 && (
            <section aria-labelledby="photos-heading" className="mt-12">
              <div className="flex items-end justify-between gap-4">
                <h2 id="photos-heading" className="font-display text-2xl font-bold text-primary">
                  Photos from this event
                </h2>
                <Link href="/gallery" className="text-sm font-semibold text-primary hover:text-accent">
                  Open gallery
                </Link>
              </div>
              <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {event.gallery.slice(0, 12).map((photo) => (
                  <li key={photo._id} className="relative aspect-square overflow-hidden rounded-xl bg-primary/5">
                    <Image
                      src={sanityCoverUrl(photo.image, 500, 500)}
                      alt={photo.title}
                      fill
                      unoptimized
                      sizes="(min-width: 640px) 33vw, 50vw"
                      className="object-cover"
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      </main>
      <ConstellationFooter />
    </>
  );
}