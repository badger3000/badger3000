import Education from "@/components/Education";
import SkillsTech from "@/components/SkillsTech";
import PrintButton from "@/components/PrintButton";
import "./print.css";
import {client} from "@/lib/sanity";
import Image from "next/image";

export const metadata = {
  title: "Experience | Kyle Ross",
  description: "Some of my past work experience.",
};

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
}

async function getAllExperience(): Promise<ExperienceItem[]> {
  const query = `*[_type == "experience"] | order(order asc, startDate desc) {
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

export default async function ExperiencePage() {
  const items = await getAllExperience();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="pb-12 md:pb-20">
        <section>
          <article className="p-5">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Experienced Frontend Developer and Digital Experience Consultant
              with <strong>15+ years</strong> in web development, responsive
              design, modern JavaScript frameworks, and enterprise-level
              applications. Proven track record of leading development teams and
              delivering scalable solutions for major brands including{" "}
              <strong>Sony</strong>, <strong>Samsung</strong>, and{" "}
              <strong>Headspace</strong>.
            </p>
          </article>
        </section>

        <section className="mb-6">
          <h2 className="font-inter-tight text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 text-center">
            Work Experience
          </h2>
          {items.length > 0 ? (
            <div className="space-y-1">
              {items.map((item, index) => (
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
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center">
              No experience items found. Please add some in the Sanity Studio.
            </p>
          )}
        </section>

        <section className="mb-6">
          <SkillsTech />
        </section>

        <section>
          <Education />
        </section>
      </div>

      <div className="flex justify-center mb-6">
        <PrintButton />
      </div>
    </div>
  );
}
