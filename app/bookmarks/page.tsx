import Bookmarks from "@/components/Bookmarks";
import {getBookmarks} from "@/lib/sanity";

export const revalidate = 3600;

export const metadata = {
  title: "Bookmarks | Kyle Ross",
  description:
    "A collection of bookmarks and useful links curated by Kyle Ross.",
};

export default async function BookmarksPage() {
  const bookmarks = await getBookmarks();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="pb-12 md:pb-20">
        <h1 className="font-inter-tight text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
          Bookmarks
        </h1>
        <Bookmarks bookmarks={bookmarks} />
      </div>
    </div>
  );
}
