import type { Metadata } from "next";
import Link from "next/link";
import ConstellationFooter from "@/components/layout/ConstellationFooter";

export const metadata: Metadata = {
  title: "Page not found | NSS Clubs",
};

export default function NotFound() {
  return (
    <>
      <main
        id="main-content"
        className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20 text-center"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/60">Error 404</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-primary sm:text-5xl">
          This page drifted out of orbit
        </h1>
        <p className="mt-4 max-w-md text-text/80">
          The page you are looking for does not exist or has moved. Head back to the atom, or jump
          straight to one of these.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-button bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-accent hover:text-primary"
          >
            Back to home
          </Link>
          <Link
            href="/events"
            className="rounded-button bg-white px-6 py-3 text-sm font-semibold text-primary shadow-sm ring-1 ring-primary/15 transition hover:bg-primary/5"
          >
            Events
          </Link>
          <Link
            href="/gallery"
            className="rounded-button bg-white px-6 py-3 text-sm font-semibold text-primary shadow-sm ring-1 ring-primary/15 transition hover:bg-primary/5"
          >
            Gallery
          </Link>
        </div>
      </main>
      <ConstellationFooter />
    </>
  );
}