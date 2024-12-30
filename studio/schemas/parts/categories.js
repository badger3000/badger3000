export default {
    title: 'PostCategories',
    name: 'postCategories',
    type: 'array',
    of: [{type: 'string'}],
    options: {
      list: [
        {title: 'Development', value: 'development'},
        {title: 'projects', value: 'projects'},
        {title: 'Golf', value: 'golf'},
        
      ],
    },
  }