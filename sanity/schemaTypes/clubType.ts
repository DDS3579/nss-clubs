import { defineField, defineType } from "sanity";

export const clubType = defineType({
  name: "club",
  title: "Clubs",
  type: "document",
  
  fields: [
    defineField({
      name: "name",
      title: "Club Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    
    // 🚨 NEW CONCEPT: SLUG
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name", // Automatically generates the slug from the Club Name
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
    }),

    defineField({
      name: "logo",
      title: "Club Logo",
      type: "image",
      options: { hotspot: true },
    }),

    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      options: { hotspot: true },
      description: "The main banner image for the club's specific page.",
    }),

    // 🚨 NEW CONCEPT: ARRAYS OF REFERENCES
    defineField({
      name: "clubHeads",
      title: "Club Heads",
      type: "array",
      of: [{ type: "reference", to: [{ type: "teamMember" }] }],
      validation: (Rule) => Rule.max(2).unique(), // Max 2 people, and no duplicates!
    }),

    defineField({
      name: "viceHeads",
      title: "Vice Heads",
      type: "array",
      of: [{ type: "reference", to: [{ type: "teamMember" }] }],
      validation: (Rule) => Rule.max(2).unique(),
    }),

    // 🚨 NEW CONCEPT: ARRAY OF STRINGS
    defineField({
      name: "achievements",
      title: "Key Achievements",
      type: "array",
      of: [{ type: "string" }],
      description: "Press 'Add item' to list achievements like 'Won National Robotics 2025'",
    }),
  ],

  preview: {
    select: {
      title: "name",
      media: "logo",
    },
  },
});