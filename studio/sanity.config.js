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
  projectId: '57e12m54',
  dataset: 'badger3000',
  document: {
    productionUrl: async (prev, {document}) => {
      const remoteURL = 'https://cms.badger3000.com'
      const localURL = 'http://localhost:8000'
      const previewURL = window.location.hostname === 'localhost' ? localURL : remoteURL

      if (document._type == 'page') {
        return `${previewURL}/page-preview/${document._id}`
      }

      return prev
    },
  },

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
