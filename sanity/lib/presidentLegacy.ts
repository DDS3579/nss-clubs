import { groq } from "next-sanity";
import { sanityFetch } from "./fetch";
import type { SanityImage, TeamMember } from "./types";

type Maybe<T> = T | null;

/** Same shape the rest of the site uses for a person. */
const MEMBER = `{ _id, name, photo, gender, grade, bio }`;

/** Drops null entries (a deleted or unpublished reference comes back as null). */
function compact<T>(list: (T | null | undefined)[] | null | undefined): T[] {
  return (list ?? []).filter((item): item is T => item != null);
}

export interface Achievement {
  _key: string;
  title: string;
  description: Maybe<string>;
  date: Maybe<string>;
  image: Maybe<SanityImage>;
}

export interface PresidentLegacy {
  _id: string;
  /** e.g. "2082/83" */
  academicYear: string;
  tagline: Maybe<string>;
  message: Maybe<string>;
  president: TeamMember;
  achievements: Achievement[];
}

const presidentLegaciesQuery = groq`*[_type == "presidentLegacy"] | order(academicYear desc){
  _id,
  academicYear,
  tagline,
  message,
  "president": president->${MEMBER},
  "achievements": achievements[]{ _key, title, description, date, image }
}`;

interface RawPresidentLegacy {
  _id: string;
  academicYear: string;
  tagline: Maybe<string>;
  message: Maybe<string>;
  president: Maybe<TeamMember>;
  achievements: (Achievement | null)[] | null;
}

/** Newest era first (index 0 is the current president). */
export async function getPresidentLegacies(): Promise<PresidentLegacy[]> {
  const raw = await sanityFetch<(RawPresidentLegacy | null)[] | null>({
    query: presidentLegaciesQuery,
    tags: ["presidentLegacy", "teamMember"],
  });

  return compact(raw).flatMap<PresidentLegacy>((item) =>
    item.president
      ? [
          {
            _id: item._id,
            academicYear: item.academicYear,
            tagline: item.tagline,
            message: item.message,
            president: item.president,
            achievements: compact(item.achievements),
          },
        ]
      : [],
  );
}
