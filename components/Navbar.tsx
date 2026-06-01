"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Home, Compass, Info, Calendar, Image as ImageIcon, Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", text: "Home", icon: Home },
  { href: "/#clubs", text: "Clubs", icon: Compass },
  { href: "/#about", text: "About", icon: Info },
  { href: "/#events", text: "Events", icon: Calendar },
  { href: "/#gallery", text: "Gallery", icon: ImageIcon },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Add box-shadow and reduce height slightly on scroll for a premium feel
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full bg-white transition-all duration-300 ${
          isScrolled
            ? "h-16 shadow-md border-b border-gray-100"
            : "h-20 border-b border-gray-100"
        }`}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-8">
          
          {/* LEFT: Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="relative h-12 w-12 overflow-hidden rounded-lg transition-transform duration-300 hover:scale-105">
              <Image
                src="/images/logo.jpg"
                alt="NSS Logo"
                fill
                sizes="40px"
                className="object-cover"
                priority
              />
            </div>
            {/* <span className="font-display text-lg font-bold tracking-tight text-primary transition-colors duration-300 hover:text-accent">
              NSS CLUBS
            </span> */}
          </Link>

          {/* MIDDLE: Desktop Nav Links with Sliding Hover Effect */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-3 border-gray-100 px-4 py-1.5 rounded-full">
            {NAV_ITEMS.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.text}
                  href={item.href}
                  className="group relative flex items-center justify-start h-10 rounded-full px-2 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-primary/5 hover:pr-4"
                  style={{ minWidth: "40px" }}
                >
                  {/* Circular icon container */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full text-primary bg-transparent transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] shrink-0">
                    <IconComponent className="w-4.5 h-4.5 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:text-bg" />
                  </div>

                  {/* Sliding text */}
                  <span className="max-w-0 opacity-0 overflow-hidden whitespace-nowrap text-primary font-body text-xs font-semibold tracking-wide uppercase transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:max-w-[100px] group-hover:opacity-100 group-hover:ml-2">
                    {item.text}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: CTA Button (Desktop) & Hamburger (Mobile) */}
          <div className="flex items-center gap-4">
            <Link
              href="/#contact"
              className="hidden md:inline-flex items-center justify-center bg-primary text-bg text-sm font-semibold tracking-wide px-5 py-2.5 rounded-button shadow-sm hover:bg-accent hover:text-primary transition-all duration-300 active:scale-95"
            >
              Contact Us
            </Link>

            {/* Hamburger Button */}
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-full text-primary hover:bg-gray-100 transition-colors md:hidden focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 animate-in fade-in zoom-in duration-200" />
              ) : (
                <Menu className="w-6 h-6 animate-in fade-in zoom-in duration-200" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE OVERLAY MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={toggleMobileMenu}
          />

          {/* Drawer content */}
          <div className="fixed right-0 top-0 bottom-0 w-[280px] max-w-sm bg-white p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 ease-out border-l border-gray-100">
            <div className="flex flex-col gap-8 mt-16">
              
              {/* Mobile links list */}
              <nav className="flex flex-col gap-4">
                {NAV_ITEMS.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.text}
                      href={item.href}
                      onClick={toggleMobileMenu}
                      className="flex items-center gap-4 px-4 py-3 rounded-xl text-primary font-body text-base font-semibold hover:bg-primary/5 transition-all duration-200 active:bg-primary/10 border border-transparent hover:border-gray-100"
                    >
                      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/5 text-primary">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span>{item.text}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile CTA */}
            <div className="mt-auto pt-6 border-t border-gray-100">
              <Link
                href="/#contact"
                onClick={toggleMobileMenu}
                className="flex w-full items-center justify-center bg-primary text-white text-base font-semibold py-3.5 rounded-button shadow-md hover:bg-accent hover:text-primary transition-all duration-300 active:scale-[0.98]"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
