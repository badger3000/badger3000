/**
 * The three pen skins and how they are stored.
 *
 * Shared by the desktop TopBar toggle and the mobile drawer's Appearance
 * segment so both read and write one place. The list itself comes from
 * `@badger3000/tokens`, next to the CSS that defines each skin. `applyTheme` fires `badger:theme`
 * so the other control can repaint without re-reading storage.
 */
import { themes as THEMES, type Theme } from "@badger3000/tokens";

export { THEMES, type Theme };

const KEY = "badger-theme";

export const isTheme = (value: unknown): value is Theme =>
  typeof value === "string" && (THEMES as readonly string[]).includes(value);

export function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(KEY);
    return isTheme(stored) ? stored : "light";
  } catch {
    // Storage blocked (private mode): light is the documented default.
    return "light";
  }
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // The skin still applies for this page view even if it cannot be stored.
  }
  dispatchEvent(new CustomEvent<Theme>("badger:theme", { detail: theme }));
}