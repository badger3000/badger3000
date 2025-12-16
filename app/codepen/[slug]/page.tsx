import PortableTextComponents from "@/components/PortableText";
import {client} from "@/lib/sanity";
import {format} from "date-fns";
import Image from "next/image";
import Link from "next/link";
import {notFound} from "next/navigation";
import {PortableText} from "@portabletext/react";
import {Metadata} from "next";

type Params = {
  slug: string;
};

// This enables ISR - pages will be cached but revalidated in the background
export const dynamic = "force-static";
export const revalidate = 3600; // Revalidate every hour

// Generate static params for all codepen pages at build time
export async function generateStaticParams() {
  const query = `*[_type == "codepen" && defined(slug.current) && !(_id in path('drafts.**'))]{
    "slug": slug.current
  }`;

  const codepens = await client.fetch(query, {}, {cache: "force-cache"});

  return codepens.map((pen: {slug: string}) => ({
    slug: pen.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  // Await params before accessing its properties
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Article Not Found | Kyle Ross",
      description: "The requested article could not be found.",
    };
  }

  // Create the canonical URL for this specific codepen
  const baseUrl = process.env.SITE_URL || "https://www.badger3000.com";
  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  const canonicalUrl = `${normalizedBaseUrl}/codepen/${slug}`;

  return {
    title: post.title, // Will be combined with the template from layout.tsx
    description:
      post.excerpt || "Read this article on web development and technology.",
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.title,
      description:
        post.excerpt || "Read this article on web development and technology.",
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
      description:
        post.excerpt || "Read this article on web development and technology.",
      images: post.thumbnail?.asset?.url
        ? [post.thumbnail.asset.url]
        : undefined,
    },
  };
}
async function getPost(slug: string) {
  // Optimize the GROQ query for better performance
  const query = `*[_type == "codepen" && slug.current == $slug && !(_id in path('drafts.**'))][0] {
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
    "thumbnail": thumbnail {
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

  // Use caching options for faster responses
  return client.fetch(
    query,
    {slug},
    {
      cache: "force-cache", // Use in-memory caching
      next: {revalidate: 3600}, // This works with ISR
    }
  );
}

export default async function ArticlePage({params}: {params: Promise<Params>}) {
  // Await params before accessing its properties
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const post = await getPost(slug);

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
              <div className="relative h-[600px] mb-8">
                <iframe
                  height="600"
                  width="100%"
                  title={post.title}
                  src={`https://codepen.io/badger3000/embed/${post.penUrl}?default-tab=result&theme-id=54001`}
                  loading="eager"
                  className="absolute top-0 left-0 w-full h-full border-0 rounded-lg shadow-lg"
                  allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            {post.description && (
              <PortableText
                value={post.description}
                components={PortableTextComponents}
              />
            )}
            <Link
              href="/articles"
              className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-8 group"
              prefetch={true}
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
              Back to all Article's
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
