export default {
  title: 'Contact Form',
  name: 'contactForm',
  type: 'object',

  fields: [
    {
      title: 'Heading',
      name: 'heading',
      type: 'string',
    },
    {
      title: 'Text',
      name: 'contactForm_text',
      type: 'array',
      of: [{type: 'block'}],
    },
    {
      title: 'Display Contact Form?',
      name: 'form',
      type: 'boolean',
    },
  ],
  preview: {
    select: {
      title: 'heading',
      disabled: 'disabled',
    },
    prepare({title, disabled}) {
      return {
        title: `Contact Form: ${disabled ? 'DISABLED' : title}`,
      }
    },
  },
}
