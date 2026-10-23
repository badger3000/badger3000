/**
 * Retrieval: intent + the visitor's terms → GROQ → cards (ADR 0008, step 2).
 *
 * Everything the agent says is traceable to a document. The GROQ lives in
 * @badger3000/sanity (`chatQueries`, so `sanity:check` parses and runs it);
 * each list query takes the terms as `$q` and a `$limit` cap, so one question
 * cannot drag the whole dataset across the edge, and returns its own counts.
 * This module only maps rows to cards, and every card carries only what the
 * client's card components render.
 */
import { chatQueries as q } from "@badger3000/sanity/queries";
import type {
  ArticleCountQueryResult,
  ArticlesForChatQueryResult,
  BookmarksForChatQueryResult,
  EducationForChatQueryResult,
  ExperienceForChatQueryResult,
  ExperimentsForChatQueryResult,
  GolfScoresForChatQueryResult,
  ProjectCountQueryResult,
  ProjectsForChatQueryResult,
  SettingsForChatQueryResult,
  SkillsForChatQueryResult,
  TestimonialsForChatQueryResult,
} from "@badger3000/sanity/types";
import type { Intent } from "./intents.ts";

/**
 * How retrieval reads Sanity. Passed in rather than imported, so the agent
 * never touches env: the endpoint hands it the real client, `agent:check` a
 * stub over fixture documents.
 */
export type ChatFetch = <T>(query: string, params?: Record<string, unknown>) => Promise<T>;

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
  /** Documents of this kind in the dataset. */
  total: number;
  /** How many of them match the visitor's terms; `total` when unfiltered. */
  matched: number;
  /** The terms that narrowed the answer; empty when there were none or nothing matched. */
  narrowedBy: string[];
  /** Skills only: the skills the terms named, with the category each is under. */
  known?: { skill: string; category: string }[];
}

/** The most rows one answer carries, per intent. */
const LIMIT = {
  projects: 8,
  articles: 6,
  experiments: 6,
  experience: 8,
  education: 8,
  skills: 20,
  testimonials: 5,
  bookmarks: 8,
  golf: 10,
} as const;

interface Listed<Row> {
  total: number;
  matched: number;
  rows: Row[];
}

const month = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : undefined;

/**
 * Terms → GROQ `match` patterns, as a param (never interpolated). A trailing
 * `*` makes each a prefix, so "bookmark" finds "bookmarks"; anything that is
 * not a letter, digit, `.` or `-` is dropped, so a term cannot carry its own
 * wildcard.
 */
export function patterns(terms: string[]): string[] {
  return terms
    .map((term) => term.toLowerCase().replace(/[^\p{L}\p{N}.-]/gu, ""))
    .filter((term) => term.replace(/[.-]/g, "").length > 1)
    .map((term) => `${term}*`);
}

/**
 * One list query with the visitor's terms, falling back to the unfiltered list
 * when nothing matches: a question whose words miss still gets the content,
 * not "no results".
 */
async function list<Row>(
  fetch: ChatFetch,
  query: string,
  terms: string[],
  limit: number,
): Promise<Listed<Row> & { narrowedBy: string[] }> {
  const q = patterns(terms);
  if (q.length) {
    const hit = await fetch<Listed<Row>>(query, { q, limit });
    if (hit.matched > 0) {
      // Terms that match everything ("golf" among golf rounds) narrowed nothing.
      return { ...hit, narrowedBy: hit.matched < hit.total ? terms : [] };
    }
  }
  return { ...(await fetch<Listed<Row>>(query, { q: [], limit })), narrowedBy: [] };
}

/** Same rule as GROQ's `match` with a `term*` pattern: some word starts with the term. */
const named = (text: string, term: string) =>
  text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .some((word) => word && word.startsWith(term.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "")));

