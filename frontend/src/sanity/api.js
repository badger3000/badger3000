import { useSanityClient } from 'astro-sanity'

export async function getAllProjects() {
  const query = `*[_type == "projects" && defined(slug.current)]`
  const projects = await useSanityClient().fetch(query)
  return projects
}
export async function getAllPosts() {
  const query = `*[_type == "articles" && defined(slug.current)]`
  const posts = await useSanityClient().fetch(query)
  return posts
}
export async function getAllContent() {
  const query = `*[_type in ["articles", "projects"]]`
  const allContent = await useSanityClient().fetch(query)
  return allContent
}