import {client} from "@/lib/sanity";

interface Skill {
  name: string;
  badgeType?: "shields" | "custom";
  // Shields.io fields
  badgeLabel?: string;
  badgeColor?: string;
  logoName?: string;
  logoColor?: string;
  // Custom badge
  customBadgeUrl?: string;
  websiteUrl?: string;
  order?: number;
}

interface SkillCategory {
  _id: string;
  name: string;
  order?: number;
  skills: Skill[];
}

// Helper function to generate shields.io badge URL
function generateBadgeUrl(skill: Skill): string | null {
  if (skill.badgeType === "custom") {
    return skill.customBadgeUrl || null;
  }

  // Default to shields.io
  if (!skill.badgeLabel || !skill.badgeColor) {
    return null;
  }

  const baseUrl = "https://img.shields.io/badge";
  const label = encodeURIComponent(skill.badgeLabel);
  const color = skill.badgeColor;
  const style = "for-the-badge";

  let url = `${baseUrl}/${label}-${color}?style=${style}`;

  if (skill.logoName) {
    url += `&logo=${encodeURIComponent(skill.logoName)}`;

    if (skill.logoColor) {
      url += `&logoColor=${skill.logoColor}`;
    } else {
      url += "&logoColor=white"; // Default to white
    }
  }

  return url;
}

async function getSkillCategories(): Promise<SkillCategory[]> {
  const query = `*[_type == "skillCategory"] | order(order asc) {
    _id,
    name,
    order,
    skills[] | order(order asc) {
      name,
      badgeType,
      badgeLabel,
      badgeColor,
      logoName,
      logoColor,
      customBadgeUrl,
      websiteUrl,
      order
    }
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
export default async function SkillsTech() {
  const categories = await getSkillCategories();
  if (!categories.length) {
    return (
      <section>
        <h2 className="font-inter-tight text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 text-center">
          Skills & Technologies
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center">
          No skill categories found.
        </p>
      </section>
    );
  }
  return (
    <section>
      <h2 className="font-inter-tight text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 text-center">
        Skills & Technologies
      </h2>
      {categories.map((category) => (
        <div key={category._id} className="w-auto p-6">
          <h3 className="font-inter-tight text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
            {category.name}
          </h3>
          <div className="flex flex-wrap gap-2">
            {category.skills?.map((skill, index) => {
              const badgeUrl = generateBadgeUrl(skill);

              return (
                <div key={`${category._id}-${index}`}>
                  {badgeUrl ? (
                    skill.websiteUrl ? (
                      <a
                        href={skill.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={skill.name}
                      >
                        <img
                          src={badgeUrl}
                          alt={skill.name}
                          className="transition-transform hover:scale-105"
                        />
                      </a>
                    ) : (
                      <img src={badgeUrl} alt={skill.name} title={skill.name} />
                    )
                  ) : (
                    // Fallback for skills without badges
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                      {skill.websiteUrl ? (
                        <a
                          href={skill.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {skill.name}
                        </a>
                      ) : (
                        skill.name
                      )}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