export async function retrieve(intent: Intent, terms: string[], fetch: ChatFetch): Promise<Retrieved> {
  switch (intent) {
    case "projects": {
      const found = await list<ProjectsForChatQueryResult["rows"][number]>(fetch, q.projectsForChat, terms, LIMIT.projects);
      return {
        ...found,
        cards: found.rows.map((row) => ({
          kind: "project" as const,
          title: row.title,
          subtitle: row.topic ?? undefined,
          meta: row.tech.slice(0, 4).join(" · ") || undefined,
          href: row.url ?? undefined,
          tags: row.topic ? [row.topic] : undefined,
        })),
        facts: found.rows.map((row) =>
          // The topic is often literally "Project", which reads as
          // "a project project" — say it once, or not at all.
          row.topic && !/^project$/i.test(row.topic) ? `${row.title}, ${row.topic}` : row.title,
        ),
      };
    }

    case "articles": {
      const found = await list<ArticlesForChatQueryResult["rows"][number]>(fetch, q.articlesForChat, terms, LIMIT.articles);
      return {
        ...found,
        cards: found.rows.map((row) => ({
          kind: "article" as const,
          title: row.title,
          subtitle: row.excerpt || undefined,
          meta: month(row.date),
          href: `/articles/${row.slug}`,
          tags: row.topic ? [row.topic] : undefined,
        })),
        facts: found.rows.map((row) => `${row.title}${row.date ? `, published ${month(row.date)}` : ""}`),
      };
    }

    case "experiments": {
      const found = await list<ExperimentsForChatQueryResult["rows"][number]>(
        fetch,
        q.experimentsForChat,
        terms,
        LIMIT.experiments,
      );
      return {
        ...found,
        cards: found.rows.map((row) => ({
          kind: "experiment" as const,
          title: row.title,
          subtitle: row.excerpt || undefined,
          href: row.url ?? `/codepen/${row.slug}`,
          tags: row.topic ? [row.topic] : undefined,
        })),
        facts: found.rows.map((row) => row.title),
      };
    }

    case "experience":
    case "education": {
      const isEducation = intent === "education";
      const found = isEducation
        ? await list<EducationForChatQueryResult["rows"][number]>(fetch, q.educationForChat, terms, LIMIT.education)
        : await list<ExperienceForChatQueryResult["rows"][number]>(fetch, q.experienceForChat, terms, LIMIT.experience);

      return {
        ...found,
        cards: found.rows.map((row) => ({
          kind: isEducation ? ("education" as const) : ("role" as const),
          title: row.title,
          subtitle: [row.org, "loc" in row ? row.loc : null].filter(Boolean).join("  ·  ") || undefined,
          body: row.description || undefined,
          meta: [row.startDate, row.endDate ?? "Present"].filter(Boolean).join(" — "),
          href: row.url ?? undefined,
        })),
        facts: found.rows.map((row) => `${row.title}${row.org ? ` at ${row.org}` : ""}`),
      };
    }

    case "skills": {
      const found = await list<SkillsForChatQueryResult["rows"][number]>(fetch, q.skillsForChat, terms, LIMIT.skills);
      const total = found.rows.reduce((sum, row) => sum + row.skills.length, 0);
      // Which skills the visitor named, by the same rule the query matched on,
      // so "does he know TypeScript?" can answer yes or no.
      const known = found.narrowedBy.length
        ? found.rows.flatMap((row) =>
            row.skills
              .filter((skill) => terms.some((term) => named(`${skill.name} ${skill.badgeLabel ?? ""}`, term)))
              .map((skill) => ({ skill: skill.name, category: row.name.trim() })),
          )
        : [];
      return {
        ...found,
        known,
        cards: found.rows.map((row) => ({
          kind: "skillGroup" as const,
          title: row.name.trim(),
          tags: row.skills.map((skill) => skill.badgeLabel ?? skill.name),
        })),
        facts: [
          `${total} skills across ${found.rows.length} categories`,
          ...found.rows.map((row) => row.name.trim()),
        ],
      };
    }

    case "testimonials": {
      const found = await list<TestimonialsForChatQueryResult["rows"][number]>(
        fetch,
        q.testimonialsForChat,
        terms,
        LIMIT.testimonials,
      );
      return {
        ...found,
        cards: found.rows.map((row) => ({
          kind: "testimonial" as const,
          title: row.name,
          subtitle: [row.role, row.company].filter(Boolean).join(" · ") || undefined,
          body: row.content || undefined,
          href: row.profileUrl ?? undefined,
        })),
        facts: found.rows.map((row) => `${row.name}${row.company ? `, who worked with him at ${row.company}` : ""}`),
      };
    }

    case "bookmarks": {
      const found = await list<BookmarksForChatQueryResult["rows"][number]>(fetch, q.bookmarksForChat, terms, LIMIT.bookmarks);
      const folders = new Set(found.rows.map((row) => row.folder).filter(Boolean));
      return {
        ...found,
        cards: found.rows.map((row) => ({
          kind: "bookmark" as const,
          title: row.title,
          subtitle: row.folder ?? undefined,
          href: row.url,
        })),
        facts: [`${folders.size} folders, including ${[...folders].slice(0, 3).join(", ")}`],
      };
    }

    case "golf": {
      const found = await list<GolfScoresForChatQueryResult["rows"][number]>(fetch, q.golfScoresForChat, terms, LIMIT.golf);
      // The query filters on `defined(score)`; typegen can't see that inside a projection.
      const scores = found.rows.map((row) => row.score).filter((score) => score !== null);
      const best = scores.length ? Math.min(...scores) : 0;
      const average = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      return {
        ...found,
        cards: found.rows.map((row) => ({
          kind: "golf" as const,
          title: row.course,
          meta: month(row.date),
          body: `Score ${row.score}`,
        })),
        facts: [`best round ${best}`, `average ${average}`, `${found.rows.length} most recent rounds`],
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
        total: 1,
        matched: 1,
        narrowedBy: [],
      };

    case "about": {
      const [settings, projects, articles] = await Promise.all([
        fetch<SettingsForChatQueryResult>(q.settingsForChat),
        fetch<ProjectCountQueryResult>(q.projectCount),
        fetch<ArticleCountQueryResult>(q.articleCount),
      ]);

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
          total: 1,
          matched: 1,
          narrowedBy: [],
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
          settings.location ? `based in ${settings.location}` : "",
          `${projects} projects and ${articles} articles on this site`,
        ].filter(Boolean),
        total: 1,
        matched: 1,
        narrowedBy: [],
      };
    }

    default:
      // `suggest` asks nothing of Sanity — it is the always-there fallback.
      return { cards: [], facts: [], total: 0, matched: 0, narrowedBy: [] };
  }
}
