import type { QueryParams } from "next-sanity";
import { client } from "./client";

/**
 * How long a fetched result is reused before Next.js re-checks Sanity.
 *
 * - Webhook set up (SANITY_REVALIDATE_SECRET exists): edits arrive instantly through
 *   app/api/revalidate, so this is only a 15-minute safety net. That keeps requests
 *   to Sanity very low (important: the free plan blocks the site if its quota runs out).
 * - No webhook: re-check every minute so edits still show up quickly.
 */
export const DEFAULT_REVALIDATE_SECONDS = process.env.SANITY_REVALIDATE_SECRET ? 900 : 60;

/**
 * The one way the site reads from Sanity.
 *
 * Plain `client.fetch()` ignores Next.js caching: the homepage was frozen at
 * build time (edits in Sanity never showed up) while club pages hit the Sanity
 * API on every single visit. This wrapper fixes both:
 *   - `revalidate`: results are reused for 60 s, then refreshed in the background
 *   - `tags`: names (we use Sanity document types) so a future webhook can
 *     refresh a page instantly with revalidateTag("event"), etc.
 */
export async function sanityFetch<T>({
  query,
  params = {},
  tags = [],
  revalidate = DEFAULT_REVALIDATE_SECONDS,
}: {
  query: string;
  params?: QueryParams;
  tags?: string[];
  revalidate?: number | false;
}): Promise<T> {
  return client.fetch<T>(query, params, { next: { revalidate, tags } });
}