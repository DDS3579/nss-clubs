import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * One document per president's era.
 * The website shows the newest academic year first, as the "current era".
 */
export const presidentLegacyType = defineType({
  name: "presidentLegacy",
  title: "President's Legacy",
  type: "document",

  fields: [
    defineField({
      name: "president",
      title: "President",
      type: "reference",
      to: [{ type: "teamMember" }],
      description:
        "Pick the person from All Team Members. If they are missing, add them there first.",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "academicYear",
      title: "Academic Year (their era)",
      type: "string",
      description: "e.g., 2082/83. The newest year appears first on the website.",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "tagline",
      title: "Era Tagline",
      type: "string",
      description: "One line that sums up their year (optional).",
      validation: (Rule) => Rule.max(120),
    }),

    defineField({
      name: "message",
      title: "Message / Quote",
      type: "text",
      rows: 4,
      description: "A short message from the president (optional).",
    }),

    defineField({
      name: "achievements",
      title: "Achievements",
      type: "array",
      description: "Add one item per achievement. Drag to reorder.",
      of: [
        defineArrayMember({
          type: "object",
          name: "achievement",
          title: "Achievement",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "text",
              rows: 3,
            }),
            defineField({
              name: "date",
              title: "When",
              type: "string",
              description: 'Free text, e.g. "Magh 2082" or "March 2026" (optional).',
            }),
            defineField({
              name: "image",
              title: "Photo",
              type: "image",
              options: { hotspot: true },
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "date", media: "image" },
          },
        }),
      ],
    }),
  ],

  orderings: [
    {
      title: "Newest era first",
      name: "yearDesc",
      by: [{ field: "academicYear", direction: "desc" }],
    },
  ],

  preview: {
    select: {
      title: "president.name",
      subtitle: "academicYear",
      media: "president.photo",
    },
  },
});
