import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { formatEventDate } from "@/lib/dates";
import { sanityCoverUrl } from "@/sanity/lib/imageMeta";
import type { Album } from "@/sanity/lib/types";

type AlbumLike = Pick<Album, "_id" | "title" | "driveUrl" | "coverImage" | "date" | "description"> & {
  club?: Album["club"];
};

/** Cover photo comes from Sanity (fast); the full album opens on Google Drive. */
export default function AlbumCard({ album }: { album: AlbumLike }) {
  // Only ever link to real web addresses
  if (!/^https:\/\//.test(album.driveUrl)) return null;

  const date = formatEventDate(album.date, "short");

  return (
    <a
      href={album.driveUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col overflow-hidden rounded-card bg-white text-text shadow-md ring-1 ring-primary/5 transition duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-primary/5">
        <Image
          src={sanityCoverUrl(album.coverImage, 800, 600)}
          alt=""
          fill
          unoptimized
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {(album.club || date) && (
          <p className="text-xs font-semibold uppercase tracking-wide text-text/60">
            {[album.club?.name, date].filter(Boolean).join(" · ")}
          </p>
        )}
        <h3 className="font-display text-lg font-bold leading-snug text-primary">{album.title}</h3>
        {album.description && <p className="line-clamp-2 text-sm text-text/80">{album.description}</p>}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-primary">
          Open album on Google Drive
          <ExternalLink className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </span>
      </div>
    </a>
  );
}