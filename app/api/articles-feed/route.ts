import {Feed} from "feed";
import {createClient} from "next-sanity";
import {NextResponse} from "next/server";

type BlogPost = {
  title: string;
  slug: {current: string};
  publishedAt: string;
  excerpt: string;
  url: string;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-03-09",
  useCdn: process.env.NODE_ENV === "production",
  token: process.env.SANITY_API_TOKEN, // Optional: Add if needed for draft content
});

export const dynamic = "force-dynamic"; // Ensure fresh content on each request

export async function GET() {
  try {
    const feed = new Feed({
      title: "Kyle Ross - Articles",
      description: "Latest articles and insights",
      id: SITE_URL,
      link: SITE_URL,
      language: "en",
      image: `${SITE_URL}/images/blog-icon.png`,
      favicon: `${SITE_URL}/favicon.ico`,
      copyright: `© ${new Date().getFullYear()} All rights reserved`,
      updated: new Date(),
      feedLinks: {
        rss2: `${SITE_URL}/api/articles-feed`,
      },
      author: {
        name: process.env.NEXT_PUBLIC_AUTHOR_NAME || "Portfolio Author",
        link: SITE_URL,
      },
    });

    // Fetch latest posts from Sanity with strong typing
    const posts = await client.fetch<BlogPost[]>(`
      *[_type == "articles" && defined(slug.current) && !(_id in path('drafts.**'))] | order(publishedAt desc, _createdAt desc) [0...10] {
        title,
        "slug": slug,
        publishedAt,
        excerpt,
        "url": "${SITE_URL}/articles/" + slug.current
      }
    `);

    if (!posts || !Array.isArray(posts)) {
      throw new Error("Failed to fetch blog posts from Sanity");
    }

    posts.forEach((post) => {
      feed.addItem({
        title: post.title,
        id: post.url,
        link: post.url,
        description: post.excerpt,
        date: new Date(post.publishedAt),
      });
    });

    return new NextResponse(feed.rss2(), {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, s-maxage=1200, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error generating blog feed:", error);
    return NextResponse.json(
      {error: "Failed to generate blog feed"},
      {status: 500}
    );
  }
}
