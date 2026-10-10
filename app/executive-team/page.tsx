import type { Metadata } from "next";
import Image from "next/image";
import ConstellationFooter from "@/components/layout/ConstellationFooter";
import PageHero from "@/components/pages/PageHero";
import { sanityCoverUrl } from "@/sanity/lib/imageMeta";
import { getExecutiveBoards } from "@/sanity/lib/queries";
import type { ExecutiveMember } from "@/sanity/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Executive Team | NSS Clubs",
  description: "Meet the students and advisor leading NSS Clubs this year.",
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function MemberCard({ role, person }: ExecutiveMember) {
  return (
    <li className="flex flex-col items-center rounded-card bg-white p-6 text-center shadow-md ring-1 ring-primary/5">
      <div className="relative h-32 w-32 overflow-hidden rounded-full bg-primary/5 ring-4 ring-accent/40">
        {person.photo ? (
          <Image
            src={sanityCoverUrl(person.photo, 320, 320)}
            alt={person.name}
            fill
            unoptimized
            sizes="128px"
            className="object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center font-display text-3xl font-bold text-primary/60"
          >
            {initials(person.name)}
          </span>
        )}
      </div>
      <span className="mt-4 rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
        {role}
      </span>
      <h3 className="mt-3 font-display text-lg font-bold text-primary">{person.name}</h3>
      {person.grade && <p className="text-sm text-text/70">{person.grade}</p>}
      {person.bio && <p className="mt-3 line-clamp-4 text-sm text-text/80">{person.bio}</p>}
    </li>
  );
}

export default async function ExecutiveTeamPage() {
  const boards = await getExecutiveBoards();
  const [current, ...previous] = boards;

  return (
    <>
      <main>
        <PageHero
          eyebrow={current ? `Academic year ${current.year}` : "Leadership"}
          title="Executive Team"
          subtitle="The students and advisor steering NSS Clubs: the nucleus every club orbits."
        />

        <section aria-label="Current executive team" className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
          {current && current.members.length > 0 ? (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {current.members.map((member) => (
                <MemberCard key={`${member.role}-${member.person._id}`} {...member} />
              ))}
            </ul>
          ) : (
            <p className="rounded-card bg-primary/5 px-6 py-8 text-center text-text/80">
              The executive team will be announced here soon.
            </p>
          )}
        </section>

        {previous.length > 0 && (
          <section aria-labelledby="previous-heading" className="bg-slate-50 py-12">
            <div className="mx-auto max-w-4xl px-6 lg:px-8">
              <h2 id="previous-heading" className="font-display text-2xl font-bold text-primary">
                Previous teams
              </h2>
              <div className="mt-6 flex flex-col gap-3">
                {previous.map((board) => (
                  <details
                    key={board._id}
                    className="group rounded-card bg-white p-5 shadow-sm ring-1 ring-primary/5"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold text-primary">
                      <span>{board.year}</span>
                      <span className="text-sm font-medium text-text/60">
                        {board.members.length} {board.members.length === 1 ? "member" : "members"}
                      </span>
                    </summary>
                    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                      {board.members.map((member) => (
                        <li key={`${member.role}-${member.person._id}`} className="flex items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-primary/5">
                            {member.person.photo && (
                              <Image
                                src={sanityCoverUrl(member.person.photo, 80, 80)}
                                alt=""
                                fill
                                unoptimized
                                sizes="40px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-text">{member.person.name}</p>
                            <p className="text-xs text-text/60">{member.role}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <ConstellationFooter />
    </>
  );
}