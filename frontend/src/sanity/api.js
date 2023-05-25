import { useSanityClient, groq } from 'astro-sanity'

export async function getAllProjects() {
  const query = groq`*[_type == "projects"]`
  const projects = await useSanityClient().fetch(query)
  return projects
}
