/**
 * Types for everything the site reads from Sanity.
 *
 * GROQ returns `null` (not undefined) for missing fields, so optional fields
 * are typed `| null`. That makes `x && urlFor(x)` narrow correctly.
 */

type Maybe<T> = T | null;

/** How Sanity stores images. */
export interface SanityImage {
  _type: "image";
  asset: {
    _type: "reference";
    _ref: string;
  };
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
}

/* ─── small shared pieces ─── */

export interface Stat {
  _key: string;
  _type: "stat";
  label: string;
  value: string;
}

export interface ClubRef {
  name: string;
  slug: string;
}

export interface EventRef {
  title: string;
  slug: string;
}

export interface TeamMember {
  _id: string;
  name: string;
  photo: Maybe<SanityImage>;
  gender: Maybe<"male" | "female">;
  grade: Maybe<string>;
  bio: Maybe<string>;
}

/* ─── homepage ─── */

export interface FeaturedEvent {
  _id: string;
  title: string;
  slug: Maybe<string>;
  eventDate: string;
  coverImage: Maybe<SanityImage>;
}

export interface FeaturedGalleryItem {
  _id: string;
  title: string;
  image: SanityImage;
}

export interface HomepageData {
  presidentMessage: string;
  presidentPhoto: Maybe<SanityImage>;
  legacyStats: Stat[];
  featuredEvents: FeaturedEvent[];
  featuredGallery: FeaturedGalleryItem[];
}

/* ─── clubs ─── */

export interface ClubHead {
  _id: string;
  name: string;
  photo: Maybe<SanityImage>;
  grade: Maybe<string>;
}

export interface ClubData {
  _id: string;
  name: string;
  slug: string;
  description: Maybe<string>;
  logo: Maybe<SanityImage>;
  heroImage: Maybe<SanityImage>;
  clubHeads: ClubHead[];
  viceHeads: ClubHead[];
  achievements: string[];
}

/* ─── gallery & albums ─── */

export interface GalleryItem {
  _id: string;
  title: string;
  image: SanityImage;
  isFeatured: boolean;
  club: Maybe<ClubRef>;
  event: Maybe<EventRef>;
}

/** A full photo album that lives on Google Drive (cover photo lives in Sanity). */
export interface Album {
  _id: string;
  title: string;
  driveUrl: string;
  coverImage: SanityImage;
  date: Maybe<string>;
  description: Maybe<string>;
  club: Maybe<ClubRef>;
  event: Maybe<EventRef>;
}

/* ─── events ─── */

export interface EventListItem {
  _id: string;
  title: string;
  slug: string;
  description: Maybe<string>;
  eventDate: string;
  registrationLink: Maybe<string>;
  coverImage: Maybe<SanityImage>;
  countdownEnabled: boolean;
  club: Maybe<ClubRef>;
}

export interface EventDetail extends EventListItem {
  gallery: Omit<GalleryItem, "club" | "event">[];
  albums: Omit<Album, "club" | "event">[];
}

export interface EventsSplit {
  /** Soonest first. */
  upcoming: EventListItem[];
  /** Most recent first. */
  past: EventListItem[];
}

/* ─── executive team ─── */

export interface ExecutiveMember {
  /** e.g. "President", "Vice Secretary" */
  role: string;
  person: TeamMember;
}

export interface ExecutiveBoard {
  _id: string;
  /** e.g. "2082/83" */
  year: string;
  /** Only roles that are actually filled, in display order. */
  members: ExecutiveMember[];
}