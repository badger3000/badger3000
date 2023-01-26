import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'
import {dashboardTool, projectInfoWidget} from '@sanity/dashboard'
import {netlifyWidget} from 'sanity-plugin-dashboard-widget-netlify'

export default defineConfig({
  name: 'default',
  title: ' badger3000',
  basePath: '/',
  projectId: '57e12m54',
  dataset: 'badger3000',

  plugins: [
    deskTool(),
    visionTool(),
    dashboardTool({
      widgets: [
        projectInfoWidget(),
        netlifyWidget({
          title: 'My Netlify deploys',
          sites: [
            {
              title: 'CMS Badger3000',
              apiId: '47abe777-1a82-44c6-8fb6-5a08aef31fb9',
              name: 'boisterous-shortbread-857076',
            },
            {
              title: 'Badger3000',
              apiId: '82748cae-cf44-4f28-bceb-22e83e5c6e3f',
              name: 'affectionate-jepsen-8027b4',
            },
          ],
        }),
      ],
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
