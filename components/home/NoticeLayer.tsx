"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { Announcement, Popup } from "@/sanity/lib/notices";

const ANNOUNCEMENT_KEY = "nss:dismissed-announcements";
const POPUP_KEY = "nss:seen-popups";
const POPUP_DELAY_MS = 1500;

function readIds(key: string): string[] {
  try {
    const raw = window.sessionStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return []; // storage can be blocked (private mode); just treat as "nothing saved"
  }
}

function writeIds(key: string, ids: string[]) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // storage can be blocked; the notice will simply show again next visit
  }
}

/**
 * Homepage notices:
 *  - announcements: small dismissible cards under the navbar
 *  - popup: one modal, shown once per browser session
 * Dismissals are remembered for the session only, so a new visit sees them again
 * until they expire in the Studio.
 */
export default function NoticeLayer({
  announcements,
  popup,
}: {
  announcements: Announcement[];
  popup: Popup | null;
}) {
  const [dismissed, setDismissed] = useState<string[] | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Read saved dismissals after mount, so server and browser render the same first frame
  useEffect(() => {
    const timer = setTimeout(() => setDismissed(readIds(ANNOUNCEMENT_KEY)), 0);
    return () => clearTimeout(timer);
  }, []);

  // Show the popup a moment after the page loads, unless already seen this session
  useEffect(() => {
    if (!popup) return;
    const id = popup._id;
    const timer = setTimeout(() => {
      if (!readIds(POPUP_KEY).includes(id)) setPopupOpen(true);
    }, POPUP_DELAY_MS);
    return () => clearTimeout(timer);
  }, [popup]);

  // Keep the native <dialog> in step with state, and freeze the page behind it
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (popupOpen && !dialog.open) dialog.showModal();
    if (!popupOpen && dialog.open) dialog.close();
    if (!popupOpen) return;

    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [popupOpen]);

  const dismissAnnouncement = (id: string) => {
    setDismissed((current) => {
      const next = [...(current ?? []), id];
      writeIds(ANNOUNCEMENT_KEY, next);
      return next;
    });
  };

  const closePopup = () => {
    setPopupOpen(false);
    if (popup) {
      const seen = readIds(POPUP_KEY);
      if (!seen.includes(popup._id)) writeIds(POPUP_KEY, [...seen, popup._id]);
    }
  };

  const visibleAnnouncements =
    dismissed === null ? [] : announcements.filter((a) => !dismissed.includes(a._id));

  const ctaUrl = popup?.ctaLink && /^https?:\/\//.test(popup.ctaLink) ? popup.ctaLink : null;

  return (
    <>
      {visibleAnnouncements.length > 0 && (
        <div className="pointer-events-none fixed inset-x-0 top-24 z-30 flex flex-col items-center gap-2 px-4">
          {visibleAnnouncements.map((notice) => (
            <section
              key={notice._id}
              aria-label="Announcement"
              className="pointer-events-auto flex w-full max-w-xl items-start gap-3 rounded-card bg-primary p-4 text-white shadow-lg ring-1 ring-white/10"
            >
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-bold sm:text-base">{notice.title}</p>
                {notice.content && (
                  <p className="mt-1 line-clamp-3 text-sm text-white/85">{notice.content}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissAnnouncement(notice._id)}
                aria-label={`Dismiss announcement: ${notice.title}`}
                className="-mr-1 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </section>
          ))}
        </div>
      )}

      {popup && (
        <dialog
          ref={dialogRef}
          aria-labelledby="popup-title"
          data-lenis-prevent
          onClose={closePopup}
          onClick={(e) => {
            if (e.target === e.currentTarget) closePopup();
          }}
          className="m-auto w-[calc(100%-2rem)] max-w-md rounded-card bg-white p-0 text-text shadow-2xl backdrop:bg-black/60"
        >
          <div className="relative p-6 sm:p-8">
            <button
              type="button"
              onClick={closePopup}
              aria-label="Close"
              className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full text-text/60 transition hover:bg-primary/5 hover:text-primary"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            <h2 id="popup-title" className="pr-10 font-display text-2xl font-bold text-primary">
              {popup.title}
            </h2>
            {popup.message && (
              <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-text/90">
                {popup.message}
              </p>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {ctaUrl && (
                <a
                  href={ctaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closePopup}
                  className="inline-flex flex-1 items-center justify-center rounded-button bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-accent hover:text-primary"
                >
                  {popup.ctaText || "Learn more"}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
              <button
                type="button"
                onClick={closePopup}
                className="inline-flex flex-1 items-center justify-center rounded-button bg-white px-6 py-3 text-sm font-semibold text-primary ring-1 ring-primary/15 transition hover:bg-primary/5"
              >
                {ctaUrl ? "Maybe later" : "Got it"}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}