import React from "react";
const CtaIcon = () => <span style={{fontWeight: "bold"}}>CTA</span>;

export default {
  title: "Hero",
  name: "hero",
  type: "object",
  fields: [
    {
      name: "label",
      type: "string",
    },
    {
      title: "Heading",
      name: "heading",
      type: "string",
    },
    {
      title: "Hero Text",
      name: "hero_text",
      type: "array",
      of: [
        {
          type: "block",
          marks: {
            decorators: [
              {
                title: "CTA",
                value: "cta",
                icon: CtaIcon,
              },
            ],
          },
        },
        {type: "image"},
      ],
    },
  ],
  preview: {
    select: {
      title: "heading",
      subtitle: "label",
      disabled: "disabled",
    },
    prepare: (selection, viewOptions) => {
      const {title, disabled} = selection;
      return {
        title: `Hero: ${disabled ? "DISABLED" : title}`,
      };
    },
  },
};
