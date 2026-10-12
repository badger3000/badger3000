import Articles from "@/components/Articles";

export default async function ArticlesPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="pb-12 md:pb-20">
        <h1 className="font-inter-tight text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
          Articles
        </h1>
        <Articles limit={undefined} showHeading={false} showViewAll={false} />
      </div>
    </div>
  );
}
