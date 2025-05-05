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
  useCdn:
    typeof window !== "undefined" && process.env.NODE_ENV === "production",
});

// Create caches for posts and individual post data
const postListCache = new Map();
const singlePostCache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export async function getPosts(limit?: number): Promise<SanityPost[]> {
  // Create a cache key based on the limit parameter
  const cacheKey = `posts-${limit || "all"}`;

  // Check if we have a valid cache entry
  const cachedData = postListCache.get(cacheKey);
  if (cachedData) {
    const {data, timestamp} = cachedData;
    // Check if cache is still valid (less than CACHE_DURATION old)
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }

  const query = `*[_type in ["articles", "codepen"] && defined(slug.current) && !(_id in path('drafts.**'))] | order(publishedAt desc, _createdAt desc) ${limit ? `[0...${limit}]` : ""} {
    _id,
    _type,
    title,
    "slug": coalesce(slug.current, "no-slug"),
    "publishedAt": coalesce(publishedAt, _createdAt),
    "excerpt": coalesce(excerpt, "Read more..."),
    content,
    mainImage {
      asset-> {
        _id,
        url,
        metadata {
          dimensions
        }
      }
    }
  }`;

  // Fetch data with Next.js caching directive
  const posts = await client.fetch<SanityPost[]>(
    query,
    {},
    {
      next: {revalidate: 3600}, // Cache on the server side for 1 hour
    }
  );

  // Update the cache with fresh data
  postListCache.set(cacheKey, {
    data: posts,
    timestamp: Date.now(),
  });

  return posts;
}

// Add a function to get a single post with caching
export async function getPost(
  slug: string,
  type: string = "articles"
): Promise<SanityPost | null> {
  // Create a cache key that includes both slug and type
  const cacheKey = `post-${type}-${slug}`;

  // Check if we have a valid cache entry
  const cachedData = singlePostCache.get(cacheKey);
  if (cachedData) {
    const {data, timestamp} = cachedData;
    // Check if cache is still valid (less than CACHE_DURATION old)
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }

  const query = `*[_type == $type && slug.current == $slug && !(_id in path('drafts.**'))][0] {
    _id,
    _type,
    _createdAt,
    title,
    "slug": slug.current,
    "publishedAt": coalesce(publishedAt, _createdAt),
    excerpt,
    content,
    description,
    penUrl,
    embedCode,
    mainImage {
      asset-> {
        _id,
        url,
        metadata {
          dimensions
        }
      }
    },
    "topic": topic->{
      title,
      "slug": slug.current,
      backgroundColor
    },
    thumbnail {
      asset-> {
        _id,
        url,
        metadata {
          dimensions
        }
      }
    },
    gridSpan
  }`;

  // Fetch with Next.js cache directive
  const post = await client.fetch<SanityPost | null>(
    query,
    {slug, type},
    {
      next: {revalidate: 3600}, // Cache for 1 hour
    }
  );

  // Update the cache with fresh data
  singlePostCache.set(cacheKey, {
    data: post,
    timestamp: Date.now(),
  });

  return post;
}

// Add a function to clear cache if needed
export function clearSanityCache() {
  postListCache.clear();
  singlePostCache.clear();
}
