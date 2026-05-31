# AI Agent Instructions: NSS Clubs Frontend Implementation

## 🎯 Project Context
You are an expert Next.js (App Router) and Tailwind CSS developer. Your task is to build the frontend for the **NSS Clubs** website. 
**CRITICAL:** The Sanity CMS backend is 100% COMPLETE. DO NOT modify any files inside the `sanity/` directory, `sanity.config.ts`, or the schema types. Your sole responsibility is consuming the existing Sanity data and building the Next.js UI.

## 🏗️ Architecture & Stack
- **Framework:** Next.js 15+ (App Router, React Server Components)
- **Styling:** Tailwind CSS
- **CMS:** Sanity.io (Data fetching via `next-sanity` and GROQ)
- **Images:** `next/image` combined with Sanity's `urlFor` helper (configured in `sanity/lib/image.ts`)
- **Types:** Strict TypeScript interfaces located in `sanity/lib/types.ts`
- **Queries:** GROQ queries located in `sanity/lib/queries.ts`

## 📊 Content Strategy: Static vs. Dynamic
The website relies on a hybrid content model. You MUST adhere to these rules when building pages:

### 🧱 STRICTLY STATIC (Hardcode in Next.js)
Do NOT fetch these from Sanity. Hardcode them directly into the React components:
1. **Global Layout:** Navbar, Footer, Mobile Menu.
2. **Homepage Hero Section:** Main banner title, subtitle, and background visuals.
3. **Homepage Clubs Showcase:** The grid/cards linking to the 6 clubs.
4. **Homepage CTA & Contact:** "Join Us" banners, contact forms, and social links.
5. **Club Pages Hero Banners:** The generic layout and overlays for individual club pages.

### 🔄 STRICTLY DYNAMIC (Fetch from Sanity)
You MUST fetch these using the Server Components pattern defined below:
1. **Homepage:** President's Message, Legacy Statistics, Featured Events, Homepage Gallery Showcase.
2. **Global Overlays:** Active Announcements and Time-sensitive Popups.
3. **Club Pages:** About descriptions, Achievements, Club Heads, Vice Heads.
4. **Event Pages:** Event details, dates, registration links, associated galleries.

## 🗺️ Routing & Slugs
The application uses Next.js Dynamic Routing. 

### The 6 Core Clubs
The homepage static grid must link to these exact 6 dynamic routes. The slugs are derived from the first word of the club name:
1. STEM Club ➔ `/clubs/stem`
2. Sports Club ➔ `/clubs/sports`
3. Literature Club ➔ `/clubs/literature`
4. Arts & Craft Club ➔ `/clubs/arts`
5. Entertainment Club ➔ `/clubs/entertainment`
6. Social Club ➔ `/clubs/social`

*Note: The Sanity backend contains the `slug` field for these. When building the static homepage grid, use Next.js `<Link href="/clubs/stem">` etc.*

## 🗄️ Sanity Backend Schema Reference
Use this to understand the shape of the data available in `sanity/lib/types.ts`:

1. **`homepage` (Singleton):** `presidentMessage`, `presidentPhoto`, `legacyStats` (array of objects), `featuredEvents` (references), `featuredGallery` (references).
2. **`executiveTeam`:** `year`, `president`, `advisor`, `secretary`, etc. (all references to `teamMember`).
3. **`teamMember`:** `name`, `photo`, `gender`, `grade`, `bio`, `email`, `linkedIn`.
4. **`club`:** `name`, `slug`, `description`, `logo`, `heroImage`, `clubHeads` (array of refs), `viceHeads` (array of refs), `achievements` (array of strings).
5. **`event`:** `title`, `slug`, `description`, `eventDate` (datetime), `registrationLink`, `coverImage`, `associatedClub` (ref), `isFeatured`, `countdownEnabled`.
6. **`galleryItem`:** `title`, `image`, `associatedClub` (ref), `associatedEvent` (ref), `isFeatured`.
7. **`announcement`:** `title`, `content`, `isActive`, `expiryDate`.
8. **`popup`:** `title`, `message`, `ctaText`, `ctaLink`, `isActive`, `startDate`, `expiryDate`.

## 💻 Data Fetching & Rendering Pattern (REFERENCE IMPLEMENTATION)
When building new dynamic pages (like `/events/[slug]`), you MUST follow the exact pattern established in `app/clubs/[slug]/page.tsx`. 

**Study this dummy/reference code carefully before writing new data-fetching logic:**

```tsx
import { getClubBySlug } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'
import Image from 'next/image'
import type { ClubData, ClubHead } from '@/sanity/lib/types'

// 1. Next.js 15+ requires awaiting params
export default async function ClubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  // 2. Fetch data using predefined queries from sanity/lib/queries.ts
  const data: ClubData | null = await getClubBySlug(slug)

  // 3. Handle 404 / Not Found state gracefully
  if (!data) {
    return <div>Club Not Found</div>
  }

  return (
    <main>
      {/* 4. ALWAYS use next/image and urlFor for Sanity images */}
      {data.heroImage && (
        <Image 
          src={urlFor(data.heroImage).width(1200).height(600).url()}
          alt={data.name}
          width={1200}
          height={600}
          className="object-cover"
          priority
        />
      )}

      {/* 5. Map over arrays safely with optional chaining (?.) */}
      {data.achievements?.map((achievement, index) => (
        <span key={index}>{achievement}</span>
      ))}

      {/* 6. Resolve references safely */}
      {data.clubHeads?.map((head: ClubHead) => (
        <div key={head.name}>
           <p>{head.name}</p>
           {head.photo && <Image src={urlFor(head.photo).width(100).url()} alt={head.name} width={100} height={100} />}
        </div>
      ))}
    </main>
  )
}