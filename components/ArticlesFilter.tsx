"use client";

import {useState} from "react";
import React from "react";

interface ArticlesFilterProps {
  children: React.ReactNode;
  articles: Array<{
    _id: string;
    title: string;
    excerpt?: string;
    slug: string;
    _type: string;
  }>;
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
      selectedType === "all" || article._type === selectedType;

    return matchesSearch && matchesType;
  });

  // Convert children to array for easier manipulation
  const childrenArray = React.Children.toArray(children);

  // Filter the rendered articles based on our filtered data
  const filteredChildren = childrenArray.filter((child) => {
    if (React.isValidElement(child) && child.type === "article") {
      const articleKey = child.key as string;
      return filteredArticles.some(
        (article) => article._id === articleKey.replace(".$", "")
      );
    }
    return true;
  });

  return (
    <div>
      <div className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Search articles..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
        />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedType === "all"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedType("articles")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedType === "articles"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Articles
          </button>
          <button
            onClick={() => setSelectedType("codepen")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedType === "codepen"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            CodePen
          </button>
        </div>
      </div>

      <div className="space-y-1">{filteredChildren}</div>

      {filteredChildren.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No articles found matching your search criteria.
        </p>
      )}
    </div>
  );
}
