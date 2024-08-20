import {sanityClient} from "sanity:client";

export async function getAllProjects() {
  const query = `*[_type == "projects" && defined(slug.current)]`;
  const projects = await sanityClient.fetch(query);
  return projects;
}
export async function getAllPosts() {
  const query = `*[_type == "articles" && defined(slug.current)]`;
  const posts = await sanityClient.fetch(query);
  return posts;
}

export async function getAllPens() {
  const query = `*[_type == "codepen"]`;
  const allPens = await sanityClient.fetch(query);
  return allPens;
}

export async function getPen() {
  const query = `*[_type == "codepen" && defined(slug.current)]`;
  const pens = await sanityClient.fetch(query);
  return pens;
}
export async function getAllTopics() {
  const query = `*[_type == "topics"]`;
  const allTopics = await sanityClient.fetch(query);
  return allTopics;
}
