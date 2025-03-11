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
