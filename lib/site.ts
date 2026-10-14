/**
 * Site-wide settings in ONE place: name, address of the site, contact details.
 *
 * ⚠ The contact details below are EMPTY on purpose. Fill in what you want
 * visitors to see; anything left empty simply does not appear on /contact.
 */

const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
// Vercel provides this automatically for the production domain
const fromVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export interface SocialLink {
  label: string;
  url: string;
}

export const SITE = {
  name: "NSS Clubs",
  description: "Empowering students through service, leadership, and innovation.",

  /** Public address of the site, used for sharing previews and the sitemap. */
  url: fromEnv ?? (fromVercel ? `https://${fromVercel}` : "http://localhost:3000"),

  contact: {
    /** e.g. "nssclubs@example.com" */
    email: "",
    /** e.g. "+977 98XXXXXXXX" */
    phone: "",
    /** e.g. "NSS Clubs office, Main Building, Room 12" */
    address: "",
    /** e.g. [{ label: "Instagram", url: "https://instagram.com/yourclub" }] */
    socials: [] as SocialLink[],
  },
};