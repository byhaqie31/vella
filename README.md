# vella

A beautiful page about you. In ten minutes.

Vella is a story-page maker. Pick a theme, tell your story, hit publish. No design
skills, no blank canvas, nothing to break. Every theme is designed and
choreographed so the result always looks premium, on any device.

Built by [Axel Nova Ventures](https://axelnovaventures.com). Simple, effortless,
human.

---

## What vella is

Most site builders hand people a blank canvas and a hundred decisions. Vella does
the opposite. A user fills a structured form about who they are, their bio, their
journey in chapters, a few photos and links, and a theme dresses it with
editorial typography, layered motion, and a colour system that cannot be broken.

One content model, many themes. Switching theme re-renders the same story through
a different design and motion personality, instantly.

## What vella is right now

This repo is currently a **UI-complete frontend running on sample data**. The
visual product is real and working end to end: the landing page, the editor with
its two-tab Write / Design flow and live preview, the dashboard, billing,
account, and admin surfaces all render, animate, and respond to every design
control.

The **backend does not exist yet**. There is no database, no auth, no payments,
no media uploads, and no server API. Every page is read from the in-memory
fixtures in [`app/data/sample.ts`](app/data/sample.ts), and a handful of editor
actions are deliberate stand-ins until the real services land:

| behaviour | today | becomes |
|---|---|---|
| pages | `samplePages` fixture (Alia, Studio Huruf) | a `pages` table |
| autosave | a `setTimeout` that flips "Saving… → Saved" | a debounced PATCH |
| slug availability | a 500ms mocked check against a name list | a server lookup |
| publish | flips a boolean on the in-memory story | a server-side gate |
| auth / logout | just navigates to `/auth` | sessions (magic link + Google) |
| media "upload" | appends a placeholder gallery slot | R2 presigned uploads |

If you are reading the code, trust `package.json` and `app/` over any stack list:
the libraries below under "Planned" are **not installed**.

## The product in one minute

The whole thing hangs off one rule: **content and theme are fully decoupled.**

A user's page is a single `StoryPage` JSON document (identity, about, chapters,
gallery, links, plus a bounded `design` block). A theme is a set of Vue
components that all satisfy the same prop contract, plus a token block and a
motion personality. The public renderer fetches the document, resolves the theme
from a registry, and composes the page. Nothing else moves.

```
app/
├── types/story.ts            # StoryPage contract, the spine of the product
├── data/sample.ts            # in-memory fixtures (stand-in for the database)
├── themes/
│   ├── registry.ts           # theme catalog + the whole design system as data
│   ├── _motion/useMotion.ts  # the GSAP motion engine (data-attribute driven)
│   ├── editorial/            # dark · serif · expressive
│   └── minimal/              # light · sans · quiet
├── pages/
│   ├── index.vue             # landing
│   ├── [slug].vue            # public story page (the product output)
│   ├── auth.vue
│   ├── edit/[id].vue         # the editor
│   ├── dashboard/            # index, account, billing
│   └── admin/
├── components/               # shared primitives + the editor panel & preview
└── stores/editor.ts          # the one stateful surface
```

User customization is a small whitelist by design: theme, accent preset or a
single custom hue, type mood, type scale, density, shape, atmosphere, motion
level, headline accent, and section order. No raw font, colour, spacing, or
motion controls, ever. The constraint is the product.

## Stack

What is actually installed today:

- **Frontend** Nuxt 4 (`app/` directory), Vue 3 `<script setup lang="ts">`,
  TypeScript
- **Styling** Tailwind v4, CSS-first. OKLCH design tokens in `@theme`, no
  `tailwind.config.js`
- **Motion** GSAP + ScrollTrigger + SplitText (client only), data-attribute
  driven choreography with per-theme motion personalities
- **State** Pinia (one editor store drives the live preview)

**Planned, not yet present** (do not assume these exist): Nuxt server routes
(Nitro), Drizzle ORM + MySQL 8, zod validation, Cloudflare R2 media,
`@nuxt/image`, Billplz FPX payments + webhooks, magic-link / Google auth,
`@nuxt/ui` primitives, Lenis smooth scroll, and a Docker / GHCR / VPS deploy
behind Nginx and Cloudflare.

## Roadmap

Done:

- [x] design system + mockups for all four surfaces
- [x] `StoryPage` contract, theme contract, motion spec
- [x] scaffold: tokens, types, registry
- [x] editorial theme + motion engine
- [x] minimal theme
- [x] full UI for every surface (landing, auth, dashboard, editor, billing,
      account, admin) on sample data

Next, roughly in order:

1. **Persistence.** Nuxt server routes + Drizzle + MySQL, zod-validated. A
   `pages` CRUD API, publish, and a real slug-availability check. The seam is
   already cut: `sample.ts` is the shape the table must return, and the store's
   `touch` / `setSlug` / `togglePublish` are the functions that become API calls.
2. **Auth.** Magic link + Google, sessions, owner-scoped pages, a server-side
   publish gate so drafts stop being publicly viewable.
3. **Media.** Cloudflare R2 presigned direct uploads, client-side resize,
   `@nuxt/image`, replacing the striped placeholders.
4. **Billing.** Billplz FPX, one-off pro durations, webhook-driven. Money stored
   as integer sen.
5. **Admin on real data**, behind Cloudflare Access in addition to server-side
   role checks.
6. **Deploy.** Multi-stage Docker image to GHCR, pulled and restarted on the VPS
   behind Nginx, Cloudflare in front. Images never built on the server.

## Getting started

Requirements: Node 20+ (developed on 25). The repo uses **npm** (there is a
`package-lock.json`). No database or services are needed yet, everything runs on
in-memory data.

```bash
git clone <repo-url> && cd vella
npm install
npm run dev          # http://localhost:3000
```

Useful entry points while exploring: `/` (landing), `/edit/alia` (the editor on
sample data), `/alia` (a published story page), `/dashboard`, `/admin`.

## Scripts

| command | what |
|---|---|
| `npm run dev` | dev server |
| `npm run build` | production build |
| `npm run preview` | preview the production build |
| `npm run typecheck` | `nuxt typecheck` (vue-tsc), the current quality gate |

There is no lint config or test suite yet. `typecheck` is the gate to run before
calling a change done.

## Docs

| doc | purpose |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | the one-rule architecture, rendering pipeline, routing, state, current vs planned |
| [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) | OKLCH tokens, the bounded design layer, accents, type moods, themes, looks |
| [docs/MOTION.md](docs/MOTION.md) | the data-attribute motion system, timelines, personalities, hard rules |
| [docs/DATA-MODEL.md](docs/DATA-MODEL.md) | the `StoryPage` contract, field by field |
| [CLAUDE.md](CLAUDE.md) | non-negotiables for AI-assisted sessions |

## Conventions

- sentence case everywhere, warm plain copy, no em dashes
- all colours in OKLCH
- the accent gradient appears in exactly three places: the logo, one primary
  action per screen, one accented display word
- (once the backend lands) money stored as integer sen, UUID primary keys, a
  single `users` table with a role enum
- moderation verbs are `take down` / `restore`, identical in UI, API, and the
  status enum

## Status

Pre-launch, in active development under Axel Nova Ventures. Frontend complete on
sample data, backend not yet started (see Roadmap).

## License

Proprietary. © Axel Nova Ventures. All rights reserved.
</content>
