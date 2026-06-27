# vella — documentation

> A beautiful page about you. In ten minutes.

Vella is a story-page maker. A user fills a structured form about who they are,
picks a theme and a few bounded design choices, and publishes a premium,
animated personal page. One content model, many themes — switching theme
re-renders the same story through a different design and motion personality.

This folder is the engineering source of truth. The product README at the repo
root is written for a general audience and is partly **aspirational** — it
describes the full intended stack (database, payments, media, auth). These docs
describe **what is actually built today** and clearly mark what is planned.

## Read in this order

| doc | what it covers |
|---|---|
| [architecture.md](architecture.md) | the one-rule architecture (content/theme decoupling), folder map, routing, rendering pipeline, state, current state vs planned backend |
| [design-system.md](design-system.md) | OKLCH tokens, the bounded design layer, accents, type moods, themes, looks, the "depth inside a fence" philosophy |
| [motion.md](motion.md) | the data-attribute motion system, the four-layer model, load timeline, scroll reveals, motion personalities, the hard rules |
| [data-model.md](data-model.md) | the `StoryPage` contract field by field — the spine the whole product hangs off |

## The thirty-second version

- **One rule:** content and theme are fully decoupled. A user's page is a single
  `StoryPage` JSON document. A theme is a Vue component that renders that
  document and nothing more.
- **Bounded customization:** every design control is a curated choice, never a
  raw knob. Pick any hue but never an ugly one; pick the rhythm but never a
  broken layout. The constraint is the product.
- **Designed motion:** animation is a system (load timeline → quiet scroll
  reveals), driven by `data-*` attributes so theme markup and motion stay
  decoupled. Each theme has its own motion temperament.

## Current state (2026-06)

The product is **UI-complete on sample data**. Every surface — landing, auth,
dashboard, editor with live preview, billing, account, admin — renders against
the in-memory fixtures in [`app/data/sample.ts`](../app/data/sample.ts). The
backend (persistence, auth, media, payments) is **not yet built**: slug checks
and autosave are mocked timers in the Pinia store. See
[architecture.md § Current state](architecture.md#current-state-vs-planned) for
the exact line between real and stubbed.

## Stack at a glance

- **Nuxt 4** (`app/` directory), **Vue 3** `<script setup lang="ts">`, TypeScript
- **Tailwind v4** CSS-first — OKLCH design tokens in `@theme`, no `tailwind.config`
- **GSAP** + ScrollTrigger + SplitText (client only), data-attribute choreography
- **Pinia** — one editor store drives the live preview
- No backend dependencies installed yet (no Drizzle, zod, `@nuxt/ui`,
  `@nuxt/image`, auth, or payment SDKs). These are planned, not present.
</content>
</invoke>
