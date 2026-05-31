import { defineField, defineType } from "sanity";

export const teamMemberType = defineType({
  name: "teamMember",
  title: "Team Members",
  type: "document",

  fields: [
    defineField({
      name: "name",
      title: "Full Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "photo",
      title: "Profile Photo",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "gender",
      title: "Gender",
      type: "string",
      options: {
        list: [
          { title: "Male", value: "male" },
          { title: "Female", value: "female" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "grade",
      title: "Grade",
      type: "string",
    }),

    defineField({
      name: "bio",
      title: "Short Bio",
      type: "text",
      rows: 4,
    }),

    defineField({
      name: "email",
      title: "Email Address",
      type: "string",
    }),

    defineField({
      name: "linkedIn",
      title: "LinkedIn Profile",
      type: "url",
    }),
  ],

  preview: {
    select: {
      title: "name",
      media: "photo",
      subtitle: "grade",
    },
  },
});