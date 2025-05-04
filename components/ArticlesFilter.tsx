"use client";

import {useState} from "react";
import React from "react";
import {motion, AnimatePresence} from "framer-motion";

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
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus-within:ring-2 ring-gray-300 dark:ring-gray-600 dark:to-gray-800/[0.65] focus:border-transparent"
        />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType("all")}
            className={`btn-sm transition-colors ${
              selectedType === "all"
                ? "text-gray-200 dark:text-gray-800 bg-gradient-to-r from-gray-800 to-gray-700 dark:from-gray-300 dark:to-gray-100 dark:hover:bg-gray-100 shadow relative before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white/.2)_50%,transparent_75%,transparent_100%)] dark:before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white)_50%,transparent_75%,transparent_100%)] before:bg-[length:250%_250%,100%_100%] before:bg-[position:200%_0,0_0] before:bg-no-repeat before:[transition:background-position_0s_ease] hover:before:bg-[position:-100%_0,0_0] hover:before:duration-[1500ms]"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedType("articles")}
            className={`btn-sm transition-colors ${
              selectedType === "articles"
                ? "text-gray-200 dark:text-gray-800 bg-gradient-to-r from-gray-800 to-gray-700 dark:from-gray-300 dark:to-gray-100 dark:hover:bg-gray-100 shadow relative before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white/.2)_50%,transparent_75%,transparent_100%)] dark:before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white)_50%,transparent_75%,transparent_100%)] before:bg-[length:250%_250%,100%_100%] before:bg-[position:200%_0,0_0] before:bg-no-repeat before:[transition:background-position_0s_ease] hover:before:bg-[position:-100%_0,0_0] hover:before:duration-[1500ms]"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Articles
          </button>
          <button
            onClick={() => setSelectedType("codepen")}
            className={`btn-sm transition-colors ${
              selectedType === "codepen"
                ? "text-gray-200 dark:text-gray-800 bg-gradient-to-r from-gray-800 to-gray-700 dark:from-gray-300 dark:to-gray-100 dark:hover:bg-gray-100 shadow relative before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white/.2)_50%,transparent_75%,transparent_100%)] dark:before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white)_50%,transparent_75%,transparent_100%)] before:bg-[length:250%_250%,100%_100%] before:bg-[position:200%_0,0_0] before:bg-no-repeat before:[transition:background-position_0s_ease] hover:before:bg-[position:-100%_0,0_0] hover:before:duration-[1500ms]"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            CodePen
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <AnimatePresence mode="popLayout">
          {filteredChildren.map((child, index) => {
            if (React.isValidElement(child)) {
              // Make the article itself a motion component
              const MotionArticle = motion(child.type);

              return (
                <MotionArticle
                  key={child.key}
                  {...(child.props as object)}
                  layout
                  initial={{opacity: 0, y: 20}}
                  animate={{opacity: 1, y: 0}}
                  exit={{opacity: 0, y: -20}}
                  transition={{duration: 0.2, delay: index * 0.05}}
                />
              );
            }
            return child;
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {filteredChildren.length === 0 && (
          <motion.p
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -10}}
            className="text-center text-gray-500 dark:text-gray-400 py-8"
          >
            No articles found matching your search criteria.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
