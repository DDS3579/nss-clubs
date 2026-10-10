import type { Metadata } from "next";
import ConstellationFooter from "@/components/layout/ConstellationFooter";
import EventCard from "@/components/pages/EventCard";
import PageHero from "@/components/pages/PageHero";
import { getEvents } from "@/sanity/lib/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Events | NSS Clubs",
  description:
    "Upcoming and past events from the six NSS Clubs: workshops, tournaments, performances and service drives.",
};

export default async function EventsPage() {
  const { upcoming, past } = await getEvents();

  return (
    <>
      <main>
        <PageHero
          eyebrow="What is happening"
          title="Events"
          subtitle="Workshops, tournaments, performances and service drives from all six clubs."
        />

        <section aria-labelledby="upcoming-heading" className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
          <h2 id="upcoming-heading" className="font-display text-2xl font-bold text-primary">
            Upcoming
          </h2>
          {upcoming.length > 0 ? (
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((event) => (
                <li key={event._id}>
                  <EventCard event={event} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 rounded-card bg-primary/5 px-6 py-8 text-center text-text/80">
              No upcoming events right now. Check back soon, or look at what we have done below.
            </p>
          )}
        </section>

        {past.length > 0 && (
          <section aria-labelledby="past-heading" className="bg-slate-50 py-12">
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
              <h2 id="past-heading" className="font-display text-2xl font-bold text-primary">
                Past events
              </h2>
              <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {past.map((event) => (
                  <li key={event._id}>
                    <EventCard event={event} past />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
      <ConstellationFooter />
    </>
  );
}