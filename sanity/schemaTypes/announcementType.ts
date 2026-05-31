import { defineField, defineType } from "sanity";

export const announcementType = defineType({
  name: "announcement",
  title: "Announcements",
  type: "document",
  
  fields: [
    defineField({
      name: "title",
      title: "Notice Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    
    defineField({
      name: "content",
      title: "Notice Content",
      type: "text",
      rows: 4,
      description: "Keep it brief. This is for standard notices.",
    }),

    defineField({
      name: "isActive",
      title: "Active?",
      type: "boolean",
      initialValue: true,
      description: "Toggle off to hide this notice from the website without deleting it.",
    }),

    // 🚨 NEW CONCEPT: DATE (No time, just the day)
    defineField({
      name: "expiryDate",
      title: "Expiry Date",
      type: "date",
      description: "The notice will automatically hide from the frontend after this date.",
    }),
  ],

  preview: {
    select: {
      title: "title",
      isActive: "isActive",
      expiryDate: "expiryDate",
    },
    // Smart Preview: Show a green or red dot based on the toggle!
    prepare({ title, isActive, expiryDate }) {
      return {
        title: title,
        subtitle: `Expires: ${expiryDate || "No expiry"}`,
        media: () => isActive ? "🟢" : "🔴", // Using emojis as media icons!
      };
    },
  },
});