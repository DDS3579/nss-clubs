import { defineField, defineType } from "sanity";

export const executiveTeamType = defineType({
  name: "executiveTeam",
  title: "Executive Team",
  type: "document",

  fields: [
    defineField({
      name: "year",
      title: "Academic Year",
      type: "string",
      description: "e.g., 2082/83",
      validation: (Rule) => Rule.required(),
    }),
    
    // --- CORE ROLES ---
    defineField({
      name: "president",
      title: "President",
      type: "reference", // 🔥 THIS IS THE MAGIC
      to: [{ type: "teamMember" }], // Points to our previous schema!
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "advisor",
      title: "Advisor",
      type: "reference",
      to: [{ type: "teamMember" }],
    }),
    defineField({
      name: "secretary",
      title: "Secretary",
      type: "reference",
      to: [{ type: "teamMember" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "treasurer",
      title: "Treasurer",
      type: "reference",
      to: [{ type: "teamMember" }],
      validation: (Rule) => Rule.required(),
    }),

    // --- VICE ROLES ---
    defineField({
      name: "vicePresident1",
      title: "Vice President 1",
      type: "reference",
      to: [{ type: "teamMember" }],
    }),
    defineField({
      name: "vicePresident2",
      title: "Vice President 2",
      type: "reference",
      to: [{ type: "teamMember" }],
    }),
    defineField({
      name: "viceSecretary",
      title: "Vice Secretary",
      type: "reference",
      to: [{ type: "teamMember" }],
    }),
    defineField({
      name: "viceTreasurer",
      title: "Vice Treasurer",
      type: "reference",
      to: [{ type: "teamMember" }],
    }),
  ],

  // Preview Magic ✨
  preview: {
    select: {
      title: "year",
      subtitle: "president.name", // Sanity automatically follows the reference to get the name!
      media: "president.photo",  // And follows it again to get the photo!
    },
  },
});