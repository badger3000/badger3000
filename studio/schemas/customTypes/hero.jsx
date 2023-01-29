import React from 'react'

export default {
  title: 'Hero',
  name: 'hero',
  type: 'object',
  fields: [
    {
      name: 'label',
      type: 'string',
    },
    {
      title: 'Heading',
      name: 'heading',
      type: 'string',
    },
    {
      title: 'Hero Text',
      name: 'hero_text',
      type: 'array',
      of: [
        {
          type: 'block',
          marks: {
            decorators: [
              {
                title: 'CTA',
                value: 'cta',
              },
            ],
          },
        },
        {type: 'image'},
      ],
    },
  ],
  preview: {
    select: {
      title: 'heading',
      subtitle: 'label',
      disabled: 'disabled',
    },
    prepare({title, disabled}) {
      return {
        title: `Hero: ${disabled ? 'DISABLED' : title}`,
      }
    },
  },
}
