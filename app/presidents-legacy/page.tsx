import type { Metadata } from "next";
import ConstellationFooter from "@/components/layout/ConstellationFooter";
import LegacyExplorer, { type LegacyEraView } from "@/components/pages/LegacyExplorer";
import PageHero from "@/components/pages/PageHero";
import { sanityCoverUrl } from "@/sanity/lib/imageMeta";
import { getLegacyEras, type LegacyEra } from "@/sanity/lib/presidentLegacy";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "President's Legacy | NSS Clubs",
  description:
    "The presidents who led NSS Clubs through the years: their achievements, reforms, events conducted and the inter-school events our students joined.",
};

/** Turns Sanity data into plain values (image links are made here, on the server). */
function toView(era: LegacyEra): LegacyEraView {
  return {
    key: era.academicYear,
    academicYear: era.academicYear,
    isCurrent: era.isCurrent,
    hasDetails: era.hasDetails,
    presidentName: era.presidentName,
    grade: era.grade,
    photoUrl: era.photo ? sanityCoverUrl(era.photo, 240, 240) : null,
    photoLargeUrl: era.photo ? sanityCoverUrl(era.photo, 1100, 825) : null,
    tagline: era.tagline,
    message: era.message,
    eventsConductedCount: era.eventsConductedCount,
    interSchoolCount: era.interSchoolCount,
    peakAchievements: era.peakAchievements,
    achievements: era.achievements.map((item) => ({
      key: item._key,
      title: item.title,
      description: item.description,
      date: item.date,
      imageUrl: item.image ? sanityCoverUrl(item.image, 640, 420) : null,
    })),
    reforms: era.reforms,
    eventsConducted: era.eventsConducted.map((event) => ({
      key: event._key,
      title: event.title,
      date: event.date,
      description: event.description,
    })),
    interSchoolEvents: era.interSchoolEvents.map((event) => ({
      key: event._key,
      title: event.title,
      host: event.host,
      date: event.date,
      result: event.result,
    })),
  };
}

export default async function PresidentsLegacyPage() {
  const eras = await getLegacyEras();

  return (
    <>
      <main id="main-content">
        <PageHero
          eyebrow="Leadership through the years"
          title="President's Legacy"
          subtitle="Every president who led NSS Clubs, and what their era achieved: events conducted, reforms made and the inter-school stages our students stood on."
        />
        <LegacyExplorer eras={eras.map(toView)} />
      </main>
      <ConstellationFooter />
    </>
  );
}
