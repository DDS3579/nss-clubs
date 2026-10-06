import type { QueryParams } from "next-sanity";
import { client } from "./client";

/** How long a fetched result is reused before Next.js re-checks Sanity. */
export const DEFAULT_REVALIDATE_SECONDS = 60;

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