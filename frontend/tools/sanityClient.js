import createClient from '@sanity/client'

export default client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  useCdn: true, // set to `false` to bypass the edge cache
  apiVersion: '2021-03-25', // use current date (YYYY-MM-DD) to target the latest API version
})