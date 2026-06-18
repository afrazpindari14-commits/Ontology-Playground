# Theme Authoring Guide

How to plug a new color theme into the Ontology Playground.

Theming is **CSS-variable based**. A theme is a named set of CSS custom-property
values that override the defaults, plus a small amount of registration in the
Zustand store so the theme appears in the picker and is remembered across
sessions. You do **not** touch the graph, designer, or learn components to add a
theme — they read their colors from the CSS variables at runtime.

---

## Architecture at a glance

There are four moving parts. The first three live in
[`src/store/appStore.ts`](../src/store/appStore.ts); the fourth lives in
[`src/styles/app.css`](../src/styles/app.css).

| Part | What it does |
| --- | --- |
| `ThemeId` union | The set of valid theme ids. |
| `THEME_OPTIONS` | Drives the header theme picker (id, label, swatch). |
| `themeClass(theme)` | Maps a theme id → the CSS class(es) on the themed root. |
| CSS token block | The actual color values, keyed on that class. |

Two helpers tie it together:

- `isDarkTheme(theme)` / `DARK_BASED_THEMES` — declares whether a theme uses the
  dark base palette. This sets the store's derived `darkMode` flag, which drives
  graph render fallbacks, node-label backplates, and the PNG-export background.
- `setTheme(theme)` — persists the choice to `localStorage['theme']` and updates
  `{ theme, darkMode }`.

### Where the theme class is applied

`themeClass(theme)` is attached to the root element of each top-level surface —
**not** to `<body>`:

- [`src/App.tsx`](../src/App.tsx) → `app-container ${themeClass(theme)}`
- [`src/components/OntologyDesigner.tsx`](../src/components/OntologyDesigner.tsx) → `designer-page ${themeClass(theme)}`
- [`src/components/LearnPage.tsx`](../src/components/LearnPage.tsx) → `learn-page ${themeClass(theme)}`

