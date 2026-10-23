/**
 * @badger3000/ui — the pen's presentational masters as Astro components.
 *
 * Pure: plain props in, markup and scoped CSS out. Nothing here knows about
 * Sanity, routing, storage or the chat island; the app maps its data onto
 * these props and keeps the shell (Sidebar, bars, drawer) and the chat
 * templates itself. Styles use `var(--a-*)` from `@badger3000/tokens` only.
 */
export { default as Avatar, type AvatarSize } from "./src/Avatar.astro";
export { default as AvatarUser } from "./src/AvatarUser.astro";
export { default as Button } from "./src/Button.astro";
export { default as Card } from "./src/Card.astro";
export { default as ContentCard } from "./src/ContentCard.astro";
export { default as CountBadge } from "./src/CountBadge.astro";
export { default as FeatureCard } from "./src/FeatureCard.astro";
export { default as FilterBar, type Chip } from "./src/FilterBar.astro";
export { default as FilterChip } from "./src/FilterChip.astro";
export { default as Icon } from "./src/Icon.astro";
export { default as IconButton } from "./src/IconButton.astro";
export { default as Input } from "./src/Input.astro";
export { default as NavItem } from "./src/NavItem.astro";
export { default as PageHeader } from "./src/PageHeader.astro";
export { default as ProjectCard } from "./src/ProjectCard.astro";
export { default as ShieldsBadge } from "./src/ShieldsBadge.astro";
export { default as StatTile } from "./src/StatTile.astro";
export { default as SuggestionChip } from "./src/SuggestionChip.astro";
export { default as Tag } from "./src/Tag.astro";
