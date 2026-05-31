import { defineField, defineType } from "sanity";

export const popupType = defineType({
  name: "popup",
  title: "Popups",
  type: "document",
  
  fields: [
    defineField({
      name: "title",
      title: "Popup Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    
    defineField({
      name: "message",
      title: "Popup Message",
      type: "text",
      rows: 3,
    }),

    defineField({
      name: "ctaText",
      title: "Button Text (CTA)",
      type: "string",
      description: "e.g., 'Register Now' or 'Read More'",
    }),

    defineField({
      name: "ctaLink",
      title: "Button Link",
      type: "url",
    }),

    defineField({
      name: "isActive",
      title: "Active?",
      type: "boolean",
      initialValue: true,
    }),

    // We use datetime here because popups might need to go live at a specific hour
    defineField({
      name: "startDate",
      title: "Start Date & Time",
      type: "datetime",
    }),

    defineField({
      name: "expiryDate",
      title: "Expiry Date & Time",
      type: "datetime",
    }),
  ],

  preview: {
    select: {
      title: "title",
      isActive: "isActive",
    },
    prepare({ title, isActive }) {
      return {
        title: title,
        subtitle: isActive ? "Live on Homepage" : "Hidden",
      };
    },
  },
});