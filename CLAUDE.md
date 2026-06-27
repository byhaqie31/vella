# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What vella is

A story-page maker. A user fills a structured form about themselves, picks a
theme plus a few bounded design choices, and publishes a premium, animated
personal page. **One content model, many themes** — switching theme re-renders
the same story through a different design and motion personality.

Deep docs live in [`docs/`](docs/) — read [`docs/architecture.md`](docs/architecture.md),
[`docs/design-system.md`](docs/design-system.md), [`docs/motion.md`](docs/motion.md),
and [`docs/data-model.md`](docs/data-model.md) before non-trivial work. This file
is the short version.

## Reality check (read this first)

The root `README.md` is **aspirational**. It describes a full backend (Drizzle,
MySQL, zod, Billplz payments, R2 media, magic-link/Google auth, `@nuxt/ui`,
`@nuxt/image`, Lenis, Docker/VPS). **None of that is installed or built.**

What actually exists today: a **UI-complete frontend running entirely on
in-memory sample data** ([`app/data/sample.ts`](app/data/sample.ts)). There is
no `server/` directory, no database, no auth. In the editor store:
`touch()` (autosave), `setSlug()` (availability), `logout()`, `togglePublish()`,
and media "upload" are all **mocked** (timers / array pushes). Do not assume any
API exists — when in doubt, check `package.json` and `app/`.

## Commands

The repo uses **npm** (there is a `package-lock.json`; ignore the README's
`pnpm`). Node 20+.

| command | what |
|---|---|
| `npm install` | install deps (runs `nuxt prepare` postinstall) |
| `npm run dev` | dev server at http://localhost:3000 |
| `npm run build` | production build |
| `npm run preview` | preview the production build |
| `npm run typecheck` | `nuxt typecheck` (vue-tsc) — the only quality gate |

There is **no lint config and no test suite** yet (the README's `lint` /
`drizzle-kit` scripts do not exist). `typecheck` is the gate to run before
considering a change done.

## Architecture in one rule

> **Content and theme are fully decoupled.**

A page *is* one `StoryPage` JSON document
([`app/types/story.ts`](app/types/story.ts) — the spine). A theme is a Vue
component that satisfies one prop contract, `{ story: StoryPage }`, and renders
it. The public renderer ([`app/pages/[slug].vue`](app/pages/%5Bslug%5D.vue)) is
the whole product in ~30 lines:

```
slug → record (sample.ts) → normalizeDesign(design)
THEMES[themeKey] → theme
<component :is="theme.component" :story="story" />   + useMotion(root, scaleMotion(theme.motion, motionLevel))
```

Key files and why they matter (most architecture requires reading these
together):

- [`app/themes/registry.ts`](app/themes/registry.ts) — **the design system as
  data** and the theme catalog. Accents, type moods, every design-control table,
  the resolvers (`resolveAccent`, `hueToPair`, `scaleMotion`), curated `LOOKS`,
  `defaultDesign`/`normalizeDesign`. Both the themes and the editor import from
  here, so it is the single source of truth.
- [`app/assets/css/main.css`](app/assets/css/main.css) — **all design tokens**
  in Tailwind v4 `@theme` (OKLCH). There is **no `tailwind.config.js`**.
- [`app/themes/_motion/useMotion.ts`](app/themes/_motion/useMotion.ts) — the
  whole motion engine, driven by `data-*` attributes so theme markup and motion
  stay decoupled.
- [`app/stores/editor.ts`](app/stores/editor.ts) — the **one** stateful surface;
  the live preview and design panel just read it.
- `app/themes/editorial/` and `app/themes/minimal/` — the two themes.

### Adding a theme

Add a `ThemeKey`, add a `THEMES` entry (with a `MotionPersonality` + component),
and write a `.vue` that: takes `defineProps<{ story: StoryPage }>()`; renders the
fixed spine (identity/hero → ordered body sections → footer); emits the design
layer as CSS vars on its root (`--accent-a/b`, `--radius-*`, `--vella-type`,
`--vella-space`); annotates markup with `data-*` motion attributes. No other file
changes.

## Bounded customization (the product bet)

Every design control is a **curated, finite choice — never a raw knob**. There
are no free font/color/spacing/motion inputs. Custom accent steers **hue only**;
chroma/lightness stay locked (`hueToPair`), so no hue can go ugly. A new control
must still be a finite table in `registry.ts`, exposed in
`EditorDesignPanel.vue`, consumed as a CSS var in both themes, with a store
setter, and added to `defaultDesign`/`normalizeDesign`. See
[`docs/design-system.md`](docs/design-system.md).

## Motion (see docs/motion.md)

GSAP + ScrollTrigger + SplitText, client-only. Themes never call GSAP — they add
attributes (`data-load`/`data-motion`, `data-reveal`, `data-parallax`,
`data-magnetic`/`data-follow`/`data-drift`) and `initMotion` wires them. Hard
rules already enforced: transforms/opacity/clip-path only; full
`prefers-reduced-motion` handling; halved distances + no pointer effects on
mobile; defer split/load work until `document.fonts.ready`; clean teardown via
`gsap.context().revert()`.

## Gotchas

- **Routing namespace:** public pages live at the root (`/[slug]`), so user
  slugs share the namespace with real routes. Static routes always win;
  `RESERVED_SLUGS`/`TAKEN_SLUGS` in the editor store guard the rest. Don't add a
  top-level route name without reserving it.
- **Clone design with `JSON.parse(JSON.stringify(...))`, not
  `structuredClone(toRaw(...))`** — `toRaw` only unwraps the top level; nested
  reactive proxies survive and make `structuredClone` throw. (`cloneDesign` in
  the store.)
- **Undo/redo is design-only** and snapshots *before* a mutation; the hue slider
  snapshots once on `pointerdown` so a drag is one step. It binds only while the
  Design tab is active (Content tab keeps native text undo).
- The store calls `acceptHMRUpdate` — keep it, or editing the store leaves stale
  instances whose new actions silently no-op.
- The accented headline word is **always the last word** (`splitHeadline`) — no
  separate accent field.

## Conventions (non-negotiable)

- Sentence case everywhere; warm, plain copy; **no em dashes**.
- All colors in **OKLCH**.
- Accent gradient appears in **exactly three places**: the logo, one primary
  action per screen, one accented display word (use the `bg-accent` /
  `text-gradient` utilities only there).
- When billing lands: money stored as integer **sen**; UUID primary keys; single
  `users` table with a role enum.
- Moderation verbs are `take down` / `restore`, identical in UI, API, and the
  status enum.
- Vue 3 `<script setup lang="ts">` throughout; Nuxt 4 `app/` directory; `~/`
  alias for `app/`.
</content>
