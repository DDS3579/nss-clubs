import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Instant updates: Sanity calls this address every time someone publishes,
 * edits or deletes a document. We then expire the cached copies that depend on
 * that kind of document, so the next visitor gets the new content immediately
 * instead of waiting for the periodic refresh.
 *
 * The tags are the Sanity document types, matching the `tags` used in
 * sanity/lib/queries.ts and sanity/lib/notices.ts.
 */
const KNOWN_TYPES = [
  "homepage",
  "event",
  "galleryItem",
  "album",
  "club",
  "teamMember",
  "executiveTeam",
  "announcement",
  "popup",
] as const;

function secretsMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.SANITY_REVALIDATE_SECRET;
  if (!expectedSecret) {
    return NextResponse.json({ message: "Revalidation is not configured." }, { status: 503 });
  }

  const providedSecret = request.nextUrl.searchParams.get("secret") ?? "";
  if (!secretsMatch(providedSecret, expectedSecret)) {
    return NextResponse.json({ message: "Invalid secret." }, { status: 401 });
  }

  // Sanity sends the changed document; all we need is its type.
  let type: string | undefined;
  try {
    const body: unknown = await request.json();
    if (body && typeof body === "object" && "_type" in body && typeof body._type === "string") {
      type = body._type;
    }
  } catch {
    // no/invalid body: fall through and refresh everything to be safe
  }

  const tags: string[] =
    type && (KNOWN_TYPES as readonly string[]).includes(type) ? [type] : [...KNOWN_TYPES];

  // { expire: 0 } = expire immediately (what webhooks need), not "serve stale first"
  tags.forEach((tag) => revalidateTag(tag, { expire: 0 }));

  return NextResponse.json({ revalidated: tags, at: new Date().toISOString() });
}