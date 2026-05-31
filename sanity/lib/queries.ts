import { groq } from 'next-sanity'
import { client } from './client'

export const homepageQuery = groq`*[_id == "homepage"][0] {
  presidentMessage,
  presidentPhoto,
  legacyStats,
  "featuredEvents": featuredEvents[]-> {
    title,
    eventDate,
    coverImage
  },
  "featuredGallery": featuredGallery[]-> {
    title,
    image
  }
}`

export async function getHomepageData() {
  return await client.fetch(homepageQuery)
}

// 🚨 NEW CONCEPT: GROQ PARAMETERS ($slug)
export const clubBySlugQuery = groq`*[_type == "club" && slug.current == $slug][0] {
  name,
  slug,
  description,
  logo,
  heroImage,
  "clubHeads": clubHeads[]-> {
    name,
    photo,
    grade
  },
  "viceHeads": viceHeads[]-> {
    name,
    photo,
    grade
  },
  achievements
}`

export async function getClubBySlug(slug: string) {
  // We pass the slug variable safely into the query
  return await client.fetch(clubBySlugQuery, { slug })
}