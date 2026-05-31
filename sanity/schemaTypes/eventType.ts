import { defineField, defineType } from "sanity";

export const eventType = defineType({
  name: "event",
  title: "Events",
  type: "document",
  
  fields: [
    defineField({
      name: "title",
      title: "Event Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "description",
      title: "Event Description",
      type: "text",
      rows: 4,
    }),

    // 🚨 NEW CONCEPT: DATETIME
    defineField({
      name: "eventDate",
      title: "Event Date & Time",
      type: "datetime",
      description: "When will this event take place?",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "registrationLink",
      title: "Registration Link",
      type: "url",
      description: "Link to Google Forms or external registration page.",
    }),

    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
    }),

    // Reference to the Club schema we just built!
    defineField({
      name: "associatedClub",
      title: "Associated Club",
      type: "reference",
      to: [{ type: "club" }],
      description: "Which club is hosting this event?",
    }),

    // 🚨 NEW CONCEPT: BOOLEAN (Toggle Switches)
    defineField({
      name: "isFeatured",
      title: "Featured Event?",
      type: "boolean",
      description: "Toggle this to show the event on the homepage banner.",
      initialValue: false,
    }),

    defineField({
      name: "countdownEnabled",
      title: "Enable Countdown Timer?",
      type: "boolean",
      description: "Show a live countdown to the event date on the website.",
      initialValue: false,
    }),
  ],

  preview: {
    select: {
      title: "title",
      subtitle: "eventDate",
      media: "coverImage",
    },
  },
});