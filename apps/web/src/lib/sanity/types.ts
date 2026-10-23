/**
 * Content shapes returned by the GROQ in @badger3000/sanity.
 *
 * Generated: `sanity typegen` writes packages/sanity/src/sanity.types.ts from
 * the schema, and the aliases below re-export its results under the names the
 * components use. A field the schema does not mark required is `| null`. Where
 * the schema and the pen disagree the schema wins and the `.pen` binding gets
 * corrected.
 */
import type {
  BookmarksQueryResult,
  EducationQueryResult,
  ExperienceQueryResult,
  ExperimentsQueryResult,
  SkillsQueryResult,
  TestimonialsQueryResult,
} from "@badger3000/sanity/types";

export type CardLayout = "large" | "small" | "wide" | "tall" | string;

export type Experiment = ExperimentsQueryResult[number];
export type Skill = NonNullable<SkillsQueryResult[number]["skills"]>[number];
export type Testimonial = TestimonialsQueryResult[number];
export type Bookmark = BookmarksQueryResult[number];
export type ExperienceEntry = ExperienceQueryResult[number];
export type EducationEntry = EducationQueryResult[number];

/*
 * Hand-written until their call sites handle the generated nullability
 * (`field ?? undefined`): typegen says `| null` for Project.title/tech,
 * Article.title, SkillCategory.skills, GolfScore.course/date/score,
 * Topic.title and SiteSettings.links, where these say non-null. Live data has
 * no such nulls today. Each becomes `XQueryResult[number]` like the ones above.
 */

export interface SanityImage {
  alt?: string;
  asset?: {
    _id?: string;
    url?: string;
    metadata?: { dimensions?: { width: number; height: number; aspectRatio: number } };
  };
}

/** `projects` — ProjectCard's slots (pen FE7oC). */
export interface Project {
  id: string;
  title: string;
  slug: string;
  /** pen: `Tag ← project.topic` (the topic is a reference, dereferenced here) */
  topic: string | null;
  topicSlug: string | null;
  tech: string[];
  /** pen: `← project.webUrl`; the schema field is `web_url`, aliased on the way out */
  webUrl: string | null;
  cardLayout: CardLayout | null;
  order: number | null;
  /**
   * pen: `Desc ← project.excerpt`. No such schema field exists; the projection
   * flattens `project_description` (portable text) to the first block's text.
   * Null when a project has no description.
   */
  excerpt: string | null;
  /** Document creation time — the card's year badge has no binding of its own. */
  createdAt: string | null;
}

/** `articles` — the browse view and the home card grid. */
export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  topic: string | null;
  mainImage: SanityImage | null;
  publishedAt: string;
}

export interface SkillCategory {
  name: string;
  order: number | null;
  skills: Skill[];
}

/** pen: `tr · GolfRow ← golfScore{course,date,score}` */
export interface GolfScore {
  course: string;
  date: string;
  score: number;
}

export interface Topic {
  title: string;
  slug: string | null;
  /** Hex string; the projection unwraps the stored colour object. */
  backgroundColor: string | null;
}

/** pen: `AvatarUser ← settings.name` */
export interface SiteSettings {
  name: string | null;
  title: string | null;
  location: string | null;
  occupation: string | null;
  description: string | null;
  avatarImage: SanityImage | null;
  links: { siteName: string | null; webUrl: string | null }[];
}
