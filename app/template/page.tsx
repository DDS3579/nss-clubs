import { getHomepageData } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'
import Image from 'next/image' // 🚨 NEW: Next.js Image Component
import Link from 'next/link' // 🚨 NEW: Next.js Link Component
import type { HomepageData, Stat, FeaturedEvent, FeaturedGalleryItem } from '@/sanity/lib/types'

export default async function HomePage() {
  // 🚨 NEW: Strictly typed data
  const data: HomepageData | null = await getHomepageData()

  if (!data) {
    return <div className="p-10 text-center text-gray-500">No homepage data found. Please publish the Homepage document in Sanity Studio.</div>
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HERO SECTION (Static) */}
      <section className="bg-blue-900 text-white py-20 px-6 text-center">
        <h1 className="text-4xl font-bold">Welcome to NSS Clubs</h1>
        <p className="mt-4 text-lg opacity-90">Empowering students through service, leadership, and innovation.</p>
      </section>

      {/* PRESIDENT'S MESSAGE (Dynamic) */}
      <section id="about" className="max-w-4xl mx-auto py-16 px-6 scroll-mt-24">
        <h2 className="text-3xl font-bold mb-6">President's Message</h2>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {data.presidentPhoto && (
            <Image 
              src={urlFor(data.presidentPhoto).width(300).height(300).url()} 
              alt="NSS Clubs President" 
              width={300} // Required by Next.js Image
              height={300} // Required by Next.js Image
              className="w-48 h-48 object-cover rounded-lg shadow-md"
              priority // Tells Next.js to load this image immediately for fast LCP (Largest Contentful Paint)
            />
          )}
          <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
            {data.presidentMessage}
          </p>
        </div>
      </section>

      {/* LEGACY STATS (Dynamic) */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {/* 🚨 NEW: Typed Array Mapping */}
          {data.legacyStats?.map((stat: Stat) => (
            <div key={stat._key} className="p-6 bg-gray-50 rounded-xl">
              <p className="text-4xl font-bold text-blue-600">{stat.value}</p>
              <p className="mt-2 text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CLUBS SHOWCASE (Static) */}
      <section id="clubs" className="max-w-5xl mx-auto py-16 px-6 scroll-mt-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold tracking-tight text-primary">Our Academic & Service Clubs</h2>
          <p className="mt-2 font-body text-gray-600">Discover and join our active student organizations.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/clubs/stem" className="group block p-6 bg-white border border-gray-100 rounded-card shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider font-body">Academic</span>
            <h3 className="text-xl font-bold font-display text-primary mt-1 group-hover:text-accent transition-colors">STEM Club</h3>
            <p className="text-gray-600 text-sm mt-2 font-body">Explore science, technology, engineering, and mathematics through hands-on projects.</p>
          </Link>
          <Link href="/clubs/sports" className="group block p-6 bg-white border border-gray-100 rounded-card shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider font-body">Athletics</span>
            <h3 className="text-xl font-bold font-display text-primary mt-1 group-hover:text-accent transition-colors">Sports Club</h3>
            <p className="text-gray-600 text-sm mt-2 font-body">Develop athleticism, teamwork, and leadership through competitive sports and training.</p>
          </Link>
          <Link href="/clubs/literature" className="group block p-6 bg-white border border-gray-100 rounded-card shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider font-body">Creative</span>
            <h3 className="text-xl font-bold font-display text-primary mt-1 group-hover:text-accent transition-colors">Literature Club</h3>
            <p className="text-gray-600 text-sm mt-2 font-body">Express thoughts, foster critical thinking, and master the art of writing and speech.</p>
          </Link>
          <Link href="/clubs/arts" className="group block p-6 bg-white border border-gray-100 rounded-card shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider font-body">Creative</span>
            <h3 className="text-xl font-bold font-display text-primary mt-1 group-hover:text-accent transition-colors">Arts & Craft Club</h3>
            <p className="text-gray-600 text-sm mt-2 font-body">Unleash creativity through painting, sketching, crafting, and visual exhibits.</p>
          </Link>
          <Link href="/clubs/entertainment" className="group block p-6 bg-white border border-gray-100 rounded-card shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider font-body">Performance</span>
            <h3 className="text-xl font-bold font-display text-primary mt-1 group-hover:text-accent transition-colors">Entertainment Club</h3>
            <p className="text-gray-600 text-sm mt-2 font-body">Express talent through music, dance, theater, and staging spectacular school shows.</p>
          </Link>
          <Link href="/clubs/social" className="group block p-6 bg-white border border-gray-100 rounded-card shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider font-body">Community</span>
            <h3 className="text-xl font-bold font-display text-primary mt-1 group-hover:text-accent transition-colors">Social Club</h3>
            <p className="text-gray-600 text-sm mt-2 font-body">Champion community service, eco-initiatives, and make a sustainable positive impact.</p>
          </Link>
        </div>
      </section>

      {/* FEATURED EVENTS (Dynamic) */}
      <section id="events" className="max-w-5xl mx-auto py-16 px-6 scroll-mt-24">
        <h2 className="text-3xl font-bold mb-8">Featured Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.featuredEvents?.map((event: FeaturedEvent) => (
            <div key={event.title} className="bg-white p-6 rounded-xl shadow-sm border">
              {event.coverImage && (
                <Image 
                  src={urlFor(event.coverImage).width(600).height(300).url()} 
                  alt={event.title} 
                  width={600}
                  height={300}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              )}
              <h3 className="text-xl font-semibold">{event.title}</h3>
              <p className="text-gray-500 mt-2">
                {new Date(event.eventDate).toLocaleDateString('en-US', { 
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                })}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* GALLERY SHOWCASE (Dynamic) */}
      <section id="gallery" className="bg-gray-100 py-16 px-6 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Gallery Showcase</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.featuredGallery?.map((item: FeaturedGalleryItem) => (
              <div key={item.title} className="relative group overflow-hidden rounded-lg">
                {item.image && (
                  <Image 
                    src={urlFor(item.image).width(400).height(400).url()} 
                    alt={item.title} 
                    width={400}
                    height={400}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA & CONTACT (Static) */}
      <section id="contact" className="bg-primary text-white py-16 px-6 text-center scroll-mt-24">
        <h2 className="text-3xl font-bold mb-4">Ready to Make an Impact?</h2>
        <p className="mb-6 opacity-90">Join NSS Clubs and be part of something bigger.</p>
        <button className="bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
          Contact Us
        </button>
      </section>
    </main>
  )
}