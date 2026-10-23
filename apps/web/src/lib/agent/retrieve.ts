/**
 * Retrieval: intent → GROQ → cards (ADR 0008, step 2).
 *
 * Everything the agent says is traceable to a document. The GROQ lives in
 * @badger3000/sanity (`chatQueries`, so `sanity:check` parses and runs it);
 * each projection there is capped so one question cannot drag the whole
 * dataset across the edge. This module only maps rows to cards, and every card
 * carries only what the client's card components render.
 */
import { chatQueries as q } from "@badger3000/sanity/queries";
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
      const rows = await client.fetch(q.projectsForChat);
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
      const rows = await client.fetch(q.articlesForChat);
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
      const rows = await client.fetch(q.experimentsForChat);
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
        ? await client.fetch(q.educationForChat)
        : await client.fetch(q.experienceForChat);

      return {
        cards: rows.map((row) => ({
          kind: isEducation ? ("education" as const) : ("role" as const),
          title: row.title,
          subtitle: [row.org, "loc" in row ? row.loc : null].filter(Boolean).join("  ·  ") || undefined,
          body: row.description || undefined,
          meta: [row.startDate, row.endDate ?? "Present"].filter(Boolean).join(" — "),
          href: row.url ?? undefined,
        })),
        facts: rows.map((row) => `${row.title}${row.org ? ` at ${row.org}` : ""}`),
        count: rows.length,
      };
    }

    case "skills": {
      const rows = await client.fetch(q.skillsForChat);
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
      const rows = await client.fetch(q.testimonialsForChat);
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
      const rows = await client.fetch(q.bookmarksForChat);
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
      const rows = await client.fetch(q.golfScoresForChat);
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
      const settings = await client.fetch(q.settingsForChat);
      const projects = await client.fetch(q.projectCount);
      const articles = await client.fetch(q.articleCount);

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