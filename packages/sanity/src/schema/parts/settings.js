// schemas/siteSettings.js
export default {
  name: "settings",
  title: "Settings",
  type: "document",
  fields: [
    {
      title: "Label",
      name: "label",
      type: "string",
    },
    {
      title: "Site Title",
      name: "title",
      type: "string",
    },
    {
      title: "Location",
      name: "location",
      type: "string",
    },
    {
      title: "Name",
      name: "name",
      type: "string",
    },
    {
      title: "Occupation",
      name: "occupation",
      type: "string",
    },
    {
      title: "Site Description",
      name: "description",
      type: "text",
    },
    {
      // pen `uvJOs` (Availability — States): the pill on /contact.
      title: "Availability",
      name: "availability",
      type: "object",
      options: {collapsible: true, collapsed: false},
      fields: [
        {
          title: "Status",
          name: "status",
          type: "string",
          description: "Sets the dot colour: green, coral or grey.",
          options: {
            list: [
              {title: "Available", value: "available"},
              {title: "Limited", value: "limited"},
              {title: "Not available", value: "closed"},
            ],
            layout: "radio",
          },
          initialValue: "available",
          validation: (rule) => rule.required(),
        },
        {
          title: "Label",
          name: "label",
          type: "string",
          description: 'The pill text, e.g. "Open to work · Oct 2026". Leave empty to hide the pill.',
        },
      ],
    },
    {
      title: "Social Links",
      name: "links",
      type: "array",
      of: [{type: "reference", to: [{type: "socialLinks"}]}],
    },
    {
      title: "Avatar",
      name: "avatar_image",
      type: "image",
      options: {
        hotspot: false, // <-- Defaults to false
      },
      fields: [
        {
          // Editing this field will be hidden behind an "Edit"-button
          name: "attribution",
          type: "string",
          title: "Attribution",
        },
      ],
    },
    {
      title: "Share Image",
      name: "share_image",
      type: "image",
      options: {
        hotspot: false, // <-- Defaults to false
      },
      fields: [
        {
          // Editing this field will be hidden behind an "Edit"-button
          name: "attribution",
          type: "string",
          title: "Attribution",
        },
      ],
    },
  ],
  preview: {
    select: {
      title: "label",
      disabled: "disabled",
    },
    prepare: (selection, viewOptions) => {
      const {title, disabled} = selection;
      return {
        title: `Settings: ${disabled ? "DISABLED" : title}`,
      };
    },
  },
};
