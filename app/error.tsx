"use client";

import { useEffect } from "react";
import Link from "next/link";

/** Shown if something unexpected breaks while a page is loading. */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      id="main-content"
      className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20 text-center"
    >
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/60">Something went wrong</p>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl">
        We could not load this page
      </h1>
      <p className="mt-4 max-w-md text-text/80">
        This is usually temporary. Try again, and if it keeps happening, let the executive team know.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-button bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-accent hover:text-primary"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-button bg-white px-6 py-3 text-sm font-semibold text-primary shadow-sm ring-1 ring-primary/15 transition hover:bg-primary/5"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}