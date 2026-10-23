/**
 * The Explore nav, once. Sidebar and MobileDrawer both render it with
 * `NavItem`; `id` is what a page passes as `active` and what `getCounts()`
 * keys its numbers by.
 */
export interface NavEntry {
  id: string;
  label: string;
  icon: string;
  href: string;
}

export const nav: NavEntry[] = [
  { id: "projects", label: "Projects", icon: "folder-git-2", href: "/projects" },
  { id: "articles", label: "Articles", icon: "newspaper", href: "/articles" },
  // lucide dropped brand glyphs; CodePen's box is approximated for now.
  { id: "experiments", label: "Experiments", icon: "code-xml", href: "/codepen" },
  { id: "experience", label: "Experience", icon: "briefcase", href: "/experience" },
  { id: "education", label: "Education", icon: "graduation-cap", href: "/experience#education" },
  { id: "skills", label: "Skills", icon: "sparkles", href: "/skills" },
  { id: "testimonials", label: "Testimonials", icon: "quote", href: "/testimonials" },
  { id: "bookmarks", label: "Bookmarks", icon: "bookmark", href: "/bookmarks" },
  { id: "golf", label: "Golf scores", icon: "flag", href: "/golf" },
];
