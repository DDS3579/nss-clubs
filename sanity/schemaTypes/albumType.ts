import { defineField, defineType } from "sanity";

/**
 * OPTIONAL — needs your OK before you add it (see the chat message).
 *
 * One document per full photo album that lives on Google Drive.
 * The website shows the cover photo (stored in Sanity, fast) and the card
 * opens the Drive album in a new tab. The Drive folder must be shared as
 * "Anyone with the link can view".
 */
export const albumType = defineType({
  name: "album",
  title: "Photo Albums (Google Drive)",
  type: "document",

  fields: [
    defineField({
      name: "title",
      title: "Album Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "driveUrl",
      title: "Google Drive Link",
      type: "url",
      description: 'Share the folder as "Anyone with the link", then paste the link here.',
      validation: (Rule) => Rule.required().uri({ scheme: ["https"] }),
    }),

    defineField({
      name: "coverImage",
      title: "Cover Photo",
      type: "image",
      options: { hotspot: true },
      description: "One good photo from the album. This is what visitors see on the site.",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "date",
      title: "Album Date",
      type: "date",
    }),

    defineField({
      name: "description",
      title: "Short Description",
      type: "text",
      rows: 3,
    }),

    defineField({
      name: "associatedClub",
      title: "Associated Club",
      type: "reference",
      to: [{ type: "club" }],
    }),

    defineField({
      name: "associatedEvent",
      title: "Associated Event",
      type: "reference",
      to: [{ type: "event" }],
    }),
  ],

  orderings: [
    {
      title: "Newest first",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],

  preview: {
    select: {
      title: "title",
      subtitle: "date",
      media: "coverImage",
    },
  },
});