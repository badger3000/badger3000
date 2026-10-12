import PortableTextComponents from "@/components/PortableText";
import {client} from "@/lib/sanity";
import {format} from "date-fns";
import Image from "next/image";
import Link from "next/link";
import {notFound} from "next/navigation";
import {PortableText} from "@portabletext/react";
import {Metadata} from "next";
import AuthorCitation from "@/components/AuthorCitation";

type Params = {
  slug: string;
};

type ImageAsset = {
  url: string;
  metadata?: {dimensions?: {width?: number; height?: number}};
};

const BASE_URL = (process.env.SITE_URL || "https://www.badger3000.com").replace(
  /\/$/,
  ""
);

// Prefer the hand-written excerpt; otherwise summarize the article body
function getDescription(post: {excerpt?: string; bodyText?: string}) {
  if (post.excerpt) return post.excerpt;
  const text = (post.bodyText || "").replace(/\s+/g, " ").trim();
  if (!text) return "An article by Kyle Ross.";
  return text.length > 155 ? `${text.slice(0, 152).trimEnd()}...` : text;
}

// Use the main image, falling back to the first image in the article body
function getShareImage(post: {
  mainImage?: {asset?: ImageAsset};
  content?: Array<{_type: string; asset?: ImageAsset}>;
}): ImageAsset | undefined {
  if (post.mainImage?.asset?.url) return post.mainImage.asset;
  return post.content?.find((block) => block._type === "image" && block.asset?.url)
    ?.asset;
}

// This enables ISR - pages will be cached but revalidated in the background
export const dynamic = "force-static";
export const revalidate = 3600; // Revalidate every hour

// Generate static params for all article pages at build time
export async function generateStaticParams() {
  const query = `*[_type == "articles" && defined(slug.current) && !(_id in path('drafts.**'))]{
    "slug": slug.current
  }`;

  const articles = await client.fetch(query, {}, {cache: "force-cache"});

  return articles.map((article: {slug: string}) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata ({
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

  // Create the canonical URL for this specific article
  const canonicalUrl = `${BASE_URL}/articles/${slug}`;
  const description = getDescription(post);
  const shareImage = getShareImage(post);

  return {
    title: post.title, // Will be combined with the template from layout.tsx
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.title,
      description,
      url: canonicalUrl,
      type: "article",
      publishedTime: post.publishedAt || post._createdAt,
      modifiedTime: post._updatedAt,
      authors: ["Kyle Ross"],
      images: shareImage
        ? [
            {
              url: shareImage.url,
              width: shareImage.metadata?.dimensions?.width || 1200,
              height: shareImage.metadata?.dimensions?.height || 630,
              alt: post.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: shareImage ? [shareImage.url] : undefined,
    },
  };
}

async function getPost(slug: string) {
  // Optimize the GROQ query for better performance
  const query = `*[_type == "articles" && slug.current == $slug && !(_id in path('drafts.**'))][0] {
    _id,
    _createdAt,
    _updatedAt,
    title,
    "slug": slug.current,
    excerpt,
    "bodyText": pt::text(content),
    publishedAt,
    // Only select necessary content fields to minimize payload size
    content[] {
      ...,
      _type == "image" => {
        "asset": {
          "_id": asset->_id,
          "url": asset->url,
          "metadata": asset->metadata {
            dimensions
          }
        }
      },
      _type == "selfHostedVideo" => {
        "videoFile": {
          "asset": {
            "_id": videoFile.asset->_id,
            "url": videoFile.asset->url,
            "mimeType": videoFile.asset->mimeType
          }
        },
        "poster": poster {
          "asset": {
            "_id": asset->_id,
            "url": asset->url
          }
        },
        title,
        autoPlay,
        loop,
        muted,
        controls
      }
    },
    mainImage {
      asset-> {
        _id,
        url,
        metadata {
          dimensions
        }
      }
    },
    authorName,
    authorProfileUrl,
    originalArticleUrl,
    disclaimer
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

  const publishedDate = post.publishedAt || post._createdAt;
  const shareImage = getShareImage(post);
  const canonicalUrl = `${BASE_URL}/articles/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: getDescription(post),
    datePublished: publishedDate,
    dateModified: post._updatedAt || publishedDate,
    author: {
      "@type": "Person",
      name: post.authorName || "Kyle Ross",
      url: post.authorProfileUrl || BASE_URL,
    },
    image: shareImage ? [shareImage.url] : undefined,
    mainEntityOfPage: {"@type": "WebPage", "@id": canonicalUrl},
    url: canonicalUrl,
  };

  return (
    <article className="max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="pb-12 md:pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="h1 font-inter-tight font-bold text-gray-800 dark:text-gray-100 text-3xl mb-4">
              {post.title}
            </h1>
            <div className="text-[13px] text-gray-600 dark:text-gray-400 mb-2">
              {publishedDate
                ? format(new Date(publishedDate), "MMMM d, yyyy")
                : "Recently"}
            </div>
          </div>

          {post.authorName && (
            <AuthorCitation
              authorName={post.authorName}
              authorProfileUrl={post.authorProfileUrl}
              originalArticleUrl={post.originalArticleUrl}
              disclaimer={post.disclaimer}
            />
          )}

          {post.mainImage?.asset?.url && (
            <div className="relative h-64 sm:h-96 mb-8">
              <Image
                src={post.mainImage.asset.url}
                alt={post.title}
                fill
                priority
                fetchPriority="high"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 85vw, 768px"
                quality={80}
                className="object-cover rounded-lg"
              />
            </div>
          )}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <PortableText
              value={post.content}
              components={PortableTextComponents}
            />
            <Link
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
              Back to Articles
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
