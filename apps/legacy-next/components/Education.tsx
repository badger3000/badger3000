import Image from "next/image";
import {client} from "@/lib/sanity";

interface EducationItem {
  _id: string;
  degree: string;
  institution: string;
  institutionUrl?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  logo?: {
    asset?: {
      url: string;
    };
  };
  order?: number;
}

async function getEducationItems(): Promise<EducationItem[]> {
  const query = `*[_type == "education"] | order(order asc) {
    _id,
    degree,
    institution,
    institutionUrl,
    location,
    startDate,
    endDate,
    description,
    logo {
      asset-> {
        url
      }
    },
    order
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

export default async function Education() {
  const items = await getEducationItems();

  if (!items.length) {
    return (
      <section>
        <h2 className="font-inter-tight text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 text-center">
          Education
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center">
          No education items found.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="font-inter-tight text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 text-center">
        Education
      </h2>
      <div className="grid min-[580px]:grid-cols-2 gap-4">
        {items.map((item, index) => (
          <article
            key={item._id}
            className="relative p-5 rounded-xl odd:bg-gradient-to-tr odd:from-gray-100 odd:to-gray-50 dark:odd:bg-gradient-to-tr dark:odd:from-gray-800 dark:odd:to-gray-800/[0.65] group"
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
            <div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600/[0.65] shadow-sm mb-4">
              {item.logo?.asset?.url ? (
                <Image
                  src={item.logo.asset.url}
                  width={50}
                  height={50}
                  alt={item.institution}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-xs text-gray-500">
                    {item.institution.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                {item.institutionUrl ? (
                  <a
                    className="before:absolute before:inset-0 hover:underline decoration-2 decoration-gray-300 dark:decoration-gray-600 underline-offset-2"
                    href={item.institutionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.degree}
                  </a>
                ) : (
                  <span className="before:absolute before:inset-0">
                    {item.degree}
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.institution}
              </p>
              {item.location && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.location}
                </p>
              )}
              {item.startDate && item.endDate && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.startDate} - {item.endDate}
                </p>
              )}
              {item.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
