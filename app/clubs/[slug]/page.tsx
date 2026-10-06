import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CLUBS } from "@/lib/clubs";
import { urlFor } from "@/sanity/lib/image";
import { getClubBySlug } from "@/sanity/lib/queries";
import type { ClubHead } from "@/sanity/lib/types";

export const revalidate = 60;

// Only the six real clubs exist. Any other /clubs/whatever returns a proper 404
// (it used to return a 200 "Club Not Found" page, which search engines index).
export const dynamicParams = false;

export function generateStaticParams() {
  return CLUBS.map((club) => ({ slug: club.slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const club = CLUBS.find((c) => c.slug === slug);
  if (!club) return {};
  return {
    title: `${club.name} | NSS Clubs`,
    description: club.tagline,
  };
}

export default async function ClubPage({ params }: PageProps) {
  const { slug } = await params;

  const club = CLUBS.find((c) => c.slug === slug);
  if (!club) notFound();

  // Sanity may not have this club's document yet; the page still works using
  // the built-in name and tagline instead of showing an error.
  const data = await getClubBySlug(slug);
  const name = data?.name ?? club.name;
  const description = data?.description || club.tagline;
  const achievements = data?.achievements ?? [];
  const clubHeads = data?.clubHeads ?? [];
  const viceHeads = data?.viceHeads ?? [];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-96 w-full bg-gray-200">
        {data?.heroImage && (
          <Image
            src={urlFor(data.heroImage).width(1200).height(600).url()}
            alt={name}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white text-center drop-shadow-lg">
            {name}
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header & Logo */}
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
          {data?.logo && (
            <div className="relative w-32 h-32 shrink-0 bg-white p-2 rounded-xl shadow-lg">
              <Image
                src={urlFor(data.logo).width(200).height(200).url()}
                alt={`${name} logo`}
                fill
                sizes="128px"
                className="object-contain"
              />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold mb-4">About the Club</h2>
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
              {description}
            </p>
          </div>
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Key Achievements</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <li
                  key={`${index}-${achievement}`}
                  className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm border"
                >
                  <span className="text-yellow-500 text-xl">🏆</span>
                  <span className="text-gray-800">{achievement}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Leadership (a group only appears if it has people) */}
        {(clubHeads.length > 0 || viceHeads.length > 0) && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Club Leadership</h2>

            {clubHeads.length > 0 && (
              <>
                <h3 className="text-xl font-semibold mb-4 text-gray-600">Club Heads</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {clubHeads.map((head) => (
                    <PersonCard key={head._id} person={head} />
                  ))}
                </div>
              </>
            )}

            {viceHeads.length > 0 && (
              <>
                <h3 className="text-xl font-semibold mb-4 text-gray-600">Vice Heads</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {viceHeads.map((head) => (
                    <PersonCard key={head._id} person={head} />
                  ))}
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function PersonCard({ person }: { person: ClubHead }) {
  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border">
      {person.photo && (
        <div className="relative w-16 h-16 shrink-0">
          <Image
            src={urlFor(person.photo).width(100).height(100).url()}
            alt={person.name}
            fill
            sizes="64px"
            className="object-cover rounded-full"
          />
        </div>
      )}
      <div>
        <p className="font-bold text-gray-900">{person.name}</p>
        {person.grade && <p className="text-sm text-gray-500">{person.grade}</p>}
      </div>
    </div>
  );
}