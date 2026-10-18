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

export interface ItMember {
  _id: string;
  roleTitle: string;
  isLead: boolean;
  skills: string[];
  githubUrl: Maybe<string>;
  linkedinUrl: Maybe<string>;
  person: TeamMember;
}

export interface ItProject {
  _id: string;
  title: string;
  summary: Maybe<string>;
  coverImage: Maybe<SanityImage>;
  techStack: string[];
  projectUrl: Maybe<string>;
  githubUrl: Maybe<string>;
  /** "YYYY-MM-DD" */
  date: Maybe<string>;
  contributors: { _id: string; name: string }[];
}

export interface ItTeamData {
  tagline: string;
  intro: string;
  mission: string;
  members: ItMember[];
  projects: ItProject[];
}

/** Shown until someone fills in "IT Team Page Text" in the Studio. */
const DEFAULT_TAGLINE =
  "A specialized team of digital innovators representing the IT sector of NSS.";
const DEFAULT_INTRO =
  "We are the NSS IT Team: students who love technology and use it to build science projects, tools and digital experiences for the whole NSS community.";
const DEFAULT_MISSION =
  "To turn curiosity into working technology, and to help every NSS club do more with digital tools.";

const itTeamQuery = groq`{
  "page": *[_id == "itTeamPage"][0]{ tagline, intro, mission },
  "members": *[_type == "itTeamMember"] | order(coalesce(isLead, false) desc, coalesce(displayOrder, 999) asc, _createdAt asc){
    _id,
    roleTitle,
    isLead,
    skills,
    githubUrl,
    linkedinUrl,
    "person": member->${MEMBER}
  },
  "projects": *[_type == "itProject"] | order(coalesce(date, _createdAt) desc){
    _id,
    title,
    summary,
    coverImage,
    techStack,
    projectUrl,
    githubUrl,
    date,
    "contributors": contributors[]->{ _id, name }
  }
}`;

interface RawItTeam {
  page: Maybe<{ tagline: Maybe<string>; intro: Maybe<string>; mission: Maybe<string> }>;
  members:
    | (Maybe<{
        _id: string;
        roleTitle: string;
        isLead: Maybe<boolean>;
        skills: Maybe<string[]>;
        githubUrl: Maybe<string>;
        linkedinUrl: Maybe<string>;
        person: Maybe<TeamMember>;
      }>)[]
    | null;
  projects:
    | (Maybe<{
        _id: string;
        title: string;
        summary: Maybe<string>;
        coverImage: Maybe<SanityImage>;
        techStack: Maybe<string[]>;
        projectUrl: Maybe<string>;
        githubUrl: Maybe<string>;
        date: Maybe<string>;
        contributors: Maybe<({ _id: string; name: string } | null)[]>;
      }>)[]
    | null;
}

/** Always returns a complete object, even if nothing is published yet. */
export async function getItTeam(): Promise<ItTeamData> {
  const raw = await sanityFetch<RawItTeam | null>({
    query: itTeamQuery,
    tags: ["itTeamPage", "itTeamMember", "itProject", "teamMember"],
  });

  const members = compact(raw?.members).flatMap<ItMember>((m) =>
    m.person
      ? [
          {
            _id: m._id,
            roleTitle: m.roleTitle,
            isLead: m.isLead ?? false,
            skills: m.skills ?? [],
            githubUrl: m.githubUrl,
            linkedinUrl: m.linkedinUrl,
            person: m.person,
          },
        ]
      : [],
  );

  const projects = compact(raw?.projects).map<ItProject>((p) => ({
    _id: p._id,
    title: p.title,
    summary: p.summary,
    coverImage: p.coverImage,
    techStack: p.techStack ?? [],
    projectUrl: p.projectUrl,
    githubUrl: p.githubUrl,
    date: p.date,
    contributors: compact(p.contributors),
  }));

  return {
    tagline: raw?.page?.tagline || DEFAULT_TAGLINE,
    intro: raw?.page?.intro || DEFAULT_INTRO,
    mission: raw?.page?.mission || DEFAULT_MISSION,
    members,
    projects,
  };
}
