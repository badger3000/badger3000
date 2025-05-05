import PortableTextComponents from "@/components/PortableText";
import {client} from "@/lib/sanity";
import {format} from "date-fns";
import {notFound} from "next/navigation";
import {PortableText} from "@portabletext/react";
import {Metadata} from "next";
import EnhancedLink from "@/components/EnhancedLink";
import CodePenEmbedWrapper from "@/components/CodePenEmbedWrapper";

// Define a cache for our posts
const postCache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Enhanced getPost function with caching
async function getPost(slug: string) {
  // Create a cache key
  const cacheKey = `codepen-${slug}`;

  // Check if we have a valid cache entry
  const cachedData = postCache.get(cacheKey);
  if (cachedData) {
    const {data, timestamp} = cachedData;
    // Check if cache is still valid (less than CACHE_DURATION old)
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }

  const query = `*[_type == "codepen" && slug.current == $slug][0] {
    _id,
    _createdAt,
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

  // Fetch with Next.js cache directive
  const post = await client.fetch(
    query,
    {slug},
    {
      next: {revalidate: 3600}, // Cache for 1 hour on the server
    }
  );

  // Update the cache with fresh data
  postCache.set(cacheKey, {
    data: post,
    timestamp: Date.now(),
  });

  return post;
}

// Share post data between metadata and component
let cachedPost: any = null;

type Params = {
  slug: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  // Await params before accessing its properties
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const post = await getPost(slug);

  // Store for reuse in the component
  cachedPost = post;

  if (!post) {
    return {
      title: "CodePen Not Found | Kyle Ross",
      description: "The requested CodePen could not be found.",
    };
  }

  return {
    title: `${post.title} | Kyle Ross`,
    description: post.excerpt || "Check out this CodePen demo.",
    openGraph: {
      title: post.title,
      description: post.excerpt || "Check out this CodePen demo.",
      type: "article",
      publishedTime: post.publishedAt,
      authors: ["Kyle Ross"],
      images: post.thumbnail?.asset?.url
        ? [
            {
              url: post.thumbnail.asset.url,
              width: post.thumbnail.asset.metadata?.dimensions?.width || 1200,
              height: post.thumbnail.asset.metadata?.dimensions?.height || 630,
              alt: post.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || "Check out this CodePen demo.",
      images: post.thumbnail?.asset?.url
        ? [post.thumbnail.asset.url]
        : undefined,
    },
  };
}

export default async function CodePenPage({params}: {params: Promise<Params>}) {
  // Await params before accessing its properties
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Use cached post if available, otherwise fetch
  const post = cachedPost || (await getPost(slug));

  // Clear cache after use to prevent memory leaks
  cachedPost = null;

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto">
      <div className="pb-12 md:pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="h1 font-inter-tight font-bold text-gray-800 dark:text-gray-100 text-3xl mb-4">
              {post.title}
            </h1>
            <div className="text-[13px] text-gray-600 dark:text-gray-400 mb-2">
              {post._createdAt
                ? format(new Date(post._createdAt), "MMMM d, yyyy")
                : "Recently"}
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            {post.penUrl && (
              <CodePenEmbedWrapper penUrl={post.penUrl} title={post.title} />
            )}
            <br />
            {post.description && (
              <PortableText
                value={post.description}
                components={PortableTextComponents}
              />
            )}
            <EnhancedLink
              href="/articles"
              className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-8 group"
            >
              <svg
                className="w-3 h-3 mr-2 rotate-180 group-hover:translate-x-[-2px] transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              Back to all Articles
            </EnhancedLink>
          </div>
        </div>
      </div>
    </article>
  );
}

// Enable ISR for this page
export const revalidate = 3600; // Revalidate at most once per hour
