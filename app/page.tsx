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
    <main className="min-h-screen bg-bg">

    </main>
  )
}