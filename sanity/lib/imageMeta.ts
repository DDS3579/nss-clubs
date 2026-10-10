import { urlFor } from "./image";
import type { SanityImage } from "./types";

/**
 * Image helpers for the gallery, events and team pages.
 *
 * These pages show many photos, so they ask Sanity's own image CDN for the exact
 * size and format (WebP/AVIF) and render with `unoptimized`. That keeps them fast
 * and avoids spending Vercel's image-optimization quota on every gallery photo.
 */

/** Original pixel size, read from the asset id ("image-<hash>-4000x3000-jpg"). */
export function getImageSize(image: SanityImage): { width: number; height: number } {
  const match = /^image-[A-Za-z0-9]+-(\d+)x(\d+)-[a-z0-9]+$/.exec(image.asset._ref);
  if (!match) return { width: 4, height: 3 };
  return { width: Number(match[1]), height: Number(match[2]) };
}

/** A resized copy that keeps the original shape. */
export function sanityImageUrl(image: SanityImage, width: number): string {
  return urlFor(image).width(width).auto("format").url();
}

/** A cropped copy of an exact shape (respects the hotspot you set in Sanity). */
export function sanityCoverUrl(image: SanityImage, width: number, height: number): string {
  return urlFor(image).width(width).height(height).fit("crop").auto("format").url();
}

/** width/height to give next/image so the layout reserves the right space. */
export function scaledSize(image: SanityImage, width: number): { width: number; height: number } {
  const { width: w, height: h } = getImageSize(image);
  return { width, height: Math.max(1, Math.round((width * h) / w)) };
}