import Bookmarks from "@/components/Bookmarks";
import bookmarksData from "@/data/bookmarks.json";

export const metadata = {
  title: "Bookmarks | Kyle Ross",
  description:
    "A collection of bookmarks and useful links curated by Kyle Ross.",
};

export default function BookmarksPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="pb-12 md:pb-20">
        <h1 className="font-inter-tight text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
          Bookmarks
        </h1>
        <Bookmarks bookmarks={bookmarksData} />
      </div>
    </div>
  );
}
