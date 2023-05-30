import { useSanityClient, groq } from 'astro-sanity'

export async function getAllProjects() {
  const query = groq`*[_type == "projects" && _id == "08959814-169b-4423-806a-94408907cd9d"][0]`
  const projects = await useSanityClient().fetch(query)
  return projects
}
