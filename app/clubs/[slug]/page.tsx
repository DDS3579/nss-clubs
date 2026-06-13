import { getClubBySlug } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'
import Image from 'next/image'
import Link from 'next/link'
import type { ClubData, ClubHead } from '@/sanity/lib/types'

// Note: In Next.js 15+, `params` is a Promise, so we must `await` it.
export default async function ClubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  const data: ClubData | null = await getClubBySlug(slug)

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-bold">Club Not Found</h1>
        <p className="text-gray-500">We couldn&apos;t find a club with the slug &quot;{slug}&quot;.</p>
        <Link href="/" className="text-blue-600 underline">Go back home</Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-96 w-full bg-gray-200">
        {data.heroImage && (
          <Image 
            src={urlFor(data.heroImage).width(1200).height(600).url()}
            alt={data.name}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white text-center drop-shadow-lg">
            {data.name}
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header & Logo */}
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
          {data.logo && (
            <div className="relative w-32 h-32 flex-shrink-0 bg-white p-2 rounded-xl shadow-lg">
              <Image 
                src={urlFor(data.logo).width(200).height(200).url()}
                alt={`${data.name} logo`}
                fill
                className="object-contain"
              />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold mb-4">About the Club</h2>
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
              {data.description}
            </p>
          </div>
        </div>

        {/* Achievements */}
        {data.achievements && data.achievements.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Key Achievements</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.achievements.map((achievement, index) => (
                <li key={index} className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm border">
                  <span className="text-yellow-500 text-xl">🏆</span>
                  <span className="text-gray-800">{achievement}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Leadership */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Club Leadership</h2>
          
          <h3 className="text-xl font-semibold mb-4 text-gray-600">Club Heads</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {data.clubHeads?.map((head) => (
              <PersonCard key={head.name} person={head} />
            ))}
          </div>

          <h3 className="text-xl font-semibold mb-4 text-gray-600">Vice Heads</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.viceHeads?.map((head) => (
              <PersonCard key={head.name} person={head} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

// Helper component for rendering Team Members cleanly
function PersonCard({ person }: { person: ClubHead }) {
  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border">
      {person.photo && (
        <div className="relative w-16 h-16 flex-shrink-0">
          <Image 
            src={urlFor(person.photo).width(100).height(100).url()}
            alt={person.name}
            fill
            className="object-cover rounded-full"
          />
        </div>
      )}
      <div>
        <p className="font-bold text-gray-900">{person.name}</p>
        {person.grade && <p className="text-sm text-gray-500">{person.grade}</p>}
      </div>
    </div>
  )
}