import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'
import {deskStructure} from './deskStructure'
import {dashboardTool, projectInfoWidget} from '@sanity/dashboard'
import {netlifyWidget} from 'sanity-plugin-dashboard-widget-netlify'

export default defineConfig({
  name: 'default',
  title: ' badger3000',
  basePath: '/',
  projectId: import.meta.env.SANITY_STUDIO_PROJECT_ID,
  dataset: import.meta.env.SANITY_STUDIO_DATASET,

  plugins: [
    deskTool({
      deskStructure,
    }),
    visionTool(),
    dashboardTool({
      widgets: [
        projectInfoWidget(),
        netlifyWidget({
          title: 'My Netlify deploys',
          sites: [
            {
              title: 'CMS Badger3000',
              apiId: import.meta.env.SANITY_STUDIO_API_ID_CMS,
              name: 'boisterous-shortbread-857076',
            },
            {
              title: 'Badger3000',
              apiId: import.meta.env.SANITY_STUDIO_API_ID,
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
