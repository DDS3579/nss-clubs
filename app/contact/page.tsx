import type { Metadata } from "next";
import type { ComponentType } from "react";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import ConstellationFooter from "@/components/layout/ConstellationFooter";
import PageHero from "@/components/pages/PageHero";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact | NSS Clubs",
  description: "Get in touch with the NSS Clubs executive team.",
};

type Icon = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;

function ContactRow({
  icon: IconComponent,
  label,
  children,
}: {
  icon: Icon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-4 rounded-card bg-white p-5 shadow-md ring-1 ring-primary/5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary">
        <IconComponent className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-text/60">{label}</p>
        <div className="mt-1 break-words font-medium text-text">{children}</div>
      </div>
    </li>
  );
}

export default function ContactPage() {
  const { email, phone, address, socials } = SITE.contact;
  const hasAny = Boolean(email || phone || address || socials.length > 0);

  return (
    <>
      <main id="main-content">
        <PageHero
          eyebrow="Get in touch"
          title="Contact us"
          subtitle="Questions, ideas, or want to join a club? Reach out to the executive team."
        />

        <section aria-label="Contact details" className="mx-auto max-w-3xl px-6 py-12 lg:px-8">
          {hasAny ? (
            <ul className="grid gap-4">
              {email && (
                <ContactRow icon={Mail} label="Email">
                  <a href={`mailto:${email}`} className="text-primary underline underline-offset-2 hover:text-accent">
                    {email}
                  </a>
                </ContactRow>
              )}
              {phone && (
                <ContactRow icon={Phone} label="Phone">
                  <a
                    href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                    className="text-primary underline underline-offset-2 hover:text-accent"
                  >
                    {phone}
                  </a>
                </ContactRow>
              )}
              {address && (
                <ContactRow icon={MapPin} label="Find us">
                  <span className="whitespace-pre-line">{address}</span>
                </ContactRow>
              )}
              {socials
                .filter((social) => /^https:\/\//.test(social.url))
                .map((social) => (
                  <ContactRow key={social.url} icon={ExternalLink} label={social.label}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2 hover:text-accent"
                    >
                      {social.url.replace(/^https:\/\/(www\.)?/, "")}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </ContactRow>
                ))}
            </ul>
          ) : (
            <p className="rounded-card bg-primary/5 px-6 py-8 text-center text-text/80">
              Contact details are coming soon.
            </p>
          )}
        </section>
      </main>
      <ConstellationFooter />
    </>
  );
}