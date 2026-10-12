import Articles from "@/components/Articles";

export const metadata = {
  title: "Articles | Kyle Ross",
  description:
    "Articles and thoughts about web development, technology, and more.",
};
// Regenerates every 60 seconds (adjust as needed)
export const revalidate = 60;
export default async function ArticlesPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="pb-12 md:pb-20">
        <h1 className="font-inter-tight text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
          Articles
        </h1>
        <Articles showHeading={false} showViewAll={false} showFilter={true} />
      </div>
    </div>
  );
}
