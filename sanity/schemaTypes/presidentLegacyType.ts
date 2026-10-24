import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * One document per president's era (Bikram Sambat academic year).
 * The website shows the newest year first, as the "current era".
 */
export const presidentLegacyType = defineType({
  name: "presidentLegacy",
  title: "President's Legacy",
  type: "document",

  groups: [
    { name: "basics", title: "Basics", default: true },
    { name: "numbers", title: "Numbers" },
    { name: "highlights", title: "Achievements & Reforms" },
    { name: "events", title: "Events" },
  ],

  fields: [
    /* ───────── Basics ───────── */
    defineField({
      name: "president",
      title: "President",
      type: "reference",
      to: [{ type: "teamMember" }],
      group: "basics",
      description:
        "Pick the person from All Team Members. If they are missing, add them there first (with their photo).",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "academicYear",
      title: "Academic Year (Bikram Sambat)",
      type: "string",
      group: "basics",
      description: "Use exactly this format: 2082/83. The newest year appears first on the website.",
      validation: (Rule) =>
        Rule.required()
          .regex(/^\d{4}\/\d{2}$/)
          .error("Use the format 2082/83"),
    }),

    defineField({
      name: "tagline",
      title: "Era Tagline",
      type: "string",
      group: "basics",
      description: "One line that sums up their year (optional).",
      validation: (Rule) => Rule.max(120),
    }),

    defineField({
      name: "message",
      title: "Message / Quote",
      type: "text",
      rows: 4,
      group: "basics",
      description: "A short message from the president (optional).",
    }),

    /* ───────── Numbers ───────── */
    defineField({
      name: "eventsConductedCount",
      title: "Number of events conducted",
      type: "number",
      group: "numbers",
      description:
        "Total events held in this era. If you leave it empty, the website counts the list under Events.",
      validation: (Rule) => Rule.min(0).integer(),
    }),

    defineField({
      name: "eventsConductedPlus",
      title: 'Show the events number as "10+"',
      type: "boolean",
      group: "numbers",
      initialValue: false,
      description:
        'Tick this while the number is only a minimum (shows "10+"). Untick it when you have the exact total.',
    }),

    defineField({
      name: "interSchoolCount",
      title: "Number of inter-school events the students joined",
      type: "number",
      group: "numbers",
      description:
        "How many inter-school events NSS students took part in. If empty, the website counts the list under Events.",
      validation: (Rule) => Rule.min(0).integer(),
    }),

    /* ───────── Achievements & Reforms ───────── */
    defineField({
      name: "peakAchievements",
      title: "Peak achievements",
      type: "array",
      group: "highlights",
      of: [{ type: "string" }],
      description: "The 2 to 4 proudest moments of the era. One short sentence each.",
    }),

    defineField({
      name: "achievements",
      title: "Achievements (timeline)",
      type: "array",
      group: "highlights",
      description: "The full list of achievements. Drag to reorder.",
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
            defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
            defineField({
              name: "date",
              title: "When",
              type: "string",
              description: 'Free text, e.g. "Magh 2082" (optional).',
            }),
            defineField({
              name: "image",
              title: "Photo",
              type: "image",
              options: { hotspot: true },
            }),
          ],
          preview: { select: { title: "title", subtitle: "date", media: "image" } },
        }),
      ],
    }),

    defineField({
      name: "reforms",
      title: "Reforms made",
      type: "array",
      group: "highlights",
      of: [{ type: "string" }],
      description: "Changes this president made to how NSS Clubs runs. One short sentence each.",
    }),

    /* ───────── Events ───────── */
    defineField({
      name: "eventsConducted",
      title: "Events conducted",
      type: "array",
      group: "events",
      description: "Events NSS organised in this era.",
      of: [
        defineArrayMember({
          type: "object",
          name: "conductedEvent",
          title: "Event",
          fields: [
            defineField({
              name: "title",
              title: "Event name",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "date",
              title: "When",
              type: "string",
              description: 'Free text, e.g. "Poush 2081" (optional).',
            }),
            defineField({ name: "description", title: "Short note", type: "text", rows: 2 }),
          ],
          preview: { select: { title: "title", subtitle: "date" } },
        }),
      ],
    }),

    defineField({
      name: "interSchoolEvents",
      title: "Inter-school events the students joined",
      type: "array",
      group: "events",
      description: "Events hosted by other schools or organisations where NSS students took part.",
      of: [
        defineArrayMember({
          type: "object",
          name: "interSchoolEvent",
          title: "Inter-school event",
          fields: [
            defineField({
              name: "title",
              title: "Event name",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "host",
              title: "Host school / organiser",
              type: "string",
            }),
            defineField({
              name: "date",
              title: "When",
              type: "string",
              description: 'Free text, e.g. "Falgun 2081" (optional).',
            }),
            defineField({
              name: "result",
              title: "Result",
              type: "string",
              description: 'e.g. "1st place", "Finalist", "Participated" (optional).',
            }),
          ],
          preview: { select: { title: "title", subtitle: "host" } },
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
