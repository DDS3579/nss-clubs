import Image from "next/image";
import Link from "next/link";
import { formatEventDate, formatEventTime, getDateBadge } from "@/lib/dates";
import { sanityCoverUrl } from "@/sanity/lib/imageMeta";
import type { EventListItem } from "@/sanity/lib/types";

export default function EventCard({
  event,
  past = false,
}: {
  event: EventListItem;
  past?: boolean;
}) {
  const badge = getDateBadge(event.eventDate);
  const time = formatEventTime(event.eventDate);

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-card bg-white text-text shadow-md ring-1 ring-primary/5 transition duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-linear-to-br from-primary to-primary/70">
        {event.coverImage && (
          <Image
            src={sanityCoverUrl(event.coverImage, 800, 500)}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={`object-cover transition duration-500 group-hover:scale-105 ${
              past ? "grayscale-[35%] group-hover:grayscale-0" : ""
            }`}
          />
        )}
        {badge && (
          <div className="absolute left-3 top-3 w-14 overflow-hidden rounded-xl bg-white text-center shadow-md">
            <div className="bg-accent py-0.5 text-[10px] font-bold tracking-widest text-primary">
              {badge.month}
            </div>
            <div className="py-1 font-display text-xl font-bold leading-none text-primary">
              {badge.day}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        {event.club && (
          <span className="w-fit rounded-full bg-primary/5 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary">
            {event.club.name}
          </span>
        )}
        <h3 className="font-display text-lg font-bold leading-snug text-primary">{event.title}</h3>
        <p className="text-sm font-medium text-text/70">
          {formatEventDate(event.eventDate, "short")}
          {time ? ` · ${time}` : ""}
        </p>
        {event.description && <p className="line-clamp-2 text-sm text-text/80">{event.description}</p>}
      </div>
    </Link>
  );
}