import { defineField, defineType } from "sanity";

export const itProjectType = defineType({
  name: "itProject",
  title: "IT Project",
  type: "document",

  fields: [
    defineField({
      name: "title",
      title: "Project Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 4,
      description: "What it is and what it does, in 2 to 3 sentences.",
      validation: (Rule) => Rule.required().max(400),
    }),

    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
      description: "A screenshot or photo of the project (wide images look best).",
    }),

    defineField({
      name: "techStack",
      title: "Tech Used",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description: "e.g. Arduino, Python, React. Type and press Enter.",
    }),

    defineField({
      name: "contributors",
      title: "Contributors",
      type: "array",
      of: [{ type: "reference", to: [{ type: "teamMember" }] }],
    }),

    defineField({
      name: "projectUrl",
      title: "Live / Demo link",
      type: "url",
      validation: (Rule) => Rule.uri({ scheme: ["https"] }),
    }),

    defineField({
      name: "githubUrl",
      title: "Source code link",
      type: "url",
      validation: (Rule) => Rule.uri({ scheme: ["https"] }),
    }),

    defineField({
      name: "date",
      title: "Project Date",
      type: "date",
      description: "Used to show the newest projects first.",
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
    select: { title: "title", subtitle: "date", media: "coverImage" },
  },
});
