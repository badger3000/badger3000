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
  return client.fetch(query, {slug});
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
              <iframe
                src={post.penUrl}
                width="100%"
                height="600"
                style={{border: "none"}}
              />
            )}
            <br />
            {post.description && (
              <PortableText
                value={post.description}
                components={PortableTextComponents}
              />
            )}
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
              Back to all Article's
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

{
  /* <Layout title={pen.title}>
  <PageLayout pageTitle={pen.topic.title}>
    <section>
      <SinglePageHeader
        pageTitle={pen?.title || "Untitled"}
        bgColor={` ${pen?.topic?.backgroundColor?.hex || "#000000"}`}
        pageImg={pen?.thumbnail
          ? urlForImage(pen.thumbnail).url()
          : "/images/placeholder.svg"}
      />
      <article class="bg-white p-12 rounded-bl-2xl rounded-br-2xl">
        {(<PortableText value={pen.description} />)}
      </article>
    </section>
    <!-- <article
      class="w-full lg:h-full h-[100vh] col-span-16 lg:col-span-12 text-white my-16"
    >
      <div class="flex flex-col items-center">
        <div class="w-full">
          {
            pen.embedCode && (
              <div class="codepen-embed" set:html={pen.embedCode} />
            )
          }
          <div
            class="mt-6 min-h-[150px] w-[80%] text-center drop-shadow-2xl bg-gradient-to-r from-[#3A2391] to-[#3F1FB8] rounded-lg text-white lg:text-2xl font-semibold p-6 mx-3 lg:mx-0"
          >
            <h1>{pen.title}</h1>
          </div>
          <div class="content w-[80%] lg:mt-4 text-white">
            <p>{pen.description}</p>
          </div>

          <a href={pen.penUrl} target="_blank" rel="noopener noreferrer"
            >View on CodePen</a
          >
        </div>
      </div>
    </article> -->
  </PageLayout>
</Layout> */
}
