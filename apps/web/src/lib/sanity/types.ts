/**
 * Content shapes returned by the GROQ in @badger3000/sanity.
 *
 * Generated: `sanity typegen` writes packages/sanity/src/sanity.types.ts from
 * the schema, and the aliases below re-export its results under the names the
 * components use. A field the schema does not mark required is `| null`. Where
 * the schema and the pen disagree the schema wins and the `.pen` binding gets
 * corrected. Call sites handle the nulls (`field ?? undefined` into a
 * `@badger3000/ui` prop, or a fallback where a value is needed).
 */
import type {
  ArticlesQueryResult,
  BookmarksQueryResult,
  EducationQueryResult,
  ExperienceQueryResult,
  ExperimentsQueryResult,
  GolfPageQueryResult,
  ProjectsQueryResult,
  SettingsQueryResult,
  SkillsQueryResult,
  TestimonialsQueryResult,
  TopicsQueryResult,
} from "@badger3000/sanity/types";

export type CardLayout = "large" | "small" | "wide" | "tall" | string;

/** `projects` — FeatureCard's slots (pen f3kriq). `excerpt` is the first
 *  block of `project_description`; `createdAt` stands in for a year. */
export type Project = ProjectsQueryResult[number];
/** `articles` — the browse view and the home card grid. */
export type Article = ArticlesQueryResult[number];
export type Experiment = ExperimentsQueryResult[number];
export type SkillCategory = SkillsQueryResult[number];
export type Skill = NonNullable<SkillCategory["skills"]>[number];
export type Testimonial = TestimonialsQueryResult[number];
export type Bookmark = BookmarksQueryResult[number];
export type ExperienceEntry = ExperienceQueryResult[number];
export type EducationEntry = EducationQueryResult[number];
/** The golf page's one fetch: every round (oldest first), the courses, the GHIN profile. */
export type GolfPage = GolfPageQueryResult;
export type GolfRoundRow = GolfPage["rounds"][number];
export type GolfCourse = GolfPage["courses"][number];
export type GolfTeeRow = GolfCourse["tees"][number];
/** `backgroundColor` is a hex string; the projection unwraps the colour object. */
export type Topic = TopicsQueryResult[number];
/** pen: `AvatarUser ← settings.name`. Null when there is no settings document. */
export type SiteSettings = NonNullable<SettingsQueryResult>;
/** An image as the projections return it (`main_image`, `avatarImage`). */
export type SanityImage = NonNullable<Article["mainImage"]>;
