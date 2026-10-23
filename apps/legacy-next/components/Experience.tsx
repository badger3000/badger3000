import Image from "next/image";
import Link from "next/link";
import {client} from "@/lib/sanity";

interface ExperienceItem {
  _id: string;
  title: string;
  company: string;
  companyUrl?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description: string;
  logo?: {
    asset?: {
      url: string;
    };
  };
  order?: number;
  featured?: boolean;
}

async function getExperienceItems(featured = true): Promise<ExperienceItem[]> {
  const query = `*[_type == "experience" ${featured ? "&& featured == true" : ""}] | order(order asc, startDate desc) {
    _id,
    title,
    company,
    companyUrl,
    location,
    startDate,
    endDate,
    description,
    logo {
      asset-> {
        url
      }
    },
    order,
    featured
  }`;

  return client.fetch(
    query,
    {},
    {
      cache: "force-cache",
      next: {revalidate: 3600},
    }
  );
}

interface ExperienceProps {
  limit?: number;
  showAll?: boolean;
}

export default async function Experience({
  limit = 4,
  showAll = false,
}: ExperienceProps) {
  const items = await getExperienceItems(!showAll);
  const displayItems = limit ? items.slice(0, limit) : items;

  if (!displayItems.length) {
    return (
      <section>
        <h2 className="font-inter-tight text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
          Featured Experience
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          No experience items found.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="font-inter-tight text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
        Experience
      </h2>
      <div className="space-y-1 mb-4">
        {displayItems.map((item, index) => (
          <article
            key={item._id}
            className="p-5 rounded-xl odd:bg-gradient-to-tr odd:from-gray-100 odd:to-gray-50 dark:odd:bg-gradient-to-tr dark:odd:from-gray-800 dark:odd:to-gray-800/[0.65]"
          >
            <div className="sm:flex gap-5">
              <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600/[0.65] shadow-sm max-sm:mb-3 sm:mt-5">
                {item.logo?.asset?.url ? (
                  <Image
                    src={item.logo.asset.url}
                    width={50}
                    height={50}
                    alt={item.company}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <span className="text-xs text-gray-500">
                      {item.company.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <div className="space-y-1.5 mb-3">
                  <div className="text-[13px] italic text-gray-500/70">
                    {item.startDate && item.endDate
                      ? `${item.startDate} - ${item.endDate}`
                      : item.startDate || item.endDate || ""}
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                    {item.companyUrl ? (
                      <a
                        className="hover:underline decoration-2 decoration-gray-300 dark:decoration-gray-600 underline-offset-2"
                        href={item.companyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.title} at {item.company}
                      </a>
                    ) : (
                      <span>
                        {item.title} at {item.company}
                      </span>
                    )}
                  </h3>
                  {item.location && (
                    <div className="text-[13px] font-medium text-gray-600 dark:text-gray-400">
                      {item.location}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
            </div>
          </article>
        ))}

        {!showAll && (
          <Link
            href="/experience"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 group"
          >
            View full experience
            <svg
              className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        )}
      </div>
    </section>
  );
}
