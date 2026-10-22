/**
 * Retrieval: intent → GROQ → cards (ADR 0008, step 2).
 *
 * Everything the agent says is traceable to a document. Each projection is
 * capped so one question cannot drag the whole dataset across the edge, and
 * every card carries only what the client's card components render.
 */
import { groq } from "../sanity/queries.ts";
import { getClient } from "../sanity/client.ts";
import type { Intent } from "./intents.ts";

/** One rendered answer. The client maps `kind` to a component. */
export interface Card {
  kind:
    | "project"
    | "article"
    | "experiment"
    | "role"
    | "education"
    | "skillGroup"
    | "testimonial"
    | "bookmark"
    | "golf"
    | "bio"
    | "contact";
  title: string;
  subtitle?: string;
  body?: string;
  meta?: string;
  href?: string;
  tags?: string[];
}

export interface Retrieved {
  cards: Card[];
  /** Short facts handed to the composer, so it can only talk about these. */
  facts: string[];
  count: number;
}

interface ProjectRow {
  title: string;
  topic: string | null;
  tech: string[];
  url: string | null;
}
interface ArticleRow {
  title: string;
  slug: string;
  excerpt: string;
  topic: string | null;
  date: string;
}
interface PenRow {
  title: string;
  slug: string;
  excerpt: string;
  url: string | null;
  topic: string | null;
}
interface RoleRow {
  title: string;
  org: string | null;
  loc?: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  url: string | null;
}
interface SkillRow {
  name: string;
  badgeLabel: string | null;
}
interface SkillGroupRow {
  name: string;
  skills: SkillRow[];
}
interface TestimonialRow {
  name: string;
  role: string | null;
  company: string | null;
  content: string | null;
  profileUrl: string | null;
}
interface BookmarkRow {
  title: string;
  url: string;
  folder: string | null;
}
interface GolfRow {
  course: string;
  date: string;
  score: number;
}
interface SettingsRow {
  name: string | null;
  title: string | null;
  location: string | null;
  occupation: string | null;
  description: string | null;
}

const month = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : undefined;

/**
 * Narrow the answer with the visitor's own words. Never returns empty when the
 * retrieval did: filtering a real answer down to nothing reads as "no results"
 * when the content is simply there under different words.
 *
 * A word that matches most of the cards carries no information — "golf" on the
 * golf page matches every course name but one — so only words that are
 * discriminating are used. Without that, the word that picked the intent would
 * then delete results inside it.
 */
