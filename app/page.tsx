import HomeScrollExperience from "@/components/HomeScrollExperience";
import { getHomepageData } from "@/sanity/lib/queries";
import type { HomepageData } from "@/sanity/lib/types";

export default async function HomePage() {
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
