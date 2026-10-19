import { defineField, defineType } from "sanity";

/**
 * Singleton: only ONE of these should exist. In the Studio sidebar it opens
 * directly (NSS IT Team → Team Page Text), so there is nothing to "create".
 */
export const itTeamPageType = defineType({
  name: "itTeamPage",
  title: "IT Team Page Text",
  type: "document",

  fields: [
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      description: "Shown under the page title.",
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: "intro",
      title: "Who we are",
      type: "text",
      rows: 5,
    }),
    defineField({
      name: "mission",
      title: "Our mission",
      type: "text",
      rows: 4,
    }),
  ],

  preview: {
    prepare() {
      return { title: "NSS IT Team: page text" };
    },
  },
});
