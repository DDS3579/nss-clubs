"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative flex min-h-[calc(100svh-5rem)] items-center overflow-hidden bg-white pt-6 pb-12 sm:pt-4 sm:pb-16 lg:min-h-[calc(100svh-4rem)] lg:-mt-8 lg:pb-20">
      {/* Background radial highlights */}
      <div className="absolute top-1/4 left-1/10 w-72 h-72 rounded-full bg-primary/5 blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 rounded-full bg-accent/5 blur-3xl -z-10 pointer-events-none" />

      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">

        {/* ── MOBILE LAYOUT: centered single column ── */}
        <div className="flex flex-col items-center text-center gap-5 lg:hidden">

          {/* Atom */}
          <div className="hero-atom-origin relative w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] flex items-center justify-center overflow-hidden rounded-full bg-slate-50/10" />

          {/* Heading */}
          <h1 className="font-display font-black leading-[0.92] tracking-tight text-text w-full">
            <span className="block text-primary text-[56px] animate-in fade-in slide-in-from-bottom duration-500">
              Discover.
            </span>
            <span className="block text-accent text-[56px] animate-in fade-in slide-in-from-bottom duration-700 delay-100">
              Create.
            </span>
            <span className="block text-primary text-[56px] animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
              Lead.
            </span>
          </h1>

          {/* Short description */}
          <p className="font-body text-sm text-gray-500 font-medium leading-relaxed max-w-[260px] animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
            Welcome to NSS Clubs.
          </p>

          {/* CTAs — stacked, auto width, centered */}
          <div className="flex flex-col items-center gap-3 w-full max-w-[280px] font-body animate-in fade-in slide-in-from-bottom duration-1000 delay-400">
            {/* Primary */}
            <Link
              href="/#clubs"
              className="w-full inline-flex items-center justify-center bg-primary text-white text-sm font-semibold tracking-wide px-8 py-4 rounded-button shadow-md hover:bg-accent hover:text-primary transition-all duration-300 active:scale-95"
            >
              Explore Clubs
            </Link>
            {/* Secondary */}
            <Link
              href="/#about"
              className="w-full inline-flex items-center justify-center bg-white text-primary text-sm font-semibold tracking-wide px-8 py-4 rounded-button border-2 border-primary hover:bg-primary hover:text-white transition-all duration-300 active:scale-95"
            >
              About Us
            </Link>
          </div>
        </div>

        {/* ── DESKTOP LAYOUT: original two-column grid ── */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-12 items-center">

          {/* Column 1: Text & CTAs */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <h1 className="font-display font-black leading-none tracking-tight text-text w-full">
              <span className="block text-primary text-8xl mb-0 animate-in fade-in slide-in-from-bottom duration-500">
                Discover.
              </span>
              <span className="block text-accent text-8xl mb-0 animate-in fade-in slide-in-from-bottom duration-700 delay-100">
                Create.
              </span>
              <span className="block text-primary text-8xl animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
                Lead.
              </span>
            </h1>

            <p className="mt-6 lg:mt-10 max-w-lg font-body text-base sm:text-lg text-gray-600 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
              Welcome to NSS Clubs.
            </p>

            <div className="mt-8 flex flex-row gap-4 justify-start font-body animate-in fade-in slide-in-from-bottom duration-1000 delay-400">
              {/* Primary */}
              <Link
                href="/#clubs"
                className="inline-flex items-center justify-center bg-primary text-white text-base font-semibold tracking-wide px-8 py-3.5 rounded-button shadow-md hover:bg-accent hover:text-primary transition-all duration-300 active:scale-95"
              >
                Explore Clubs
              </Link>
              {/* Secondary */}
              <Link
                href="/#about"
                className="inline-flex items-center justify-center bg-white text-primary text-base font-semibold tracking-wide px-8 py-3.5 rounded-button border-2 border-primary hover:bg-primary hover:text-white transition-all duration-300 active:scale-95"
              >
                About Us
              </Link>
            </div>
          </div>

          {/* Column 2: HeroAtom */}
          <div className="lg:col-span-6 flex items-center justify-center w-full">
            <div className="hero-atom-origin relative w-[640px] h-[640px] flex items-center justify-center overflow-hidden rounded-full bg-slate-50/10" />
          </div>

        </div>
      </div>
    </section>
  );
}
