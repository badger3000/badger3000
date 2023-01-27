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
  ],
  preview: {
    select: {
      title: 'Contact Form',
      disabled: 'disabled',
    },
    prepare({title, disabled}) {
      return {
        title: `Contact Form: ${disabled ? 'DISABLED' : title}`,
      }
    },
  },
}
