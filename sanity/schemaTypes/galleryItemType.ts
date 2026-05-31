import { defineField, defineType } from "sanity";

export const galleryItemType = defineType({
  name: "galleryItem",
  title: "Gallery Items",
  type: "document",
  
  fields: [
    defineField({
      name: "title",
      title: "Image Title / Caption",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { 
        hotspot: true 
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "associatedClub",
      title: "Associated Club",
      type: "reference",
      to: [{ type: "club" }],
      description: "Link this image to a specific club's gallery.",
    }),

    defineField({
      name: "associatedEvent",
      title: "Associated Event",
      type: "reference",
      to: [{ type: "event" }],
      description: "Link this image to a specific event's gallery.",
    }),

    defineField({
      name: "isFeatured",
      title: "Featured in Main Gallery?",
      type: "boolean",
      description: "Show this on the main NSS Clubs homepage gallery.",
      initialValue: false,
    }),
  ],

  // 🚨 NEW CONCEPT: CUSTOM PREVIEW LOGIC
  preview: {
    select: {
      title: "title",
      media: "image",
      clubName: "associatedClub.name",
      eventTitle: "associatedEvent.title",
    },
    prepare(selection) {
      const { title, media, clubName, eventTitle } = selection;
      
      // Let's write a little JavaScript to make the subtitle smart!
      let subtitle = "Global Gallery";
      if (clubName && eventTitle) {
        subtitle = `${clubName} & ${eventTitle}`;
      } else if (clubName) {
        subtitle = `Club: ${clubName}`;
      } else if (eventTitle) {
        subtitle = `Event: ${eventTitle}`;
      }

      return {
        title: title,
        subtitle: subtitle,
        media: media,
      };
    },
  },
});