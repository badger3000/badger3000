import {sanityClient} from "sanity:client";

export async function getAllProjects() {
  const query = `*[_type == "projects" && defined(slug.current)] {
    _id,
    title,
    slug,
    "topic": topic->{
      title,
      "slug": slug.current,
      backgroundColor
    },
    web_url,
    order,
    tech,
    project_description,
    project_image,
    gridSpan
  }`;
  const projects = await sanityClient.fetch(query);
  return projects;
}

export async function getAllPosts() {
  const query = `*[_type == "articles" && defined(slug.current)] {
    _id,
    title,
    slug,
    excerpt,
    content,
    "topic": topic->{
      title,
      "slug": slug.current,
      backgroundColor
    },
    main_image,
    gridSpan
  }`;
  const posts = await sanityClient.fetch(query);
  return posts.map((post) => ({
    ...post,
    main_image: post.main_image
      ? {
          ...post.main_image,
          url: post.main_image.url || null,
        }
      : null,
  }));
}

export async function getAllPens() {
  const query = `*[_type == "codepen"] {
    _id,
    title,
    slug,
    description,
    penUrl,
    excerpt,
    embedCode,
    "topic": topic->{
      title,
      "slug": slug.current,
      backgroundColor
    },
    thumbnail,
    gridSpan
  }`;
  const allPens = await sanityClient.fetch(query);
  return allPens;
}

export async function getPen(slug) {
  const query = `*[_type == "codepen" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    penUrl,
    embedCode,
    "topic": topic->{
      title,
      "slug": slug.current,
      backgroundColor
    },
    thumbnail,
    gridSpan
  }`;
  return sanityClient.fetch(query, {slug});
}
export async function getAllTopics() {
  const query = `*[_type == "topics"] {
    _id,
    title,
    "slug": slug.current,
    backgroundColor
  }`;
  const allTopics = await sanityClient.fetch(query);
  return allTopics;
}
export async function getAllItems() {
  const query = `*[_type in ["projects", "articles", "codepen"] && !(_id in path('deleted'))] {
    _id,
    _type,
    title,
    excerpt,
    "image": select(
      _type == "projects" => project_image,
      _type == "articles" => main_image,
      _type == "codepen" => thumbnail
    ),
    "slug": slug.current,
    "topic": topic->{
      _id,
      title,
      "slug": slug.current,
      backgroundColor
    },
    gridSpan,
    imagePosition,
    showButton
  }`;
  const allItems = await sanityClient.fetch(query);
  return allItems;
}
