# Lane: design

Read `docs/review/2026-10-22/briefs/_common.md` first. Lane name for the report and signal: `design`.

Also read `docs/runbooks/designing-from-the-pen.md`.

## Scope

1. **Component masters vs code.** For every reusable component in the pen (Button `CTvHL`, Tag `rw7Gc`, CountBadge `e4RkB0`, ShieldsBadge `NjGub`, Avatar `Xu2VY`, AvatarUser `kF8ut`, Input `WIcVr`, IconButton `HFjfa`, FilterChip `RA61q`, NavItem `LDNXV`, StatTile `Saf7N`, MessageBubble `x5CCM`, AgentMessage `CVVRV`, Card `I2gPrr`, ProjectCard `FE7oC`, Sidebar `pL9CR`, Composer `c2P43y`, PageHeader `a1JCtb`, SuggestionChip `TPq9Z`, TopBar `r30jlq`, FeatureCard `f3kriq`) compare its `context` (tag, props, Sanity binding), variants, geometry (padding/gap/radius/size), typography and fills against `apps/web/src/components/*.astro`. Flag missing masters (no file), props that differ, wrong semantic tag, wrong token.
2. **Tokens.** Design Tokens board `Jy3WM` + `GetVariables()` vs `apps/web/src/styles/tokens.css` (light/dark/forest). Missing, extra, or mismatched values. Hardcoded colors in components/pages instead of `var(--a-*)` (grep `#[0-9a-fA-F]{3,8}` and `rgb`).
3. **Screens vs routes.** Each top-level frame (Home `l7yp4`, Conversation `PuDys`, Response Cards `x55Spn`, Browse frames, Mobile frames, Article — Detail `I4mvDB`, Experiments — Detail `vKVLC`, dark/forest variants) → which route renders it, what's missing or different. Use `TakeScreenshot` on a frame and compare to the page in the browser at the same width. Do 3-5 screens with visual comparison, not all.
4. **Detail views spec.** Since `I4mvDB` and `vKVLC` have no route yet, write a build-ready spec in your Proposal: sections, components used, Sanity field per slot (from `context`), responsive notes.

## Proposal must include

- The `packages/ui` list: which components are presentational masters (move to the package) vs app shell (stay in `apps/web`), and the props API for each one you'd change.
- The `packages/tokens` contents (what goes in, what stays as base/reset CSS, whether to emit a TS map, what to do with `lib/palette.ts`).
- Pen corrections needed (where the pen is wrong and the schema/code is right), e.g. ProjectCard `project.excerpt`.
