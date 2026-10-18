import type { Metadata } from "next";
import Image from "next/image";
import ConstellationFooter from "@/components/layout/ConstellationFooter";
import PageHero from "@/components/pages/PageHero";
import { sanityCoverUrl } from "@/sanity/lib/imageMeta";
import { getItTeam, type ItMember, type ItProject } from "@/sanity/lib/itTeam";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "NSS IT Team | NSS Clubs",
  description:
    "Meet the NSS IT Team: a specialized team of digital innovators building science projects and digital tools.",
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs font-semibold text-primary underline-offset-4 hover:text-accent hover:underline"
    >
      {children}
    </a>
  );
}

function MemberCard({ member }: { member: ItMember }) {
  const { person } = member;
  return (
    <li className="flex flex-col items-center rounded-card bg-white p-6 text-center shadow-md ring-1 ring-primary/5">
      <div className="relative h-28 w-28 overflow-hidden rounded-full bg-primary/5 ring-4 ring-accent/40">
        {person.photo ? (
          <Image
            src={sanityCoverUrl(person.photo, 280, 280)}
            alt={person.name}
            fill
            unoptimized
            sizes="112px"
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

      <span
        className={`mt-4 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
          member.isLead ? "bg-accent text-primary" : "bg-primary text-white"
        }`}
      >
        {member.isLead ? `Team Lead · ${member.roleTitle}` : member.roleTitle}
      </span>
      <h3 className="mt-3 font-display text-lg font-bold text-primary">{person.name}</h3>
      {person.grade && <p className="text-sm text-text/70">{person.grade}</p>}

      {member.skills.length > 0 && (
        <ul className="mt-4 flex flex-wrap justify-center gap-1.5">
          {member.skills.slice(0, 6).map((skill) => (
            <li
              key={skill}
              className="rounded-full bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary"
            >
              {skill}
            </li>
          ))}
        </ul>
      )}

      {(member.githubUrl || member.linkedinUrl) && (
        <div className="mt-4 flex gap-4">
          {member.githubUrl && <ExternalLink href={member.githubUrl}>GitHub</ExternalLink>}
          {member.linkedinUrl && <ExternalLink href={member.linkedinUrl}>LinkedIn</ExternalLink>}
        </div>
      )}
    </li>
  );
}

function ProjectCard({ project }: { project: ItProject }) {
  return (
    <li className="flex flex-col overflow-hidden rounded-card bg-white shadow-md ring-1 ring-primary/5">
      <div className="relative aspect-video w-full bg-gradient-to-br from-primary to-primary/70">
        {project.coverImage && (
          <Image
            src={sanityCoverUrl(project.coverImage, 800, 450)}
            alt={project.title}
            fill
            unoptimized
            sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {project.date && (
          <p className="text-xs font-bold uppercase tracking-wider text-accent">
            {project.date.slice(0, 4)}
          </p>
        )}
        <h3 className="mt-1 font-display text-lg font-bold text-primary">{project.title}</h3>
        {project.summary && <p className="mt-2 text-sm text-text/80">{project.summary}</p>}

        {project.techStack.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {project.techStack.map((tech) => (
              <li
                key={tech}
                className="rounded-full bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary"
              >
                {tech}
              </li>
            ))}
          </ul>
        )}

        {project.contributors.length > 0 && (
          <p className="mt-4 text-xs text-text/60">
            By {project.contributors.map((person) => person.name).join(", ")}
          </p>
        )}

        {(project.projectUrl || project.githubUrl) && (
          <div className="mt-auto flex gap-4 pt-4">
            {project.projectUrl && <ExternalLink href={project.projectUrl}>View project</ExternalLink>}
            {project.githubUrl && <ExternalLink href={project.githubUrl}>Source code</ExternalLink>}
          </div>
        )}
      </div>
    </li>
  );
}

export default async function ItTeamPage() {
  const { tagline, intro, mission, members, projects } = await getItTeam();

  return (
    <>
      <main id="main-content">
        <PageHero eyebrow="Digital innovators" title="NSS IT Team" subtitle={tagline} />

        <section aria-label="About the IT team" className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-card bg-white p-6 shadow-md ring-1 ring-primary/5 sm:p-8">
              <h2 className="font-display text-xl font-bold text-primary">Who we are</h2>
              <p className="mt-3 whitespace-pre-line text-sm text-text/80 sm:text-base">{intro}</p>
            </div>
            <div className="rounded-card bg-primary p-6 text-white shadow-md sm:p-8">
              <h2 className="font-display text-xl font-bold text-accent">Our mission</h2>
              <p className="mt-3 whitespace-pre-line text-sm text-white/85 sm:text-base">{mission}</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="members-heading" className="mx-auto max-w-6xl px-6 pb-12 lg:px-8">
          <h2 id="members-heading" className="font-display text-2xl font-bold text-primary">
            The team
          </h2>
          {members.length > 0 ? (
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <MemberCard key={member._id} member={member} />
              ))}
            </ul>
          ) : (
            <p className="mt-6 rounded-card bg-primary/5 px-6 py-8 text-center text-text/80">
              The IT team will be introduced here soon.
            </p>
          )}
        </section>

        <section aria-labelledby="projects-heading" className="bg-slate-50 py-12">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <h2 id="projects-heading" className="font-display text-2xl font-bold text-primary">
              Projects
            </h2>
            {projects.length > 0 ? (
              <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <ProjectCard key={project._id} project={project} />
                ))}
              </ul>
            ) : (
              <p className="mt-6 rounded-card bg-white px-6 py-8 text-center text-text/80">
                Our science projects will be showcased here soon.
              </p>
            )}
          </div>
        </section>
      </main>
      <ConstellationFooter />
    </>
  );
}
