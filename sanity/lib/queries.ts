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