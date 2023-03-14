import React from 'react'

import Hero from '../components/Hero/Hero'

export default {
  title: 'Component/Hero',
  component: Hero,
}

const Template = (args) => <Hero {...args} />

export const Default = Template.bind({})
Default.args = {
  heading: 'Something',
  hero_text: 'This is some paragraph text',
}
