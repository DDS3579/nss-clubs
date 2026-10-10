import type { Metadata } from "next";
import GalleryGrid, { type GalleryPhoto } from "@/components/gallery/GalleryGrid";
import ConstellationFooter from "@/components/layout/ConstellationFooter";
import AlbumCard from "@/components/pages/AlbumCard";
import PageHero from "@/components/pages/PageHero";
import { sanityImageUrl, scaledSize } from "@/sanity/lib/imageMeta";
import { getAlbums, getGallery } from "@/sanity/lib/queries";

export const revalidate = 60;

const PHOTO_LIMIT = 120;

export const metadata: Metadata = {
  title: "Gallery | NSS Clubs",
  description: "Photos and full albums from NSS Clubs events, trips and everyday club life.",
};

export default async function GalleryPage() {
  const [items, albums] = await Promise.all([getGallery(PHOTO_LIMIT), getAlbums()]);

  const photos: GalleryPhoto[] = items.map((item) => {
    const thumb = scaledSize(item.image, 640);
    const full = scaledSize(item.image, 1800);
    return {
      id: item._id,
      src: sanityImageUrl(item.image, thumb.width),
      width: thumb.width,
      height: thumb.height,
      fullSrc: sanityImageUrl(item.image, full.width),
      fullWidth: full.width,
      fullHeight: full.height,
      title: item.title,
      clubSlug: item.club?.slug ?? null,
      clubName: item.club?.name ?? null,
      eventTitle: item.event?.title ?? null,
      eventSlug: item.event?.slug ?? null,
    };
  });

  return (
    <>
      <main>
        <PageHero
          eyebrow="Memories"
          title="Gallery"
          subtitle="Favourite moments from our events, trips and everyday club life."
        />

        {albums.length > 0 && (
          <section aria-labelledby="albums-heading" className="mx-auto max-w-6xl px-6 pt-12 lg:px-8">
            <h2 id="albums-heading" className="font-display text-2xl font-bold text-primary">
              Full albums
            </h2>
            <p className="mt-2 max-w-2xl text-text/80">
              Every photo from these events lives in a shared Google Drive album.
            </p>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {albums.map((album) => (
                <li key={album._id}>
                  <AlbumCard album={album} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="photos-heading" className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
          <h2 id="photos-heading" className="font-display text-2xl font-bold text-primary">
            Photos
          </h2>
          <div className="mt-5">
            {photos.length > 0 ? (
              <GalleryGrid photos={photos} />
            ) : (
              <p className="rounded-card bg-primary/5 px-6 py-8 text-center text-text/80">
                Photos are coming soon.
              </p>
            )}
          </div>
          {photos.length >= PHOTO_LIMIT && (
            <p className="mt-6 text-sm text-text/60">
              Showing the latest {PHOTO_LIMIT} photos. Open an album above to see everything.
            </p>
          )}
        </section>
      </main>
      <ConstellationFooter />
    </>
  );
}