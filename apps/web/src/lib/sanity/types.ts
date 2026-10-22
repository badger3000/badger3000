/**
 * Content shapes returned by the GROQ in ./queries.ts.
 * These mirror `schemas/parts/*.js` in the repo root, not the pen — where the
 * two disagree the schema wins and the `.pen` binding gets corrected.
 */

export interface SanityImage {
  alt?: string;
  asset?: {
    _id?: string;
    url?: string;
    metadata?: { dimensions?: { width: number; height: number; aspectRatio: number } };
  };
}

export type CardLayout = "large" | "small" | "wide" | "tall" | string;

/** `projects` — ProjectCard's slots (pen FE7oC). */
export interface Project {
  id: string;
  title: string;
  slug: string;
  /** pen: `Monogram ← project.title[0]` */
  monogram: string;
  /** pen: `Tag ← project.topic` (the topic is a reference, dereferenced here) */
  topic: string | null;
  topicSlug: string | null;
  tech: string[];
  /** pen: `← project.webUrl`; the schema field is `web_url`, aliased on the way out */
  webUrl: string | null;
  cardLayout: CardLayout | null;
  order: number | null;
}

/** `articles` and `codepen` — the browse views and the home card grid. */
export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  topic: string | null;
  mainImage: SanityImage | null;
  publishedAt: string;
}

export interface Experiment {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  topic: string | null;
  penUrl: string | null;
  thumbnail: SanityImage | null;
  cardLayout: CardLayout | null;
}

export interface Skill {
  name: string;
  badgeType: string | null;
  badgeLabel: string | null;
  badgeColor: string | null;
}

export interface SkillCategory {
  name: string;
  order: number | null;
  skills: Skill[];
}

export interface Testimonial {
  name: string;
  role: string | null;
  company: string | null;
  profileUrl: string | null;
  photo: SanityImage | null;
  content: string | null;
  order: number | null;
  featured: boolean | null;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  folder: string | null;
}

/** pen: `tr · GolfRow ← golfScore{course,date,score}` */
export interface GolfScore {
  course: string;
  date: string;
  score: number;
}

export interface ExperienceEntry {
  title: string;
  company: string | null;
  companyUrl: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  logo: SanityImage | null;
  order: number | null;
}

export interface EducationEntry {
  degree: string;
  institution: string | null;
  institutionUrl: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  logo: SanityImage | null;
  order: number | null;
}

export interface Topic {
  title: string;
  slug: string | null;
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