`:root` (and therefore `<body>`) always carries the **Dark** defaults. See
[Gotcha 1](#gotcha-1-the-body-stays-dark) for why that matters.

### How `themeClass` layers classes

```ts
export function themeClass(theme: ThemeId): string {
  switch (theme) {
    case 'light':   return 'light-theme';
    case 'aurora':  return 'theme-aurora';
    case 'crimson': return 'light-theme theme-crimson'; // layered
    default:        return ''; // dark = :root defaults
  }
}
```

`crimson` returns **two** classes. `.light-theme` supplies the full set of light
values; `.theme-crimson` only overrides the handful of tokens that make it
crimson. A light-based theme should do the same so you don't re-specify every
token. A dark-based theme can return a single class because `:root` is already
the dark base.

---

## The token contract

`:root` in [`src/styles/app.css`](../src/styles/app.css) defines every token.
A theme block overrides the subset that should change. Anything you omit falls
back to `:root` (for dark-based themes) or to `.light-theme` (for themes layered
over it).

| Group | Tokens | Notes |
| --- | --- | --- |
| Accent | `--ms-blue`, `--ms-blue-dark`, `--ms-blue-light`, `--info` | Primary accent used across buttons, links, highlights. Override these to re-brand the accent color. |
| Surfaces | `--bg-primary`, `--bg-secondary`, `--bg-tertiary`, `--bg-elevated` | Page and panel backgrounds, lightest → most elevated. |
| Text | `--text-primary`, `--text-secondary`, `--text-tertiary` | Foreground text, primary → muted. |
| Borders | `--border-color`, `--border-subtle` | Panel/control borders. |
| Shadow | `--shadow-glow` | Accent glow; tint it to match the accent. |
| Graph | `--graph-bg`, `--graph-node-text`, `--graph-edge-color`, `--graph-edge-text` | Read at runtime by the graph + designer preview. **Tune these for contrast against `--graph-bg`.** |
| Canvas checker | `--chess-square-dark`, `--chess-square-light` | The graph canvas backdrop pattern. `--chess-square-light` is the **solid base** — see [Gotcha 1](#gotcha-1-the-body-stays-dark). |
| About links | `--about-link-color`, `--about-link-hover-color` | Links on the About screen. |

> The accent tokens are historically named `--ms-*`. Treat them as generic accent
> variables — the name is incidental.

---

## Add a theme in six steps

The running example is a dark-based theme called **Indigo**. Where a light-based
theme differs, it's called out inline.

### 1. Extend the `ThemeId` union — `appStore.ts`

```ts
export type ThemeId = 'dark' | 'light' | 'aurora' | 'crimson' | 'indigo';
```

### 2. Register it in `THEME_OPTIONS` — `appStore.ts`

```ts
export const THEME_OPTIONS: { id: ThemeId; label: string; swatch: string }[] = [
  { id: 'dark',    label: 'Dark',    swatch: '#1B1B1B' },
  { id: 'light',   label: 'Light',   swatch: '#F5F5F5' },
  { id: 'aurora',  label: 'Aurora',  swatch: '#2AAA92' },
  { id: 'crimson', label: 'Crimson', swatch: '#D6002A' },
  { id: 'indigo',  label: 'Indigo',  swatch: '#4F46E5' }, // swatch = the dot in the picker
];
```

The `swatch` is the color dot shown next to the label in the picker menu — use
the theme's signature accent.

### 3. Declare dark-vs-light — `appStore.ts`

Dark-based themes go in `DARK_BASED_THEMES`:

```ts
const DARK_BASED_THEMES: ThemeId[] = ['dark', 'aurora', 'indigo'];
```

A **light-based** theme is left out of this list (so `darkMode` becomes `false`).

### 4. Map the id to a CSS class — `appStore.ts`

```ts
export function themeClass(theme: ThemeId): string {
  switch (theme) {
    case 'light':   return 'light-theme';
    case 'aurora':  return 'theme-aurora';
    case 'crimson': return 'light-theme theme-crimson';
    case 'indigo':  return 'theme-indigo';                  // dark-based: single class
    // a light-based theme would return 'light-theme theme-<id>'
    default:        return '';
  }
}
```

### 5. Add the CSS token block — `app.css`

Copy the nearest existing block (`.theme-aurora` for dark, `.theme-crimson` for
light) and retune. Place it after the existing theme blocks.

```css
/* Indigo theme — deep indigo base with violet accents (dark) */
.theme-indigo {
  --ms-blue: #6366F1;
  --ms-blue-dark: #4F46E5;
  --ms-blue-light: #818CF8;
  --info: #6366F1;

  --bg-primary: #15172B;
  --bg-secondary: #1C1F3A;
  --bg-tertiary: #262A4D;
  --bg-elevated: #20233F;
  --text-primary: #EEF0FF;
  --text-secondary: #B9BEE6;
  --text-tertiary: #8489B8;
  --border-color: #343A66;
  --border-subtle: #262A4D;

  --shadow-glow: 0 0 20px rgba(99, 102, 241, 0.35);

  --graph-bg: #14162A;
  --graph-node-text: #CDD2FF;
  --graph-edge-color: #5A5FA0;
  --graph-edge-text: #9AA0D6;

  --chess-square-dark: rgba(40, 44, 90, 0.85);
  --chess-square-light: rgba(30, 33, 70, 0.65);
  --about-link-color: #A5B4FC;
  --about-link-hover-color: #C7D2FE;
}
```

For a **light-based** theme, override `.theme-<id>` to layer over `.light-theme`,
and make `--chess-square-light` an **opaque** light color (see Gotcha 1).

### 6. Verify

Run the [testing checklist](#testing-checklist).

That's it — the graph, designer preview, and learn pages pick up the new
`--graph-*` and surface tokens automatically.

---

## Gotchas

### Gotcha 1: the `<body>` stays dark

The theme class is applied to `.app-container` / `.designer-page` /
`.learn-page`, **not** `<body>`. `<body>` keeps the `:root` (Dark) background
(`#1B1B1B`). Any element with a **transparent or semi-transparent background**
lets that dark body show through.

This bites the **graph canvas**. Its backdrop is the chess pattern in
`.graph-container`, whose solid base is `--chess-square-light`:

```css
.graph-container {
  background-image: /* squares painted with var(--chess-square-dark) */;
  background-color: var(--chess-square-light); /* the solid base */
}
```

If `--chess-square-light` is translucent on a light theme, the dark body bleeds
through and the canvas reads dark — making dark node labels unreadable. (This was
a real bug in Crimson.)

**Rule:** for a light theme, `--chess-square-light` must be an **opaque** light
color. Compare:

```css
/* WRONG — translucent base, dark body shows through */
--chess-square-light: rgba(214, 0, 42, 0.03);

/* RIGHT — opaque light base */
--chess-square-light: #FBF7F8;
```

Dark-based themes can use translucent values because the body behind them is
already dark.

### Gotcha 2: graph colors come from CSS, not props

`OntologyGraph` and the designer's `GraphPreview` read `--graph-node-text`,
`--graph-edge-color`, and `--graph-edge-text` from `getComputedStyle` and
re-read them when the active `theme` changes. So **defining the `--graph-*`
tokens in your theme block is all you need** — no component or TypeScript edits.
Tune them for contrast against your `--graph-bg`.

### Gotcha 3: register dark-based themes in `DARK_BASED_THEMES`

`isDarkTheme()` feeds the store's `darkMode` flag, which sets the initial graph
fallback color, the node-label backplate (`text-background-color`), and the PNG
export background. If a dark theme is missing from `DARK_BASED_THEMES`, the graph
will briefly fall back to light defaults and labels can get a light backplate.

### Gotcha 4: layer light themes over `.light-theme`

Returning `'light-theme theme-<id>'` from `themeClass` lets your block inherit
every light token and override only what's distinctive. Returning a single class
means you must re-specify the full token set or inherit Dark defaults by mistake.

---

## Testing checklist

```bash
npm run dev          # then switch to the new theme in the header picker
```

Check, in the new theme:

- [ ] **Main graph** (home, ontology loaded): node labels, edge labels, and edges
      are legible against `--graph-bg`; the canvas backdrop matches the theme
      (not a stray dark/black panel — Gotcha 1).
- [ ] **Designer** (`#/designer`, load a template, Graph tab): preview is legible.
- [ ] **Learn pages** (`#/learn`): surfaces and text read correctly.
- [ ] **Picker**: the new swatch + label appear and the check mark tracks
      selection.
- [ ] **Persistence**: reload the page — the theme is remembered.
- [ ] **No regressions**: Dark, Light, Aurora, and Crimson still look correct.

Then:

```bash
npx tsc --noEmit     # type-check (the ThemeId union change is covered here)
npm run build        # full production build
```

> `npm run build` regenerates `public/learn.json` with a fresh timestamp. If that
> is the only change there, revert it before committing:
> `git checkout -- public/learn.json`.

---

## Files you touch

| File | Change |
| --- | --- |
| [`src/store/appStore.ts`](../src/store/appStore.ts) | `ThemeId`, `THEME_OPTIONS`, `DARK_BASED_THEMES`, `themeClass()` |
| [`src/styles/app.css`](../src/styles/app.css) | one `.theme-<id>` token block |

Everything else (graph, designer, learn, picker UI) adapts automatically.
