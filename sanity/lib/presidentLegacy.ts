import { groq } from "next-sanity";
import { sanityFetch } from "./fetch";
import type { SanityImage, TeamMember } from "./types";

type Maybe<T> = T | null;

/**
 * The three eras that always show on the page (Bikram Sambat years).
 * Used until a "President's Legacy" document exists in Sanity for that year.
 * Change the names here if you like; Sanity data always wins.
 */
const SEED_ERAS = [
  { academicYear: "2082/83", presidentName: "Divya Darsheel Sharma" },
  { academicYear: "2081/82", presidentName: "Name to be added" },
  { academicYear: "2080/81", presidentName: "Name to be added" },
];

/** Same shape the rest of the site uses for a person. */
const MEMBER = `{ _id, name, photo, gender, grade, bio }`;

/** Drops null entries (a deleted or unpublished reference comes back as null). */
function compact<T>(list: (T | null | undefined)[] | null | undefined): T[] {
  return (list ?? []).filter((item): item is T => item != null);
}

function cleanStrings(list: Maybe<string[]> | undefined): string[] {
  return compact(list)
    .map((text) => text.trim())
    .filter(Boolean);
}

export interface Achievement {
  _key: string;
  title: string;
  description: Maybe<string>;
  date: Maybe<string>;
  image: Maybe<SanityImage>;
}

export interface LegacyEvent {
  _key: string;
  title: string;
  date: Maybe<string>;
  description: Maybe<string>;
}

export interface LegacyInterSchoolEvent {
  _key: string;
  title: string;
  host: Maybe<string>;
  date: Maybe<string>;
  result: Maybe<string>;
}

export interface LegacyEra {
  /** e.g. "2082/83" (Bikram Sambat) */
  academicYear: string;
  /** true only for the newest era */
  isCurrent: boolean;
  /** false for placeholder eras that have no Sanity document yet */
  hasDetails: boolean;
  presidentName: string;
  grade: Maybe<string>;
  photo: Maybe<SanityImage>;
  tagline: Maybe<string>;
  message: Maybe<string>;
  eventsConductedCount: number;
  eventsConductedPlus: boolean;
  interSchoolCount: number;
  peakAchievements: string[];
  achievements: Achievement[];
  reforms: string[];
  eventsConducted: LegacyEvent[];
  interSchoolEvents: LegacyInterSchoolEvent[];
}

const legacyErasQuery = groq`*[_type == "presidentLegacy"] | order(academicYear desc){
  _id,
  academicYear,
  tagline,
  message,
  eventsConductedCount,
  eventsConductedPlus,
  interSchoolCount,
  peakAchievements,
  reforms,
  "president": president->${MEMBER},
  "achievements": achievements[]{ _key, title, description, date, image },
  "eventsConducted": eventsConducted[]{ _key, title, date, description },
  "interSchoolEvents": interSchoolEvents[]{ _key, title, host, date, result }
}`;

interface RawEra {
  _id: string;
  academicYear: string;
  tagline: Maybe<string>;
  message: Maybe<string>;
  eventsConductedCount: Maybe<number>;
  eventsConductedPlus: Maybe<boolean>;
  interSchoolCount: Maybe<number>;
  peakAchievements: Maybe<string[]>;
  reforms: Maybe<string[]>;
  president: Maybe<TeamMember>;
  achievements: Maybe<(Achievement | null)[]>;
  eventsConducted: Maybe<(LegacyEvent | null)[]>;
  interSchoolEvents: Maybe<(LegacyInterSchoolEvent | null)[]>;
}

/** Every era, newest first (index 0 is the current president). Always includes the 3 seed eras. */
export async function getLegacyEras(): Promise<LegacyEra[]> {
  const raw = await sanityFetch<(RawEra | null)[] | null>({
    query: legacyErasQuery,
    tags: ["presidentLegacy", "teamMember"],
  });

  const byYear = new Map<string, LegacyEra>();

  for (const item of compact(raw)) {
    if (!item.president) continue;
    const eventsConducted = compact(item.eventsConducted);
    const interSchoolEvents = compact(item.interSchoolEvents);

    byYear.set(item.academicYear, {
      academicYear: item.academicYear,
      isCurrent: false,
      hasDetails: true,
      presidentName: item.president.name,
      grade: item.president.grade,
      photo: item.president.photo,
      tagline: item.tagline,
      message: item.message,
      eventsConductedCount: item.eventsConductedCount ?? eventsConducted.length,
      eventsConductedPlus: item.eventsConductedPlus ?? false,
      interSchoolCount: item.interSchoolCount ?? interSchoolEvents.length,
      peakAchievements: cleanStrings(item.peakAchievements),
      achievements: compact(item.achievements),
      reforms: cleanStrings(item.reforms),
      eventsConducted,
      interSchoolEvents,
    });
  }

  for (const seed of SEED_ERAS) {
    if (byYear.has(seed.academicYear)) continue;
    byYear.set(seed.academicYear, {
      academicYear: seed.academicYear,
      isCurrent: false,
      hasDetails: false,
      presidentName: seed.presidentName,
      grade: null,
      photo: null,
      tagline: null,
      message: null,
      eventsConductedCount: 0,
      eventsConductedPlus: false,
      interSchoolCount: 0,
      peakAchievements: [],
      achievements: [],
      reforms: [],
      eventsConducted: [],
      interSchoolEvents: [],
    });
  }

  const eras = [...byYear.values()].sort((a, b) => b.academicYear.localeCompare(a.academicYear));
  return eras.map((era, index) => ({ ...era, isCurrent: index === 0 }));
}
