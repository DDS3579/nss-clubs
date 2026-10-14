import HomeScrollExperience from "@/components/HomeScrollExperience";
import NoticeLayer from "@/components/home/NoticeLayer";
import { getActiveNotices } from "@/sanity/lib/notices";
import { getHomepageData } from "@/sanity/lib/queries";

// Re-check Sanity at most once a minute. Without this the page was frozen at
// build time and edits in Sanity never appeared until the next deploy.
export const revalidate = 60;

export default async function HomePage() {
  // Both always return complete objects, so unpublished or empty content shows
  // the fallback text (or no notice) instead of an error screen.
  const [data, notices] = await Promise.all([getHomepageData(), getActiveNotices()]);

  return (
    <main id="main-content" className="min-h-screen bg-bg">
      <NoticeLayer announcements={notices.announcements} popup={notices.popup} />
      <HomeScrollExperience data={data} />
    </main>
  );
}