import { getHomepageData } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'

export default async function HomePage() {
  const data = await getHomepageData()

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
      <section className="max-w-4xl mx-auto py-16 px-6">
        <h2 className="text-3xl font-bold mb-6">President's Message</h2>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {data.presidentPhoto && (
            <img 
              src={urlFor(data.presidentPhoto).width(300).height(300).url()} 
              alt="President" 
              className="w-48 h-48 object-cover rounded-lg shadow-md"
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
          {data.legacyStats?.map((stat: any) => (
            <div key={stat._key} className="p-6 bg-gray-50 rounded-xl">
              <p className="text-4xl font-bold text-blue-600">{stat.value}</p>
              <p className="mt-2 text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED EVENTS (Dynamic) */}
      <section className="max-w-5xl mx-auto py-16 px-6">
        <h2 className="text-3xl font-bold mb-8">Featured Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.featuredEvents?.map((event: any) => (
            <div key={event.title} className="bg-white p-6 rounded-xl shadow-sm border">
              {event.coverImage && (
                <img 
                  src={urlFor(event.coverImage).width(600).height(300).url()} 
                  alt={event.title} 
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
      <section className="bg-gray-100 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Gallery Showcase</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.featuredGallery?.map((item: any) => (
              <div key={item.title} className="relative group overflow-hidden rounded-lg">
                {item.image && (
                  <img 
                    src={urlFor(item.image).width(400).height(400).url()} 
                    alt={item.title} 
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA & CONTACT (Static) */}
      <section className="bg-blue-900 text-white py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Make an Impact?</h2>
        <p className="mb-6 opacity-90">Join NSS Clubs and be part of something bigger.</p>
        <button className="bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
          Contact Us
        </button>
      </section>
    </main>
  )
}