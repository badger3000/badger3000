import {createClient} from "next-sanity";
import type {SanityPost} from "@/types/sanity";

if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
}

if (!process.env.NEXT_PUBLIC_SANITY_DATASET) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_DATASET");
}

const config = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-03-09",
  useCdn: true,
  token: process.env.SANITY_API_TOKEN,
};

if (!config.projectId) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
}

if (!config.dataset) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_DATASET");
}

export const client = createClient({
  ...config,
  useCdn: true, // Always use CDN for better performance
  perspective: "published",
  stega: false, // Disable stega to reduce payload size
});

export async function getPosts(limit?: number): Promise<SanityPost[]> {
  // Optimize the query to select only necessary fields for list views
  const query = `*[_type in ["articles", "codepen"] && defined(slug.current) && !(_id in path('drafts.**'))] | order(publishedAt desc, _createdAt desc) ${limit ? `[0...${limit}]` : ""} {
    _id,
    _type,
    title,
    "slug": coalesce(slug.current, "no-slug"),
    "publishedAt": coalesce(publishedAt, _createdAt),
    "excerpt": coalesce(excerpt, "Read more..."),
    // Don't fetch full content in list view, just a preview
    "contentPreview": select(
      _type == "articles" => content[0].children[0].text,
      _type == "codepen" => description[0].children[0].text
    ),
    mainImage {
      asset-> {
        _id,
        url,
        // Only fetch needed metadata
        metadata {
          dimensions
        }
      }
    },
    thumbnail {
      asset-> {
        _id,
        url,
        metadata {
          dimensions
        }
      }
    }
  }`;

  // Use caching options for better performance
  return client.fetch<SanityPost[]>(
    query,
    {},
    {
      cache: "force-cache",
      next: {revalidate: 3600}, // Cache for 1 hour
    }
  );
}
