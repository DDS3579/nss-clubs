"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export interface GalleryPhoto {
  id: string;
  /** Thumbnail address (already resized by Sanity). */
  src: string;
  width: number;
  height: number;
  /** Larger copy shown in the viewer. */
  fullSrc: string;
  fullWidth: number;
  fullHeight: number;
  title: string;
  clubSlug: string | null;
  clubName: string | null;
  eventTitle: string | null;
  eventSlug: string | null;
}

/**
 * Photo wall with club filter chips and a full-screen viewer.
 * Uses the browser's built-in <dialog>, so focus handling, Esc to close and the
 * dimmed backdrop all work without extra libraries.
 */
export default function GalleryGrid({ photos }: { photos: GalleryPhoto[] }) {
  const [club, setClub] = useState<string>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const clubs = useMemo(() => {
    const seen = new Map<string, string>();
    photos.forEach((p) => {
      if (p.clubSlug && p.clubName && !seen.has(p.clubSlug)) seen.set(p.clubSlug, p.clubName);
    });
    return Array.from(seen, ([slug, name]) => ({ slug, name }));
  }, [photos]);

  const visible = useMemo(
    () => (club === "all" ? photos : photos.filter((p) => p.clubSlug === club)),
    [photos, club],
  );

  // Open / close the native dialog and freeze the page behind it
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (openIndex !== null && !dialog.open) dialog.showModal();
    if (openIndex === null && dialog.open) dialog.close();

    const root = document.documentElement;
    const previous = root.style.overflow;
    if (openIndex !== null) root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [openIndex]);

  const current = openIndex !== null ? visible[openIndex] : null;

  const step = (direction: 1 | -1) => {
    setOpenIndex((index) =>
      index === null || visible.length === 0 ? index : (index + direction + visible.length) % visible.length,
    );
  };

  const chooseClub = (slug: string) => {
    setClub(slug);
    setOpenIndex(null);
  };

  return (
    <div>
      {clubs.length > 0 && (
        <div role="group" aria-label="Filter photos by club" className="flex flex-wrap gap-2">
          {[{ slug: "all", name: "All" }, ...clubs].map((item) => {
            const active = club === item.slug;
            return (
              <button
                key={item.slug}
                type="button"
                onClick={() => chooseClub(item.slug)}
                aria-pressed={active}
                className={`min-h-11 rounded-full px-4 text-sm font-semibold transition ${
                  active
                    ? "bg-primary text-white shadow-md"
                    : "bg-white text-primary ring-1 ring-primary/15 hover:bg-primary/5"
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="mt-8 rounded-card bg-primary/5 px-6 py-8 text-center text-text/80">
          No photos here yet.
        </p>
      ) : (
        <ul className="mt-6 columns-2 gap-3 md:columns-3 lg:columns-4">
          {visible.map((photo, index) => (
            <li key={photo.id} className="mb-3 break-inside-avoid">
              <button
                type="button"
                onClick={() => setOpenIndex(index)}
                aria-label={`Open photo: ${photo.title}`}
                className="group relative block w-full overflow-hidden rounded-xl bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <Image
                  src={photo.src}
                  alt={photo.title}
                  width={photo.width}
                  height={photo.height}
                  unoptimized
                  loading="lazy"
                  className="h-auto w-full transition duration-500 group-hover:scale-105"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        aria-label="Photo viewer"
        onClose={() => setOpenIndex(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpenIndex(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        className="m-auto h-dvh max-h-dvh w-screen max-w-none bg-black/90 p-0 text-white backdrop:bg-black/80"
      >
        {current && (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-4">
            <button
              type="button"
              onClick={() => setOpenIndex(null)}
              aria-label="Close viewer"
              className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>

            {visible.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous photo"
                  className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
                >
                  <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next photo"
                  className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
                >
                  <ChevronRight className="h-6 w-6" aria-hidden="true" />
                </button>
              </>
            )}

            <Image
              src={current.fullSrc}
              alt={current.title}
              width={current.fullWidth}
              height={current.fullHeight}
              unoptimized
              className="max-h-[78dvh] w-auto max-w-full rounded-lg object-contain"
            />

            <div className="text-center">
              <p className="font-display text-base font-semibold text-white">{current.title}</p>
              <p className="mt-0.5 text-sm text-white/70">
                {[current.clubName, current.eventTitle].filter(Boolean).join(" · ")}
                {current.eventSlug && (
                  <>
                    {" "}
                    <Link href={`/events/${current.eventSlug}`} className="font-semibold text-accent underline">
                      View event
                    </Link>
                  </>
                )}
              </p>
              <p className="mt-1 text-xs text-white/50" aria-live="polite">
                {(openIndex ?? 0) + 1} / {visible.length}
              </p>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}