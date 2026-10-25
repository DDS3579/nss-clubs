import HomeScrollExperience from "@/components/HomeScrollExperience";
import NoticeLayer from "@/components/home/NoticeLayer";
import { getActiveNotices } from "@/sanity/lib/notices";
import { getHomepageData } from "@/sanity/lib/queries";
import { getLegacyEras } from "@/sanity/lib/presidentLegacy";
import { sanityCoverUrl } from "@/sanity/lib/imageMeta";

// Re-check Sanity at most once a minute. Without this the page was frozen at
// build time and edits in Sanity never appeared until the next deploy.
export const revalidate = 60;

export default async function HomePage() {
  // Both always return complete objects, so unpublished or empty content shows
  // the fallback text (or no notice) instead of an error screen.
  const [data, notices, eras] = await Promise.all([
    getHomepageData(),
    getActiveNotices(),
    getLegacyEras(),
  ]);

  // The newest era is the current president (see "President's Legacy" in the Studio)
  const current = eras[0];
  const president = current
    ? {
        name: current.presidentName,
        year: current.academicYear,
        photoUrl: current.photo ? sanityCoverUrl(current.photo, 288, 288) : null,
      }
    : null;

  return (
    <main id="main-content" className="min-h-screen bg-bg">
      <NoticeLayer announcements={notices.announcements} popup={notices.popup} />
      <HomeScrollExperience data={data} president={president} />
    </main>
  );
}