export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto pb-12 md:pb-20">
      <div className="animate-pulse space-y-4">
        <div className="text-center mb-8">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mx-auto mb-2"></div>
        </div>

        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>

        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
}
