import { groq } from "next-sanity";
import { sanityFetch } from "./fetch";
import { toDateKey } from "@/lib/dates";

/**
 * Announcements and popups for the homepage.
 * The Studio only stores them; THIS file decides which ones are live right now.
 */

export interface Announcement {
  _id: string;
  title: string;
  content: string | null;
  /** "YYYY-MM-DD", last day the notice is shown */
  expiryDate: string | null;
}

export interface Popup {
  _id: string;
  title: string;
  message: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  startDate: string | null;
  expiryDate: string | null;
}

export interface ActiveNotices {
  announcements: Announcement[];
  popup: Popup | null;
}

const MAX_ANNOUNCEMENTS = 3;

const announcementsQuery = groq`*[_type == "announcement" && isActive == true]
  | order(_createdAt desc){ _id, title, content, expiryDate }`;

const popupsQuery = groq`*[_type == "popup" && isActive == true]
  | order(_createdAt desc){ _id, title, message, ctaText, ctaLink, startDate, expiryDate }`;

function compact<T>(list: (T | null | undefined)[] | null | undefined): T[] {
  return (list ?? []).filter((item): item is T => item != null);
}

/** Notices that are switched on AND inside their date window right now. */
export async function getActiveNotices(now: Date = new Date()): Promise<ActiveNotices> {
  const [announcementsRaw, popupsRaw] = await Promise.all([
    sanityFetch<(Announcement | null)[] | null>({
      query: announcementsQuery,
      tags: ["announcement"],
    }),
    sanityFetch<(Popup | null)[] | null>({
      query: popupsQuery,
      tags: ["popup"],
    }),
  ]);

  // Date-only strings ("2026-03-15") sort correctly as plain text.
  // The expiry day itself still counts as live.
  const today = toDateKey(now);
  const nowMs = now.getTime();

  const announcements = compact(announcementsRaw)
    .filter((a) => !a.expiryDate || a.expiryDate >= today)
    .slice(0, MAX_ANNOUNCEMENTS);

  const popups = compact(popupsRaw).filter((p) => {
    const starts = p.startDate ? new Date(p.startDate).getTime() : null;
    const ends = p.expiryDate ? new Date(p.expiryDate).getTime() : null;
    if (starts !== null && !Number.isNaN(starts) && starts > nowMs) return false;
    if (ends !== null && !Number.isNaN(ends) && ends <= nowMs) return false;
    return true;
  });

  return { announcements, popup: popups[0] ?? null };
}