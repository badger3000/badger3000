import {client} from "@/lib/sanity";
import {format} from "date-fns";
import Image from "next/image";
import Link from "next/link";
import {notFound} from "next/navigation";
import {PortableText} from "@portabletext/react";
import {Metadata} from "next";

// Use 'any' type to bypass TypeScript checking for now
export async function generateMetadata({params}: any): Promise<Metadata> {
  const slug = params.slug;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Article Not Found | Kyle Ross",
      description: "The requested article could not be found.",
    };
  }

  return {
    title: `${post.title} | Kyle Ross`,
    description:
      post.excerpt || "Read this article on web development and technology.",
    openGraph: {
      title: post.title,
      description:
        post.excerpt || "Read this article on web development and technology.",
      type: "article",
      publishedTime: post.publishedAt,
      authors: ["Kyle Ross"],
      images: post.mainImage?.asset?.url
        ? [
            {
              url: post.mainImage.asset.url,
              width: post.mainImage.asset.metadata?.dimensions?.width || 1200,
              height: post.mainImage.asset.metadata?.dimensions?.height || 630,
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
      images: post.mainImage?.asset?.url
        ? [post.mainImage.asset.url]
        : undefined,
    },
  };
}

async function getPost(slug: string) {
  const query = `*[_type == "articles" && defined(slug.current) && slug.current == $slug && !(_id in path('drafts.**'))][0] {
    _id,
    title,
    "slug": slug.current,
    "excerpt": coalesce(excerpt, "Read this article on web development and technology."),
    publishedAt,
    content[] {
      ...,
      _type == "image" => {
        "asset": {
          "_id": asset->_id,
          "url": asset->url,
          "metadata": asset->metadata
        }
      }
    },
    mainImage {
      asset-> {
        _id,
        url,
        metadata
      }
    }
  }`;

  return client.fetch(query, {slug});
}

// Use 'any' type to bypass TypeScript checking for now
export default async function ArticlePage({params}: any) {
  const slug = params.slug;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6">
      <div className="pb-12 md:pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <Link
              href="/articles"
              className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-8"
            >
              <svg
                className="w-3 h-3 mr-2 rotate-180"
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
            <div className="text-[13px] text-gray-600 dark:text-gray-400 mb-2">
              {post.publishedAt
                ? format(new Date(post.publishedAt), "MMMM d, yyyy")
                : "Recently"}
            </div>
            <h1 className="h1 font-inter-tight font-bold text-gray-800 dark:text-gray-100 text-3xl mb-4">
              {post.title}
            </h1>
          </div>

          {post.mainImage?.asset?.url && (
            <div className="relative h-64 sm:h-96 mb-8">
              <Image
                src={post.mainImage.asset.url}
                alt={post.title}
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          )}

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <PortableText
              value={post.content}
              components={{
                types: {
                  image: ({value}) => (
                    <div className="relative h-64 sm:h-96 my-8">
                      <Image
                        src={value.asset.url}
                        alt={value.alt || ""}
                        fill
                        className="object-cover rounded-lg"
                        sizes="(max-width: 768px) 100vw, 768px"
                      />
                    </div>
                  ),
                },
                marks: {
                  link: ({children, value}) => (
                    <Link
                      href={value.href}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      target={
                        value.href.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        value.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                    >
                      {children}
                    </Link>
                  ),
                },
              }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
