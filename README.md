# vella

A beautiful page about you. In ten minutes.

Vella is a story-page maker. Pick a theme, tell your story, hit publish. No design skills, no blank canvas, nothing to break. Every theme is designed and choreographed so the result always looks premium, on any device.

Built by [Axel Nova Ventures](https://axelnovaventures.com). Simple, effortless, human.

---

## What it is

Most site builders hand people a blank canvas and a hundred decisions. Vella does the opposite. Users fill a structured form about who they are, their bio, their journey in chapters, a few photos and links, and a theme dresses it with editorial typography, layered motion, and a colour system that cannot be broken.

One content model, many themes. Switching theme re-renders the same story through a different design and motion personality, instantly.

## Product surfaces

| surface | route | what it does |
|---|---|---|
| landing | `/` | marketing, pricing, auth entry |
| studio | `/dashboard`, `/edit/[id]`, `/account`, `/billing` | the logged-in app: form-based editor with live preview, plan and payments |
| story page | `/u/[slug]`, custom domains | the public product: SSR, animated, shareable |
| admin | `/admin/*` | operator portal: metrics, moderation, payments and settlement |

## Stack

- **Frontend** Nuxt 4 (`app/` directory), Vue 3 `<script setup lang="ts">`, TypeScript
- **Styling** Tailwind v4 CSS-first, OKLCH design tokens in `@theme`, @nuxt/ui primitives restyled to the token system
- **Motion** GSAP + ScrollTrigger (client plugin only), Lenis smooth scroll, data-attribute driven choreography with per-theme motion personalities
- **State** Pinia (editor store drives the live preview)
- **Backend** Nuxt server routes (Nitro), Drizzle ORM, MySQL 8, zod validation
- **Media** Cloudflare R2 via presigned direct uploads, @nuxt/image
- **Payments** Billplz FPX, one-off pro durations, webhook-driven
- **Infra** Docker multi-stage → GHCR → VPS (Ubuntu 24.04), Nginx reverse proxy, Cloudflare, GitHub Actions CI/CD

## Architecture in one minute

The entire product hangs off one rule: **content and theme are fully decoupled.**

A user's page is a single `StoryPage` JSON document (identity, about, chapters, gallery, links). A theme is a set of Vue components that all satisfy the same section contract, plus a token block and a motion personality. The renderer fetches the document, resolves the theme from a registry, and composes five sections. Nothing else moves.

```
app/
├── types/story.ts            # StoryPage contract — the spine of the product
├── themes/
│   ├── registry.ts           # theme catalog
│   ├── _contract/            # section prop contracts every theme satisfies
│   ├── _motion/              # shared GSAP primitives (useMotion, choreography, splitLines)
│   ├── editorial/            # theme = tokens + motion personality + 5 sections
│   └── minimal/
├── pages/
│   ├── index.vue             # landing
│   ├── u/[slug].vue          # public story page (SSR)
│   ├── dashboard/ edit/ account/ billing/
│   └── admin/
├── components/               # shared primitives + editor + studio shell
├── composables/              # usePage (editor store), useTheme
└── server/api/               # pages CRUD, publish, media, billing webhook
```

User customization is a small whitelist by design: theme, accent preset, type mood. No raw font, colour, spacing or motion controls, ever. The constraint is the product.

## Motion system

Themes feel like high-end hand-built sites because motion is a designed system, not scattered tweens:

- four-layer model: atmosphere → structure → content → interactive, animated in that order
- one orchestrated load timeline per page, then quiet scroll reveals (`once: true`)
- everything reads `data-motion` / `data-reveal` / `data-parallax` attributes, so theme markup and motion stay decoupled
- each theme declares a `MotionPersonality` (easings, durations, staggers, distances), same primitives, different temperament
- hard rules: transforms, opacity and clip-path only; `gsap.context` + revert on teardown; `ScrollTrigger.refresh()` after `document.fonts.ready`; full `prefers-reduced-motion` handling; reduced distances and no pointer effects on mobile

## Getting started

```bash
# requirements: node 20+, pnpm, docker

git clone <repo-url> && cd vella
pnpm install

# local services (MySQL + Redis) — all ports bound to 127.0.0.1
docker compose up -d

# env
cp .env.example .env        # DB url, R2 keys, Billplz keys, auth secret

# database
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# run
pnpm dev                    # http://localhost:3000
```

## Scripts

| command | what |
|---|---|
| `pnpm dev` | dev server |
| `pnpm build` | production build |
| `pnpm preview` | preview the production build |
| `pnpm drizzle-kit generate` | generate migrations from schema |
| `pnpm drizzle-kit migrate` | apply migrations |
| `pnpm lint` / `pnpm typecheck` | quality gates (CI runs both) |

## Deployment

GitHub Actions builds a multi-stage Docker image, pushes to GHCR, and the VPS pulls and restarts behind Nginx. Images are never built on the server. Cloudflare proxies the domain (SSL mode Full). Admin routes sit behind Cloudflare Access in addition to server-side role checks.

## Project docs

| doc | purpose |
|---|---|
| `docs/vella-handoff.md` | build handoff: commands, tokens, type scale, motion spec, choreography |
| `docs/vella-modules.md` | per-surface breakdown: components, features, motion budget, build order |
| `docs/design/` | HTML design mockups, the visual source of truth |
| `CLAUDE.md` | non-negotiables for AI-assisted sessions |

## Conventions

- sentence case everywhere, warm plain copy, no em dashes
- money stored as integer sen, UUIDs as primary keys, single `users` table with role enum
- accent gradient appears in exactly three places: logo, one primary action per screen, one accented display word
- moderation verbs are `take down` / `restore`, identical in UI, API and status enum

## Status

Pre-launch, in active development under Axel Nova Ventures.

- [x] design system, mockups for all four surfaces
- [x] StoryPage contract, theme contract, motion spec
- [x] scaffold: tokens, types, registry
- [x] editorial theme + motion port
- [x] minimal theme
- [x] UI for every surface (landing, auth, dashboard, editor, billing, account, admin) on sample data
- [ ] pages CRUD API + publish + slug check (Drizzle + MySQL, zod)
- [ ] auth: magic link + Google, sessions
- [ ] media upload flow (R2 presigned)
- [ ] billing integration (Billplz FPX, webhooks)
- [ ] admin on real data, behind Cloudflare Access

## License

Proprietary. © Axel Nova Ventures. All rights reserved.
