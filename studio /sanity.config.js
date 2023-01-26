import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'

export default defineConfig({
  name: 'default',
  title: ' badger3000',

  projectId: '57e12m54',
  dataset: 'badger3000',

  plugins: [deskTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
