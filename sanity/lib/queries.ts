import { cache } from "react";
import { groq } from "next-sanity";
import { sanityFetch } from "./fetch";
import { isUpcoming } from "@/lib/dates";
import type {
  Album,
  ClubData,
  ClubHead,
  EventDetail,
  EventListItem,
  EventsSplit,
  ExecutiveBoard,
  ExecutiveMember,
  FeaturedEvent,
  FeaturedGalleryItem,
  GalleryItem,
  HomepageData,
  SanityImage,
  Stat,
  TeamMember,
} from "./types";

/* ═══════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════ */

/**
 * Drops null/undefined entries. `someArray[]->{…}` returns `null` for any
 * reference whose target was deleted or never published — without this, a
 * single broken reference would crash the whole page.
 */
function compact<T>(list: (T | null | undefined)[] | null | undefined): T[] {
  return (list ?? []).filter((item): item is T => item != null);
}

// Reusable GROQ fragments
const CLUB_REF = `{ name, "slug": slug.current }`;
const EVENT_REF = `{ title, "slug": slug.current }`;
const MEMBER = `{ _id, name, photo, gender, grade, bio }`;

/* ═══════════════════════════════════════════════════════════
   Homepage
   ═══════════════════════════════════════════════════════════ */

export const homepageQuery = groq`*[_id == "homepage"][0]{
  presidentMessage,
  presidentPhoto,
  legacyStats,
  "featuredEvents": featuredEvents[]->{
    _id,
    title,
    "slug": slug.current,
    eventDate,
    coverImage
  },
  "featuredGallery": featuredGallery[]->{
    _id,
    title,
    image
  }
}`;

interface RawHomepage {
  presidentMessage: string | null;
  presidentPhoto: SanityImage | null;
  legacyStats: (Stat | null)[] | null;
  featuredEvents: (FeaturedEvent | null)[] | null;
  featuredGallery: ({ _id: string; title: string; image: SanityImage | null } | null)[] | null;
}

/** Always returns a complete object, even if the Homepage document isn't published yet. */
export async function getHomepageData(): Promise<HomepageData> {
  const raw = await sanityFetch<RawHomepage | null>({
    query: homepageQuery,
    tags: ["homepage", "event", "galleryItem"],
  });

  return {
    presidentMessage: raw?.presidentMessage ?? "",
    presidentPhoto: raw?.presidentPhoto ?? null,
    legacyStats: compact(raw?.legacyStats),
    featuredEvents: compact(raw?.featuredEvents),
    featuredGallery: compact(raw?.featuredGallery).filter(
      (item): item is FeaturedGalleryItem => item.image != null,
    ),
  };
}

/* ═══════════════════════════════════════════════════════════
   Clubs
   ═══════════════════════════════════════════════════════════ */

export const clubBySlugQuery = groq`*[_type == "club" && slug.current == $slug][0]{
  _id,
  name,
  "slug": slug.current,
  description,
  logo,
  heroImage,
  "clubHeads": clubHeads[]->{ _id, name, photo, grade },
  "viceHeads": viceHeads[]->{ _id, name, photo, grade },
  achievements
}`;

interface RawClub extends Omit<ClubData, "clubHeads" | "viceHeads" | "achievements"> {
  clubHeads: (ClubHead | null)[] | null;
  viceHeads: (ClubHead | null)[] | null;
  achievements: (string | null)[] | null;
}

/** `cache()` lets the page and generateMetadata share one request. */
export const getClubBySlug = cache(async (slug: string): Promise<ClubData | null> => {
  const raw = await sanityFetch<RawClub | null>({
    query: clubBySlugQuery,
    params: { slug },
    tags: ["club", "teamMember"],
  });
  if (!raw) return null;
  return {
    ...raw,
    clubHeads: compact(raw.clubHeads),
    viceHeads: compact(raw.viceHeads),
    achievements: compact(raw.achievements),
  };
});

/* ═══════════════════════════════════════════════════════════
   Events
   ═══════════════════════════════════════════════════════════ */

const EVENT_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  description,
  eventDate,
  registrationLink,
  coverImage,
  countdownEnabled,
  "club": associatedClub->${CLUB_REF}
