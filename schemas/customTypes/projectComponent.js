export default {
  title: "Project Component",
  name: "projectComponent",
  type: "object",

  fields: [
    {
      title: "Label",
      name: "label",
      type: "string",
    },
    {
      title: "Heading",
      name: "heading",
      type: "string",
    },

    {
      title: "Display Projects?",
      name: "display_projects",
      type: "boolean",
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
        title: `Projects: ${disabled ? "DISABLED" : title}`,
      };
    },
  },
};
