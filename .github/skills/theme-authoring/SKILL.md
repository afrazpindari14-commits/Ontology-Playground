---
name: theme-authoring
description: "Add a new color theme to the Ontology Playground. Use when someone wants to create, author, or plug in a theme, palette, color scheme, dark mode, or light mode, or add an entry to the theme picker. Covers the appStore registration plus the CSS token block."
---

# Theme Authoring Skill

## Goal

Plug a new color theme into the Playground so it appears in the header theme
picker, is remembered across sessions, and themes every surface (main graph,
designer preview, learn pages) — with no component or graph-rendering edits.

## Read First

1. [`docs/theme-authoring-guide.md`](../../../docs/theme-authoring-guide.md) — full architecture, token table, gotchas, worked example.
2. [`src/store/appStore.ts`](../../../src/store/appStore.ts) — `ThemeId`, `THEME_OPTIONS`, `DARK_BASED_THEMES`, `isDarkTheme`, `themeClass`.
3. [`src/styles/app.css`](../../../src/styles/app.css) — the `:root` / `.light-theme` / `.theme-aurora` / `.theme-crimson` token blocks (copy the nearest one).

## Intake Questions

Ask the user:

1. Theme **id** (lowercase, e.g. `indigo`) and **display label** (e.g. `Indigo`)?
2. **Dark-based or light-based?** (Determines `DARK_BASED_THEMES` membership and which block to copy.)
3. **Accent / signature color** (used for the picker swatch and `--ms-blue*` / `--info`)?
4. Any specific surface, text, or graph colors, or should they be derived from the accent?

## Procedure

Make all edits in [`src/store/appStore.ts`](../../../src/store/appStore.ts) and
[`src/styles/app.css`](../../../src/styles/app.css). The guide's
"Add a theme in six steps" section has copy-paste snippets.

1. Add the id to the `ThemeId` union.
2. Add a `THEME_OPTIONS` entry: `{ id, label, swatch }` (swatch = accent hex).
3. If **dark-based**, add the id to `DARK_BASED_THEMES`. If light-based, leave it out.
4. Add a `themeClass()` case:
   - dark-based → `return 'theme-<id>';`
   - light-based → `return 'light-theme theme-<id>';` (layer over the light base).
5. Add a `.theme-<id>` block in `app.css` by copying `.theme-aurora` (dark) or
   `.theme-crimson` (light) and retuning the tokens.
6. Verify (see below).

## Critical Rules

- **Opaque canvas base for light themes.** `--chess-square-light` is the graph
  canvas's solid backdrop. The theme class sits on `.app-container`, not `<body>`,
  and `<body>` stays dark (`#1B1B1B`). A translucent `--chess-square-light` lets
  the dark body bleed through → dark canvas + unreadable labels. Use an opaque
  light color (e.g. `#FBF7F8`), not `rgba(..., 0.03)`. (Guide → Gotcha 1.)
- **Graph colors are CSS-driven.** Define `--graph-bg`, `--graph-node-text`,
  `--graph-edge-color`, `--graph-edge-text` in the block; the graph and designer
  read them at runtime. No `.tsx` edits. Tune for contrast against `--graph-bg`.
- **Register dark themes** in `DARK_BASED_THEMES` so `darkMode` is correct
  (graph fallback, label backplate, PNG export bg).
- **Don't introduce brand names** in ids, labels, comments, or commits. Use
  generic palette names (e.g. Aurora, Crimson, Indigo, Sand).

## Person Names

If any example data, docs, or sample instances need person names, use the
`name-generator` skill — do not invent names.

## Validate

```bash
npm run dev          # switch to the theme in the header; check graph, designer, learn pages
npx tsc --noEmit     # the ThemeId union change is type-checked here
npm run build        # full build
```

If `npm run build` only changed `public/learn.json` (a timestamp), revert it:
`git checkout -- public/learn.json`.

## Done Criteria

- New swatch + label appear in the picker; selection check mark tracks state.
- Theme persists across reload (`localStorage['theme']`).
- Main graph, designer preview, and learn pages are legible in the new theme;
  the graph canvas backdrop matches the theme (Gotcha 1 satisfied).
- Dark, Light, Aurora, Crimson unchanged.
- `tsc --noEmit` and `npm run build` pass; no brand references introduced.
