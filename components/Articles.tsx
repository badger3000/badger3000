import { getPosts } from '@/lib/sanity';
import { format } from 'date-fns';
import Link from 'next/link';
import type { SanityPost } from '@/types/sanity';

interface ArticlesProps {
  limit?: number;
  showHeading?: boolean;
  showViewAll?: boolean;
  className?: string;
}

export default async function Articles({ limit = 3, showHeading = true, showViewAll = true, className = '' }: ArticlesProps = {}) {
  const posts = await getPosts(limit);

  return (
    <section className={className}>
      {showHeading && (
        <h2 className="font-inter-tight text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
          Articles
        </h2>
      )}
      <div className="space-y-1 mb-4">
        {posts?.map((post) => (
          <article
            key={post._id}
            className="relative p-5 rounded-xl odd:bg-gradient-to-tr odd:from-gray-100 odd:to-gray-50 dark:odd:bg-gradient-to-tr dark:odd:from-gray-800 dark:odd:to-gray-800/[0.65] group"
          >
            <div
              className="absolute top-5 right-7 text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 group-hover:rotate-45 transition"
              aria-hidden="true"
            >
              <svg
                className="fill-current opacity-80 dark:opacity-100"
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="10"
              >
                <path d="M1.018 10 0 8.983l7.572-7.575H1.723L1.736 0H10v8.266H8.577l.013-5.841L1.018 10Z" />
              </svg>
            </div>
            <div className="space-y-1.5 mb-2">
              <div className="text-[13px] font-medium text-gray-600 dark:text-gray-400">
                {post.publishedAt ? format(new Date(post.publishedAt), 'MMM d, yyyy') : 'Recently'}
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                <Link className="before:absolute before:inset-0" href={`/articles/${post.slug}`}>
                  {post.title}
                </Link>
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {post.excerpt}
            </p>
          </article>
        ))}
      </div>
      {showViewAll && (
        <Link
          href="/articles"
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 group"
        >
          View all articles
          <svg
            className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform"
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
        </Link>
      )}
    </section>
  );
}
