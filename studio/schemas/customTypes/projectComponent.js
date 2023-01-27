export default {
  title: 'Project Component',
  name: 'projectComponent',
  type: 'object',

  fields: [
    {
      title: 'Label',
      name: 'label',
      type: 'string',
    },
    {
      title: 'Heading',
      name: 'heading',
      type: 'string',
    },

    {
      title: 'Display Projects?',
      name: 'form',
      type: 'boolean',
    },
  ],
  preview: {
    select: {
      title: 'label',
      disabled: 'disabled',
    },
    prepare({title, disabled}) {
      return {
        title: `Projects: ${disabled ? 'DISABLED' : title}`,
      }
    },
  },
}
