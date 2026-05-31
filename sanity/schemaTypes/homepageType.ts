import { defineField, defineType } from "sanity";

export const homepageType = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  
  // Grouping fields into clean, collapsible sections
  fieldsets: [
    { name: "president", title: "President's Message", options: { collapsible: true, collapsed: false } },
    { name: "stats", title: "Legacy & Achievements", options: { collapsible: true, collapsed: false } },
  ],

  fields: [
    // --- PRESIDENT MESSAGE (Dynamic) ---
    defineField({
      name: "presidentMessage",
      title: "President's Message",
      type: "text",
      fieldset: "president",
      rows: 6,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "presidentPhoto",
      title: "President's Photo",
      type: "image",
      fieldset: "president",
      options: { hotspot: true },
    }),

    // --- FEATURED EVENTS (Dynamic) ---
    defineField({
      name: "featuredEvents",
      title: "Featured Events",
      type: "array",
      of: [{ type: "reference", to: [{ type: "event" }] }],
      description: "Select the events to highlight on the homepage banner.",
    }),

    // --- GALLERY SHOWCASE (Dynamic) ---
    defineField({
      name: "featuredGallery",
      title: "Homepage Gallery Showcase",
      type: "array",
      of: [{ type: "reference", to: [{ type: "galleryItem" }] }],
      description: "Select and drag-to-reorder the specific gallery items to showcase on the homepage.",
    }),

    // --- LEGACY STATISTICS (Dynamic) ---
    defineField({
      name: "legacyStats",
      title: "Legacy Statistics & Achievements",
      type: "array",
      fieldset: "stats",
      of: [
        {
          type: "object",
          name: "stat",
          fields: [
            defineField({
              name: "label",
              title: "Stat Label",
              type: "string",
              description: "e.g., 'Years of Service'",
            }),
            defineField({
              name: "value",
              title: "Stat Value",
              type: "string",
              description: "e.g., '50+' or '10,000 Hours'",
            }),
          ],
          preview: {
            select: {
              title: "label",
              subtitle: "value",
            },
          },
        },
      ],
    }),
  ],

  preview: {
    select: {
      media: "presidentPhoto",
    },
    prepare() {
      return {
        title: "Homepage Configuration",
        subtitle: "Manage dynamic homepage sections",
      };
    },
  },
});