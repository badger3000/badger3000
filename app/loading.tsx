export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse space-y-8 max-w-xl w-full px-6">
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 dark:bg-gray-800 p-5 rounded-xl"
            >
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mt-1"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
