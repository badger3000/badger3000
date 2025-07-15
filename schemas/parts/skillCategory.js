// schemas/parts/skillCategory.js
export default {
  title: "Skill Categories",
  name: "skillCategory",
  type: "document",
  fields: [
    {
      title: "Category Name",
      name: "name",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      title: "Display Order",
      name: "order",
      type: "number",
      description: "Lower numbers appear first",
    },
    {
      title: "Skills",
      name: "skills",
      type: "array",
      of: [
        {
          type: "object",
          name: "skill",
          title: "Skill",
          fields: [
            {
              title: "Name",
              name: "name",
              type: "string",
              validation: (Rule) => Rule.required(),
            },
            {
              title: "Badge Type",
              name: "badgeType",
              type: "string",
              options: {
                list: [
                  {title: "Shields.io (Auto-generated)", value: "shields"},
                  {title: "Custom URL", value: "custom"},
                ],
              },
              initialValue: "shields",
            },
            {
              title: "Badge Label",
              name: "badgeLabel",
              type: "string",
              description:
                'Text shown on the badge (e.g., "React", "JavaScript")',
              hidden: ({parent}) => parent?.badgeType !== "shields",
            },
            {
              title: "Badge Color",
              name: "badgeColor",
              type: "string",
              description: 'Hex color without # (e.g., "20232A", "F7DF1E")',
              hidden: ({parent}) => parent?.badgeType !== "shields",
            },
            {
              title: "Logo Name",
              name: "logoName",
              type: "string",
              description:
                'Simple Icons logo name (e.g., "react", "javascript")',
              hidden: ({parent}) => parent?.badgeType !== "shields",
            },
            {
              title: "Logo Color",
              name: "logoColor",
              type: "string",
              description:
                'Logo color hex without # (e.g., "61DAFB", "white"). Defaults to white',
              hidden: ({parent}) => parent?.badgeType !== "shields",
            },
            {
              title: "Custom Badge URL",
              name: "customBadgeUrl",
              type: "url",
              description: "Full URL to custom badge image",
              hidden: ({parent}) => parent?.badgeType !== "custom",
            },
            {
              title: "Website URL",
              name: "websiteUrl",
              type: "url",
              description: "Link to official website/documentation",
            },
            {
              title: "Display Order",
              name: "order",
              type: "number",
              description: "Order within this category",
            },
          ],
          preview: {
            select: {
              title: "name",
              subtitle: "websiteUrl",
            },
          },
        },
      ],
    },
  ],
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{field: "order", direction: "asc"}],
    },
  ],
  preview: {
    select: {
      title: "name",
      skills: "skills",
    },
    prepare(selection) {
      const {title, skills} = selection;
      return {
        title,
        subtitle: `${skills?.length || 0} skills`,
      };
    },
  },
};
