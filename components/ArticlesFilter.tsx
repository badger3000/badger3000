"use client";

import {useState} from "react";
import React from "react";
// Removed framer-motion imports since we're not using animations for now
import Link from "next/link";

interface Article {
  _id: string;
  title: string;
  excerpt?: string;
  slug: string;
  _type: string;
}

interface ArticlesFilterProps {
  children: React.ReactNode;
  articles: Article[];
}

export default function ArticlesFilter({
  children,
  articles,
}: ArticlesFilterProps) {
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedType, setSelectedType] = useState<
    "all" | "articles" | "codepen"
  >("all");

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      article?.excerpt?.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesType =
      selectedType === "all" ||
      (selectedType === "articles" && article._type === "articles") ||
      (selectedType === "codepen" && article._type === "codepen");

    return matchesSearch && matchesType;
  });

  // Instead of complex child filtering, render articles directly from data

  return (
    <div>

      <div className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Search articles..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus-within:ring-2 ring-gray-300 dark:ring-gray-600 dark:to-gray-800/[0.65] focus:border-transparent"
        />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType("all")}
            className={`btn-sm transition-colors ${
              selectedType === "all"
                ? "text-gray-200 dark:text-gray-800 bg-gradient-to-r from-gray-800 to-gray-700 dark:from-gray-300 dark:to-gray-100"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedType("articles")}
            className={`btn-sm transition-colors ${
              selectedType === "articles"
                ? "text-gray-200 dark:text-gray-800 bg-gradient-to-r from-gray-800 to-gray-700 dark:from-gray-300 dark:to-gray-100"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Articles
          </button>
          <button
            onClick={() => setSelectedType("codepen")}
            className={`btn-sm transition-colors ${
              selectedType === "codepen"
                ? "text-gray-200 dark:text-gray-800 bg-gradient-to-r from-gray-800 to-gray-700 dark:from-gray-300 dark:to-gray-100"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            CodePen
          </button>
        </div>
      </div>

      <div className="space-y-1">
        {/* Render articles directly from filtered data */}
        {filteredArticles.map((post, index) => (
          <article
            key={post._id}
            className={`relative p-5 rounded-xl group ${
              index % 2 === 1
                ? 'bg-gradient-to-tr from-gray-100 to-gray-50 dark:bg-gradient-to-tr dark:from-gray-800 dark:to-gray-800/[0.65]'
                : ''
            }`}
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
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                <Link
                  className="before:absolute before:inset-0"
                  prefetch={true}
                  href={
                    post._type === "codepen"
                      ? `/codepen/${post.slug}`
                      : `/articles/${post.slug}`
                  }
                >
                  {post.title}
                </Link>
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {post.excerpt || "Read more..."}
            </p>
          </article>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No articles found matching your search criteria.
        </div>
      )}
    </div>
  );
}
