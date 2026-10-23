import Link from "next/link";

interface AuthorCitationProps {
  authorName: string;
  authorProfileUrl?: string;
  originalArticleUrl?: string;
  disclaimer?: string;
}

const ExternalIcon = () => (
  <svg
    className="w-3 h-3"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
    />
  </svg>
);

export default function AuthorCitation({
  authorName,
  authorProfileUrl,
  originalArticleUrl,
  disclaimer,
}: AuthorCitationProps) {
  // Don't render if no author name
  if (!authorName) return null;

  const defaultDisclaimer = `This article was originally written by ${authorName}.`;

  const linkClass =
    "font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 underline underline-offset-2 inline-flex items-center gap-1";

  return (
    <div className="border-y border-gray-200 dark:border-gray-700/60 py-3 mb-8">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-700 dark:text-gray-300">
        {/* Author icon */}
        <svg
          className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>

        <span>
          Originally by{" "}
          {authorProfileUrl ? (
            <Link
              href={authorProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              {authorName}
              <ExternalIcon />
            </Link>
          ) : (
            <span className="font-medium">{authorName}</span>
          )}
        </span>

        {originalArticleUrl && (
          <>
            <span className="text-gray-300 dark:text-gray-600" aria-hidden="true">
              ·
            </span>
            <Link
              href={originalArticleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              View Original
              <ExternalIcon />
            </Link>
          </>
        )}
      </div>

      <p
        className={`text-xs mt-1.5 ${
          disclaimer
            ? "text-gray-600 dark:text-gray-400"
            : "text-gray-500 dark:text-gray-500 italic"
        }`}
      >
        {disclaimer || defaultDisclaimer}
      </p>
    </div>
  );
}
