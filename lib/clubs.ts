/**
 * Single source of truth for the six clubs + the Executive Team.
 *
 * Before: this data was repeated in HeroAtom (CLUB_MAPPING, hover slugs),
 * HomeScrollExperience (CLUBS_DETAILS, ROTATION_OFFSETS) and elsewhere.
 * Now every component imports from here.
 *
 * Content that comes from Sanity (heads, achievements, events, photos) stays
 * in Sanity. This file only holds what the atom animation and the zoom
 * screens need to know before any network request.
 *
 * ⚠ The `stats` numbers are PLACEHOLDERS until real ones are provided.
 */

import { degToRad } from "./math";

export type ClubSlug =
  | "stem"
  | "sports"
  | "literature"
  | "arts"
  | "entertainment"
  | "social";

export type NodeSlug = ClubSlug | "executive-team";

export type ClubIconName =
  | "Terminal"
  | "Trophy"
  | "BookOpen"
  | "Palette"
  | "Music"
  | "Heart"
  | "Shield";

export interface ClubStat {
  label: string;
  value: string;
}

export interface ClubNode {
  slug: NodeSlug;
  name: string;
  tagline: string;
  color: string;
  category: string;
  iconName: ClubIconName;
  themes: readonly string[];
  /** PLACEHOLDER numbers — replace with real ones. */
  stats: readonly ClubStat[];
  isSpecial?: boolean;
}

export interface Club extends ClubNode {
  slug: ClubSlug;
  /** Which of the 3 atom orbits this club's electron travels on (0-2). */
  orbitIdx: 0 | 1 | 2;
  /** Which of the 2 electrons on that orbit (0 or 1). */
  electronIdx: 0 | 1;
}

/** Tilt of each atom orbit in degrees. Used by the atom drawing and zoom maths. */
export const ORBIT_ANGLES_DEG = [-60, 0, 60] as const;

export const CLUBS: readonly Club[] = [
  {
    slug: "stem",
    name: "STEM Club",
    tagline:
      "Innovate, build, and explore the frontiers of science, coding, and technology.",
    color: "#0284c7",
    category: "Science & Technology",
    iconName: "Terminal",
    themes: ["Science", "Tech", "Engineering", "Math"],
    stats: [
      { label: "Members", value: "120+" },
      { label: "Meetings", value: "Weekly" },
      { label: "Activity", value: "High" },
    ],
    orbitIdx: 0,
    electronIdx: 0,
  },
  {
    slug: "sports",
    name: "Sports Club",
    tagline:
      "Unleash your athletic potential, embrace teamwork, and chase victory.",
    color: "#f59e0b",
    category: "Athletics & Health",
    iconName: "Trophy",
    themes: ["Athletics", "Teamwork", "Tournaments", "Fitness"],
    stats: [
      { label: "Members", value: "200+" },
      { label: "Meetings", value: "Bi-Weekly" },
      { label: "Activity", value: "Very High" },
    ],
    orbitIdx: 0,
    electronIdx: 1,
  },
  {
    slug: "literature",
    name: "Literature Club",
    tagline:
      "Celebrate the power of words, creative writing, poetry, and deep debates.",
    color: "#10b981",
    category: "Arts & Letters",
    iconName: "BookOpen",
    themes: ["Creative Writing", "Poetry", "Debate", "Storytelling"],
    stats: [
      { label: "Members", value: "80+" },
      { label: "Meetings", value: "Weekly" },
      { label: "Activity", value: "Active" },
    ],
    orbitIdx: 1,
    electronIdx: 0,
  },
  {
    slug: "arts",
    name: "Arts & Craft Club",
    tagline:
      "Express yourself visually through beautiful paintings, sketches, and manual crafts.",
    color: "#f43f5e",
    category: "Creative & Design",
    iconName: "Palette",
    themes: ["Painting", "Crafts", "Sketching", "Design"],
    stats: [
      { label: "Members", value: "90+" },
      { label: "Meetings", value: "Weekly" },
      { label: "Activity", value: "Active" },
    ],
    orbitIdx: 1,
    electronIdx: 1,
  },
  {
    slug: "entertainment",
    name: "Entertainment Club",
    tagline: "Bring joy, music, dance, and theater to the main stage of NSS.",
    color: "#8b5cf6",
    category: "Performing Arts",
    iconName: "Music",
    themes: ["Music", "Dance", "Theater", "Production"],
    stats: [
      { label: "Members", value: "150+" },
      { label: "Meetings", value: "Multi-Weekly" },
      { label: "Activity", value: "Very High" },
    ],
    orbitIdx: 2,
    electronIdx: 0,
  },
  {
    slug: "social",
    name: "Social Club",
    tagline:
      "Make a positive impact on society through volunteering, empathy, and social work.",
    color: "#0d9488",
    category: "Community Service",
    iconName: "Heart",
    themes: ["Volunteering", "Social Work", "Charity", "Community"],
    stats: [
      { label: "Members", value: "250+" },
      { label: "Meetings", value: "Monthly" },
      { label: "Activity", value: "High" },
    ],
    orbitIdx: 2,
    electronIdx: 1,
  },
];

/** The nucleus of the atom. */
export const EXECUTIVE_TEAM: ClubNode = {
  slug: "executive-team",
  name: "Executive Team",
  tagline:
    "Meet the visionary leaders, advisors, and coordinators steering the NSS Clubs towards excellence and impact.",
  color: "#D4A373",
  category: "Governance & Operations",
  iconName: "Shield",
  themes: ["Leadership", "Strategy", "Advising", "Operations"],
  stats: [
    { label: "Officers", value: "15" },
    { label: "Meetings", value: "Weekly" },
    { label: "Activity", value: "Continuous" },
  ],
  isSpecial: true,
};

/** Everything clickable on the atom: six clubs, then the nucleus. */
export const ALL_NODES: readonly ClubNode[] = [...CLUBS, EXECUTIVE_TEAM];

export const NODE_SLUGS: readonly NodeSlug[] = ALL_NODES.map((n) => n.slug);

const NODE_BY_SLUG = new Map<string, ClubNode>(ALL_NODES.map((n) => [n.slug, n]));

export function getNode(slug: string): ClubNode | undefined {
  return NODE_BY_SLUG.get(slug);
}

export function isClubSlug(slug: string): slug is ClubSlug {
  return CLUBS.some((c) => c.slug === slug);
}

/** Looks up the club riding a given electron slot on the atom. */
export function getClubAtSlot(orbitIdx: number, electronIdx: number): Club | undefined {
  return CLUBS.find((c) => c.orbitIdx === orbitIdx && c.electronIdx === electronIdx);
}

/**
 * Angle (radians) the atom must rotate during the zoom so the chosen club's
 * electron ends up on the horizontal axis. Derived from the orbit tilt, and
 * matches the old hand-written ROTATION_OFFSETS table exactly
 * (stem 60°, sports -120°, literature 0, arts 180°, entertainment -60°, social 120°).
 */
export function getZoomRotation(slug: NodeSlug): number {
  if (slug === "executive-team") return 0;
  const club = CLUBS.find((c) => c.slug === slug);
  if (!club) return 0;
  const tilt = ORBIT_ANGLES_DEG[club.orbitIdx];
  let deg = -tilt + (club.electronIdx === 1 ? 180 : 0);
  if (deg > 180) deg -= 360;
  return degToRad(deg);
}