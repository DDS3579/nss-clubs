import { defineField, defineType } from "sanity";

export const itTeamMemberType = defineType({
  name: "itTeamMember",
  title: "IT Team Member",
  type: "document",

  fields: [
    defineField({
      name: "member",
      title: "Person",
      type: "reference",
      to: [{ type: "teamMember" }],
      description:
        "Pick the person from All Team Members. If they are missing, add them there first.",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "roleTitle",
      title: "Role in the IT Team",
      type: "string",
      description: 'e.g. "Lead Developer", "UI Designer", "Robotics Engineer".',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "isLead",
      title: "Team Lead?",
      type: "boolean",
      description: "Leads are shown first and get a gold badge.",
      initialValue: false,
    }),

    defineField({
      name: "skills",
      title: "Skills",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description: "Type a skill and press Enter. The first 6 are shown on the card.",
    }),

    defineField({
      name: "displayOrder",
      title: "Display Order",
      type: "number",
      description: "Lower numbers come first (1, 2, 3...). Leave empty to put them last.",
    }),

    defineField({
      name: "githubUrl",
      title: "GitHub link",
      type: "url",
      validation: (Rule) => Rule.uri({ scheme: ["https"] }),
    }),

    defineField({
      name: "linkedinUrl",
      title: "LinkedIn link",
      type: "url",
      validation: (Rule) => Rule.uri({ scheme: ["https"] }),
    }),
  ],

  orderings: [
    {
      title: "Display order",
      name: "displayOrderAsc",
      by: [{ field: "displayOrder", direction: "asc" }],
    },
  ],

  preview: {
    select: {
      title: "member.name",
      subtitle: "roleTitle",
      media: "member.photo",
    },
  },
});