`;

export const eventsQuery = groq`*[_type == "event" && defined(slug.current) && defined(eventDate)]
  | order(eventDate desc){ ${EVENT_FIELDS} }`;

interface RawEvent extends Omit<EventListItem, "countdownEnabled"> {
  countdownEnabled: boolean | null;
}

function toEventListItem(raw: RawEvent): EventListItem {
  return { ...raw, countdownEnabled: raw.countdownEnabled ?? false };
}

/** All events, split into upcoming (soonest first) and past (newest first). */
export async function getEvents(): Promise<EventsSplit> {
  const raw = await sanityFetch<(RawEvent | null)[] | null>({
    query: eventsQuery,
    tags: ["event", "club"],
  });
  const events = compact(raw).map(toEventListItem);
  const now = new Date();
  return {
    upcoming: events.filter((e) => isUpcoming(e.eventDate, now)).reverse(),
    past: events.filter((e) => !isUpcoming(e.eventDate, now)),
  };
}

export const eventBySlugQuery = groq`*[_type == "event" && slug.current == $slug][0]{
  ${EVENT_FIELDS},
  "gallery": *[_type == "galleryItem" && associatedEvent._ref == ^._id && defined(image.asset)]
    | order(_createdAt desc){ _id, title, image, isFeatured },
  "albums": *[_type == "album" && associatedEvent._ref == ^._id && defined(driveUrl)]
    | order(coalesce(date, _createdAt) desc){ _id, title, driveUrl, coverImage, date, description }
}`;

interface RawEventDetail extends RawEvent {
  gallery: (EventDetail["gallery"][number] | null)[] | null;
  albums: (EventDetail["albums"][number] | null)[] | null;
}

export const getEventBySlug = cache(async (slug: string): Promise<EventDetail | null> => {
  const raw = await sanityFetch<RawEventDetail | null>({
    query: eventBySlugQuery,
    params: { slug },
    tags: ["event", "club", "galleryItem", "album"],
  });
  if (!raw) return null;
  return {
    ...toEventListItem(raw),
    gallery: compact(raw.gallery),
    albums: compact(raw.albums),
  };
});

export const eventSlugsQuery = groq`*[_type == "event" && defined(slug.current)].slug.current`;

/** For generateStaticParams on /events/[slug]. */
export async function getEventSlugs(): Promise<string[]> {
  const raw = await sanityFetch<(string | null)[] | null>({
    query: eventSlugsQuery,
    tags: ["event"],
  });
  return compact(raw);
}

/* ═══════════════════════════════════════════════════════════
   Gallery & albums
   ═══════════════════════════════════════════════════════════ */

export const galleryQuery = groq`*[_type == "galleryItem" && defined(image.asset)]
  | order(_createdAt desc)[0...$limit]{
  _id,
  title,
  image,
  isFeatured,
  "club": associatedClub->${CLUB_REF},
  "event": associatedEvent->${EVENT_REF}
}`;

interface RawGalleryItem extends Omit<GalleryItem, "isFeatured"> {
  isFeatured: boolean | null;
}

/** Newest photos first. `limit` keeps the page light until we add "load more". */
export async function getGallery(limit = 120): Promise<GalleryItem[]> {
  const raw = await sanityFetch<(RawGalleryItem | null)[] | null>({
    query: galleryQuery,
    params: { limit },
    tags: ["galleryItem", "club", "event"],
  });
  return compact(raw).map((item) => ({ ...item, isFeatured: item.isFeatured ?? false }));
}

export const albumsQuery = groq`*[_type == "album" && defined(driveUrl) && defined(coverImage.asset)]
  | order(coalesce(date, _createdAt) desc){
  _id,
  title,
  driveUrl,
  coverImage,
  date,
  description,
  "club": associatedClub->${CLUB_REF},
  "event": associatedEvent->${EVENT_REF}
}`;

/** Full albums stored on Google Drive (needs the `album` document type in Sanity). */
export async function getAlbums(): Promise<Album[]> {
  const raw = await sanityFetch<(Album | null)[] | null>({
    query: albumsQuery,
    tags: ["album", "club", "event"],
  });
  return compact(raw);
}

/* ═══════════════════════════════════════════════════════════
   Executive team
   ═══════════════════════════════════════════════════════════ */

/** Display order and labels. Reorder or rename here and the page follows. */
export const EXECUTIVE_ROLES = [
  { key: "president", label: "President" },
  { key: "vicePresident1", label: "Vice President" },
  { key: "vicePresident2", label: "Vice President" },
  { key: "secretary", label: "Secretary" },
  { key: "viceSecretary", label: "Vice Secretary" },
  { key: "treasurer", label: "Treasurer" },
  { key: "viceTreasurer", label: "Vice Treasurer" },
  { key: "advisor", label: "Advisor" },
] as const;

export const executiveTeamsQuery = groq`*[_type == "executiveTeam"] | order(year desc){
  _id,
  year,
  "president": president->${MEMBER},
  "vicePresident1": vicePresident1->${MEMBER},
  "vicePresident2": vicePresident2->${MEMBER},
  "secretary": secretary->${MEMBER},
  "viceSecretary": viceSecretary->${MEMBER},
  "treasurer": treasurer->${MEMBER},
  "viceTreasurer": viceTreasurer->${MEMBER},
  "advisor": advisor->${MEMBER}
}`;

type RawExecutiveBoard = {
  _id: string;
  year: string;
} & Record<(typeof EXECUTIVE_ROLES)[number]["key"], TeamMember | null>;

/**
 * Every board, newest academic year first (index 0 is the current board).
 * Roles nobody fills are left out instead of rendering empty cards.
 */
export async function getExecutiveBoards(): Promise<ExecutiveBoard[]> {
  const raw = await sanityFetch<(RawExecutiveBoard | null)[] | null>({
    query: executiveTeamsQuery,
    tags: ["executiveTeam", "teamMember"],
  });

  return compact(raw).map((board) => ({
    _id: board._id,
    year: board.year,
    members: EXECUTIVE_ROLES.flatMap<ExecutiveMember>((role) => {
      const person = board[role.key];
      return person ? [{ role: role.label, person }] : [];
    }),
  }));
}