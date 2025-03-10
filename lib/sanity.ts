import { createClient } from 'next-sanity';
import type { SanityPost } from '@/types/sanity';

if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID');
}

if (!process.env.NEXT_PUBLIC_SANITY_DATASET) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET');
}

const config = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-03-09',
  useCdn: true,
  token: process.env.SANITY_API_TOKEN,
};

if (!config.projectId) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID');
}

if (!config.dataset) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET');
}

export const client = createClient({
  ...config,
  useCdn: typeof window !== 'undefined' && process.env.NODE_ENV === 'production',
});

export async function getPosts(limit?: number): Promise<SanityPost[]> {
  const query = `*[_type == "articles" && defined(slug.current) && !(_id in path('drafts.**'))] | order(publishedAt desc, _createdAt desc) ${limit ? `[0...${limit}]` : ''} {
    _id,
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

  return client.fetch<SanityPost[]>(query);
}