export function filterCards(cards: Card[], query: string): Card[] {
  const words = query.split(" ").filter((word) => word.length > 2);
  if (!words.length || !cards.length) return cards;

  const hay = (card: Card) =>
    [card.title, card.subtitle, card.body, ...(card.tags ?? [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

  const discriminating = words.filter((word) => {
    const hits = cards.filter((card) => hay(card).includes(word)).length;
    return hits > 0 && hits * 2 < cards.length;
  });
  if (!discriminating.length) return cards;

  const narrowed = cards.filter((card) => discriminating.some((word) => hay(card).includes(word)));
  return narrowed.length ? narrowed : cards;
}

export async function retrieve(intent: Intent): Promise<Retrieved> {
  const client = getClient();

  switch (intent) {
    case "projects": {
      const rows = await client.fetch<ProjectRow[]>(groq`*[_type == "projects"] | order(order asc) [0...8] {
        title, "topic": topic->title, tech, "url": web_url
      }`);
      return {
        cards: rows.map((row) => ({
          kind: "project" as const,
          title: row.title,
          subtitle: row.topic ?? undefined,
          meta: row.tech.slice(0, 4).join(" · ") || undefined,
          href: row.url ?? undefined,
          tags: row.topic ? [row.topic] : undefined,
        })),
        facts: rows.map((row) =>
          // The topic is often literally "Project", which reads as
          // "a project project" — say it once, or not at all.
          row.topic && !/^project$/i.test(row.topic) ? `${row.title}, ${row.topic}` : row.title,
        ),
        count: rows.length,
      };
    }

    case "articles": {
      const rows = await client.fetch<ArticleRow[]>(groq`*[_type == "articles" && defined(slug.current)] | order(_createdAt desc) [0...6] {
        title, "slug": slug.current, "excerpt": coalesce(excerpt, ""), "topic": topic->title, "date": _createdAt
      }`);
      return {
        cards: rows.map((row) => ({
          kind: "article" as const,
          title: row.title,
          subtitle: row.excerpt || undefined,
          meta: month(row.date),
          href: `/articles/${row.slug}`,
          tags: row.topic ? [row.topic] : undefined,
        })),
        facts: rows.map((row) => `${row.title}${row.date ? `, published ${month(row.date)}` : ""}`),
        count: rows.length,
      };
    }

    case "experiments": {
      const rows = await client.fetch<PenRow[]>(groq`*[_type == "codepen"] | order(_createdAt desc) [0...6] {
        title, "slug": slug.current, "excerpt": coalesce(excerpt, ""), "url": penUrl, "topic": topic->title
      }`);
      return {
        cards: rows.map((row) => ({
          kind: "experiment" as const,
          title: row.title,
          subtitle: row.excerpt || undefined,
          href: row.url ?? `/codepen/${row.slug}`,
          tags: row.topic ? [row.topic] : undefined,
        })),
        facts: rows.map((row) => row.title),
        count: rows.length,
      };
    }

    case "experience":
    case "education": {
      const isEducation = intent === "education";
      const rows = isEducation
        ? await client.fetch<RoleRow[]>(groq`*[_type == "education"] | order(startDate desc) [0...8] {
            "title": degree, "org": institution, startDate, endDate, description, "url": institutionUrl
          }`)
        : await client.fetch<RoleRow[]>(groq`*[_type == "experience"] | order(startDate desc) [0...8] {
            title, "org": company, "loc": location, startDate, endDate, description, "url": companyUrl
          }`);

      return {
        cards: rows.map((row) => ({
          kind: isEducation ? ("education" as const) : ("role" as const),
          title: row.title,
          subtitle: [row.org, row.loc].filter(Boolean).join("  ·  ") || undefined,
          body: row.description || undefined,
          meta: [row.startDate, row.endDate ?? "Present"].filter(Boolean).join(" — "),
          href: row.url ?? undefined,
        })),
        facts: rows.map((row) => `${row.title}${row.org ? ` at ${row.org}` : ""}`),
        count: rows.length,
      };
    }

    case "skills": {
      const rows = await client.fetch<SkillGroupRow[]>(groq`*[_type == "skillCategory"] | order(order asc) {
        name, "skills": skills[] { name, badgeLabel }
      }`);
      const total = rows.reduce((sum, row) => sum + row.skills.length, 0);
      return {
        cards: rows.map((row) => ({
          kind: "skillGroup" as const,
          title: row.name.trim(),
          tags: row.skills.map((skill) => skill.badgeLabel ?? skill.name),
        })),
        facts: [
          `${total} skills across ${rows.length} categories`,
          ...rows.map((row) => row.name.trim()),
        ],
        count: total,
      };
    }

    case "testimonials": {
      const rows = await client.fetch<TestimonialRow[]>(groq`*[_type == "testimonial"] | order(order asc) [0...5] {
        name, role, company, content, profileUrl
      }`);
      return {
        cards: rows.map((row) => ({
          kind: "testimonial" as const,
          title: row.name,
          subtitle: [row.role, row.company].filter(Boolean).join(" · ") || undefined,
          body: row.content || undefined,
          href: row.profileUrl ?? undefined,
        })),
        facts: rows.map((row) => `${row.name}${row.company ? `, who worked with him at ${row.company}` : ""}`),
        count: rows.length,
      };
    }

    case "bookmarks": {
      const rows = await client.fetch<BookmarkRow[]>(groq`*[_type == "bookmark"] | order(title asc) [0...8] {
        title, url, "folder": folder->name
      }`);
      const folders = new Set(rows.map((row) => row.folder).filter(Boolean));
      return {
        cards: rows.map((row) => ({
          kind: "bookmark" as const,
          title: row.title,
          subtitle: row.folder ?? undefined,
          href: row.url,
        })),
        facts: [`${folders.size} folders, including ${[...folders].slice(0, 3).join(", ")}`],
        count: rows.length,
      };
    }

    case "golf": {
      const rows = await client.fetch<GolfRow[]>(groq`*[_type == "golfScores"] | order(date desc) [0...10] {
        course, date, score
      }`);
      const scores = rows.map((row) => row.score);
      const best = scores.length ? Math.min(...scores) : 0;
      const average = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      return {
        cards: rows.map((row) => ({
          kind: "golf" as const,
          title: row.course,
          meta: month(row.date),
          body: `Score ${row.score}`,
        })),
        facts: [
          `best round ${best}`,
          `average ${average}`,
          `${rows.length} most recent rounds`,
        ],
        count: rows.length,
      };
    }

    case "contact":
      return {
        cards: [
          {
            kind: "contact",
            title: "hello@badger3000.com",
            subtitle: "Email is the surest way to reach Kyle.",
          },
        ],
        facts: ["Kyle can be reached at hello@badger3000.com"],
        count: 1,
      };

    case "about": {
      const settings = await client.fetch<SettingsRow | null>(groq`*[_type == "settings"][0] {
        name, title, location, occupation, description
      }`);
      const projects = await client.fetch<number>(groq`count(*[_type == "projects"])`);
      const articles = await client.fetch<number>(groq`count(*[_type == "articles"])`);

      if (!settings) {
        return {
          cards: [
            {
              kind: "bio",
              title: "Kyle Ross",
              body: "The settings document has no bio written yet — the /about cards fill in from it.",
            },
          ],
          facts: [],
          count: 1,
        };
      }

      const who = [settings.name, settings.title].filter(Boolean).join(", ");
      return {
        cards: [
          {
            kind: "bio",
            title: who,
            subtitle: [settings.occupation, settings.location].filter(Boolean).join(" · ") || undefined,
            body: settings.description || undefined,
          },
        ],
        facts: [
          who,
          settings.occupation ?? "",
          `${projects} projects and ${articles} articles on this site`,
        ].filter(Boolean),
        count: 1,
      };
    }

    default:
      // `suggest` asks nothing of Sanity — it is the always-there fallback.
      return { cards: [], facts: [], count: 0 };
  }
}