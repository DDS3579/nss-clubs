import { groq } from "next-sanity";
import { sanityFetch } from "./fetch";
import { isUpcoming } from "@/lib/dates";
import type { EventListItem, SanityImage } from "./types";

/**
 * Extra data for the individual club pages: the club's own events and photos.
 * (Kept in its own file so queries.ts stays untouched.)
 */

export interface ClubPhoto {
  _id: string;
  title: string;
  image: SanityImage;
}

function compact<T>(list: (T | null | undefined)[] | null | undefined): T[] {
  return (list ?? []).filter((item): item is T => item != null);
}

const clubEventsQuery = groq`*[_type == "event"
  && associatedClub->slug.current == $slug
  && defined(slug.current)
  && defined(eventDate)] | order(eventDate desc){
  _id,
  title,
  "slug": slug.current,
  description,
  eventDate,
  registrationLink,
  coverImage,
  countdownEnabled,
  "club": associatedClub->{ name, "slug": slug.current }
}`;

type RawEvent = Omit<EventListItem, "countdownEnabled"> & { countdownEnabled: boolean | null };

/** The club's events: upcoming (soonest first) and past (newest first). */
export async function getClubEvents(
  slug: string,
  limit = 3,
): Promise<{ upcoming: EventListItem[]; past: EventListItem[] }> {
  const raw = await sanityFetch<(RawEvent | null)[] | null>({
    query: clubEventsQuery,
    params: { slug },
    tags: ["event", "club"],
  });
  const events = compact(raw).map((e) => ({ ...e, countdownEnabled: e.countdownEnabled ?? false }));
  const now = new Date();
  return {
    upcoming: events.filter((e) => isUpcoming(e.eventDate, now)).reverse().slice(0, limit),
    past: events.filter((e) => !isUpcoming(e.eventDate, now)).slice(0, limit),
  };
}

const clubPhotosQuery = groq`*[_type == "galleryItem"
  && associatedClub->slug.current == $slug
  && defined(image.asset)] | order(_createdAt desc)[0...$limit]{
  _id,
  title,
  image
}`;

/** The newest photos tagged with this club. */
export async function getClubPhotos(slug: string, limit = 8): Promise<ClubPhoto[]> {
  const raw = await sanityFetch<(ClubPhoto | null)[] | null>({
    query: clubPhotosQuery,
    params: { slug, limit },
    tags: ["galleryItem", "club"],
  });
  return compact(raw);
}