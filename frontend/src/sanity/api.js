import { useSanityClient } from 'astro-sanity'

export async function getAllProjects() {
  const query = `*[_type == "projects" && defined(slug.current)]`
  const projects = await useSanityClient().fetch(query)
  return projects
}
