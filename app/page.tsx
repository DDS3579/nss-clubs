import HomeScrollExperience from "@/components/HomeScrollExperience";
import { getHomepageData } from "@/sanity/lib/queries";

// Re-check Sanity at most once a minute. Without this the page was frozen at
// build time and edits in Sanity never appeared until the next deploy.
export const revalidate = 60;

export default async function HomePage() {
  // Always returns a complete object, so an unpublished Homepage document
  // shows the fallback text instead of an error screen.
  const data = await getHomepageData();

  return (
    <main className="min-h-screen bg-bg">
      <HomeScrollExperience data={data} />
    </main>
  );
}