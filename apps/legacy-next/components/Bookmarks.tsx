"use client";

import {useState, useMemo} from "react";
import {motion, AnimatePresence} from "framer-motion";
import type {SanityBookmark} from "@/types/sanity";

const activeButtonClass =
  "text-gray-200 dark:text-gray-800 bg-gradient-to-r from-gray-800 to-gray-700 dark:from-gray-300 dark:to-gray-100 dark:hover:bg-gray-100 shadow relative before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white/.2)_50%,transparent_75%,transparent_100%)] dark:before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white)_50%,transparent_75%,transparent_100%)] before:bg-[length:250%_250%,100%_100%] before:bg-[position:200%_0,0_0] before:bg-no-repeat before:[transition:background-position_0s_ease] hover:before:bg-[position:-100%_0,0_0] hover:before:duration-[1500ms]";

const inactiveButtonClass =
  "bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-750 text-gray-700 dark:text-gray-300 hover:from-gray-200 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 relative before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.gray.400/.1)_50%,transparent_75%,transparent_100%)] dark:before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.gray.500/.1)_50%,transparent_75%,transparent_100%)] before:bg-[length:250%_250%,100%_100%] before:bg-[position:200%_0,0_0] before:bg-no-repeat before:[transition:background-position_0s_ease] hover:before:bg-[position:-100%_0,0_0] hover:before:duration-[1500ms] border border-gray-200/50 dark:border-gray-600/30";

export default function Bookmarks({bookmarks}: {bookmarks: SanityBookmark[]}) {
  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("all");

  const folders = useMemo(() => {
    const folderCounts = new Map<string, number>();
    for (const b of bookmarks) {
      folderCounts.set(b.folder, (folderCounts.get(b.folder) || 0) + 1);
    }
    return Array.from(folderCounts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]));
  }, [bookmarks]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return bookmarks.filter((b) => {
      const matchesSearch =
        !query ||
        b.title.toLowerCase().includes(query) ||
        b.url.toLowerCase().includes(query) ||
        b.folder.toLowerCase().includes(query);
      const matchesFolder =
        selectedFolder === "all" || b.folder === selectedFolder;
      return matchesSearch && matchesFolder;
    });
  }, [bookmarks, search, selectedFolder]);

  function getDomain(url: string) {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  }

  return (
    <div>
      <div className="mb-6 space-y-4">
        <motion.input
          type="text"
          placeholder="Search bookmarks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          whileFocus={{scale: 1.02}}
          transition={{type: "spring", stiffness: 300, damping: 25}}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus-within:ring-2 ring-gray-300 dark:ring-gray-600 dark:to-gray-800/[0.65] focus:border-transparent transition-all duration-200"
        />

        <div className="flex flex-wrap gap-2">
          <motion.button
            onClick={() => setSelectedFolder("all")}
            whileHover={{scale: 1.05}}
            whileTap={{scale: 0.95}}
            transition={{type: "spring", stiffness: 400, damping: 25}}
            className={`btn-sm transition-colors ${
              selectedFolder === "all" ? activeButtonClass : inactiveButtonClass
            }`}
          >
            All ({bookmarks.length})
          </motion.button>
          {folders.map(([folder, count]) => (
            <motion.button
              key={folder}
              onClick={() =>
                setSelectedFolder(selectedFolder === folder ? "all" : folder)
              }
              whileHover={{scale: 1.05}}
              whileTap={{scale: 0.95}}
              transition={{type: "spring", stiffness: 400, damping: 25}}
              className={`btn-sm transition-colors ${
                selectedFolder === folder
                  ? activeButtonClass
                  : inactiveButtonClass
              }`}
            >
              {folder} ({count})
            </motion.button>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {filtered.length} bookmark{filtered.length !== 1 ? "s" : ""}
        {search && ` matching "${search}"`}
      </p>

      <div className="space-y-1">
        <AnimatePresence mode="popLayout">
          {filtered.map((bookmark, index) => (
            <motion.article
              key={bookmark._id}
              layout
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -20}}
              transition={{
                duration: 0.3,
                delay: index < 20 ? index * 0.02 : 0,
                layout: {type: "spring", bounce: 0.2},
              }}
              className={`relative p-5 rounded-xl group ${
                index % 2 === 1
                  ? "bg-gradient-to-tr from-gray-100 to-gray-50 dark:bg-gradient-to-tr dark:from-gray-800 dark:to-gray-800/[0.65]"
                  : ""
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
              <div className="space-y-1.5">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 pr-6">
                  <a
                    className="before:absolute before:inset-0"
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {bookmark.title}
                  </a>
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>{getDomain(bookmark.url)}</span>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                  <span>{bookmark.folder}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {filtered.length === 0 && (
          <motion.div
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -10}}
            transition={{duration: 0.3}}
            className="text-center text-gray-500 dark:text-gray-400 py-8"
          >
            No bookmarks found matching your search.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
