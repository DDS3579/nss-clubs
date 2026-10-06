import HomeScrollExperience from "@/components/HomeScrollExperience";
import type { HomepageData } from "@/sanity/lib/types";

export default async function HomePage() {
  const hasSanityConfig =
    process.env.NEXT_PUBLIC_SANITY_DATASET &&
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

  if (!hasSanityConfig) {
    return (
      <div className="p-10 text-center text-gray-500">
        Add NEXT_PUBLIC_SANITY_DATASET and NEXT_PUBLIC_SANITY_PROJECT_ID to .env.local to load homepage content.
      </div>
    );
  }

  const { getHomepageData } = await import("@/sanity/lib/queries");
  const data: HomepageData | null = await getHomepageData();

  if (!data) {
    return (
      <div className="p-10 text-center text-gray-500">
        No homepage data found. Please publish the Homepage document in Sanity Studio.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-bg">
      <HomeScrollExperience data={data} />
    </main>
  );
}
