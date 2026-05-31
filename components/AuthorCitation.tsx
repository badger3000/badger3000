import Link from "next/link";

interface AuthorCitationProps {
  authorName: string;
  authorProfileUrl?: string;
  disclaimer?: string;
}

export default function AuthorCitation({
  authorName,
  authorProfileUrl,
  disclaimer,
}: AuthorCitationProps) {
  // Don't render if no author name
  if (!authorName) return null;

  const defaultDisclaimer = `This article was originally written by ${authorName}.`;

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3 mb-6">
      <div className="flex items-start gap-3">
        {/* Author icon */}
        <svg
          className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Originally by {authorName}</span>
            {authorProfileUrl && (
              <>
                {" — "}
                <Link
                  href={authorProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 underline underline-offset-2"
                >
                  View original post
                  <svg
                    className="inline w-3 h-3 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </Link>
              </>
            )}
          </p>

          {disclaimer ? (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {disclaimer}
            </p>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">
              {defaultDisclaimer}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
