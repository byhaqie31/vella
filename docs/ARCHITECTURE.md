# Architecture

The entire product hangs off one rule:

> **Content and theme are fully decoupled.**

A user's page is a single `StoryPage` JSON document (identity, about, chapters,
gallery, links, plus a bounded `design` block). A theme is a Vue component that
satisfies one prop contract — `{ story: StoryPage }` — and renders that document.
The renderer resolves the theme from a registry and hands it the story. Nothing
else moves. Switching theme re-renders the same content through a different
design and motion personality, instantly.

This single decision is what makes "one content model, many themes" cheap, and
it is the constraint every other part of the codebase is built to preserve.

## Folder map

```
app/
├── app.vue                     # <NuxtLayout><NuxtPage/></NuxtLayout>
├── assets/css/main.css         # Tailwind v4 @theme — all design tokens live here
├── types/story.ts              # StoryPage contract — the spine of the product
├── data/sample.ts              # in-memory fixtures (stand-in for the DB)
├── themes/
│   ├── registry.ts             # theme catalog + the entire design system as data
│   ├── _motion/useMotion.ts    # shared GSAP primitives (the motion engine)
│   ├── editorial/EditorialTheme.vue   # dark · serif · expressive
│   └── minimal/MinimalTheme.vue       # light · sans · quiet
├── stores/editor.ts            # Pinia store — the one stateful surface
├── components/
│   ├── AppLogo.vue             # gradient "v" tile + wordmark
│   ├── StatusPill.vue          # tone-coded pill (positive/warning/danger/accent)
│   └── editor/
│       ├── EditorDesignPanel.vue  # the design controls (theme/accent/type/…)
│       └── EditorPreview.vue      # the live preview (a lightweight theme renderer)
├── layouts/
│   ├── default.vue             # passthrough <slot/>
│   └── studio.vue              # logged-in shell: sidebar nav + main
└── pages/
    ├── index.vue               # landing (marketing)
    ├── auth.vue                # sign in / sign up
    ├── [slug].vue              # PUBLIC story page (the product output)
    ├── edit/[id].vue           # the editor (form + live preview)
    ├── dashboard/              # index, account, billing (studio layout)
    └── admin/index.vue         # operator portal
```

There is no `server/` directory yet. All data is the in-memory module
[`app/data/sample.ts`](../app/data/sample.ts).

## The rendering pipeline

The public page, [`pages/[slug].vue`](../app/pages/%5Bslug%5D.vue), is the whole
product in ~30 lines and shows the pipeline end to end:

1. **Resolve the record** by slug (currently from `samplePages`; later a DB
   fetch). 404 via `createError` if not found.
2. **Normalize** the design block (`normalizeDesign`) so any older document
   without the design layer is backfilled forward-compatibly.
3. **Resolve the theme** from the registry: `const theme = THEMES[story.themeKey]`.
4. **Bind motion** to a root element: `useMotion(rootRef, () => scaleMotion(theme.motion, story.design.motionLevel))`.
5. **Render** the theme dynamically: `<component :is="theme.component" :story="story" />`.

```
slug ──► record (sample.ts) ──► normalizeDesign(design)
                                      │
       THEMES[themeKey] ──► theme ────┤
                                      ▼
        <component :is="theme.component" :story="story" />
                                      ▲
       useMotion(root, scaleMotion(theme.motion, motionLevel))
```

That is the entire public surface. Everything else (the editor, the dashboard)
exists to produce and manage the `StoryPage` document that this pipeline renders.

## The theme contract

Every theme is a single `.vue` component that:

- accepts exactly `defineProps<{ story: StoryPage }>()`,
- renders a fixed spine: **identity/hero → ordered body sections → footer**,
- reads the design layer and emits it as cascading CSS variables on its root,
- annotates its markup with `data-*` motion attributes (see [MOTION.md](MOTION.md)),
- satisfies the same section set: `about`, `chapters`, `gallery`, `links`.

A theme **never** owns content and **never** invents new sections. It owns
*appearance and temperament*: surface (dark vs light paper), default type mood,
and a `MotionPersonality`. The two themes today:

| theme | surface | default mood | motion |
|---|---|---|---|
| `editorial` | dark (`--color-ink`) | serif (Fraunces) | expressive (longer durations, larger distances, deeper parallax) |
| `minimal` | light (`--color-paper`) | sans (Inter) | quiet (short durations, small distances, whisper parallax) |

Both are registered in [`themes/registry.ts`](../app/themes/registry.ts) under
`THEMES`, keyed by `ThemeKey` (`'editorial' | 'minimal'`). Adding a theme means:
add a `ThemeKey`, add an entry to `THEMES` with a `MotionPersonality` and
`component`, and write a component that honors the contract above. No other file
needs to change.

### How the design layer reaches a theme

The `design` block on the story is pure data. Each theme converts it into CSS
custom properties on its root element, and the markup reads only those
variables. From [`EditorialTheme.vue`](../app/themes/editorial/EditorialTheme.vue):

```ts
const rootStyle = computed(() => ({
  '--accent-a': accent.value[0],
  '--accent-b': accent.value[1],
  '--radius-card': SHAPES[d.value.shape].card,
  '--radius-field': SHAPES[d.value.shape].field,
  '--vella-type': String(TYPE_SCALES[d.value.typeScale]),   // type-scale multiplier
  '--vella-space': String(DENSITIES[d.value.density]),       // vertical-rhythm multiplier
}))
```

Sizes and gaps are then written as `calc(... * var(--vella-type))` /
`calc(... * var(--vella-space))`, so the whole page breathes with the user's
choices and stays in proportion at any combination. See
[DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) for the full token and control catalog.

## Routing

Nuxt file-based routing. The crucial decision: **public story pages live at the
root** (`/[slug]`), so user slugs share the namespace with real routes.

- A **static route always wins** over the dynamic `[slug]`, so names like
  `dashboard`, `edit`, `admin`, `auth` can never be claimed by a user.
- The editor store enforces this with a `RESERVED_SLUGS` list
  (`admin, auth, dashboard, edit, www, api, u`) in addition to
  `TAKEN_SLUGS` (already-registered handles).

| route | file | layout | purpose |
|---|---|---|---|
| `/` | `pages/index.vue` | default | marketing landing |
| `/auth` | `pages/auth.vue` | default | sign in / sign up |
| `/[slug]` | `pages/[slug].vue` | default | **public story page** (the product) |
| `/edit/[id]` | `pages/edit/[id].vue` | (own full-screen markup) | the editor |
| `/dashboard` | `pages/dashboard/index.vue` | studio | page list |
| `/dashboard/account` | `pages/dashboard/account.vue` | studio | account settings |
| `/dashboard/billing` | `pages/dashboard/billing.vue` | studio | plan & payments |
| `/admin` | `pages/admin/index.vue` | default | operator portal |

The `studio` layout (sidebar + main) is opted into with
`definePageMeta({ layout: 'studio' })`. The editor and the themes render their
own full-screen chrome on the passthrough `default` layout.

## State

There is exactly **one** stateful surface: the editor.
[`stores/editor.ts`](../app/stores/editor.ts) is a Pinia setup-store that holds
the working `StoryPage`; the live preview ([`EditorPreview.vue`](../app/components/editor/EditorPreview.vue))
and the design panel ([`EditorDesignPanel.vue`](../app/components/editor/EditorDesignPanel.vue))
just read it via `storeToRefs`. Everything reactive flows from here.

Notable mechanics in the store:

- **Design-only undo/redo.** Content fields autosave, so history is reserved for
  the exploratory design surface. `snapshot()` is called *before* a mutation;
  the hue slider calls it once on `pointerdown` so a whole drag collapses to a
  single reversible step. Undo/redo only bind while the Design tab is active, so
  the Content tab keeps native text undo.
- **Curated randomness.** `shuffle()` ("Surprise me") and `applyLook()` pick
  only from already-curated pools, so every result is tasteful by construction —
  there is no combination that reads cheap.
- **Deep clone via JSON, deliberately.** `cloneDesign` uses
  `JSON.parse(JSON.stringify(d))` — *not* `structuredClone(toRaw(...))`, because
  `toRaw` only unwraps the top level and nested reactive proxies (the `sections`
  array) survive and make `structuredClone` throw.
- **HMR-safe.** The file calls `acceptHMRUpdate` so editing the store in dev
  doesn't leave an open editor tab holding a stale instance whose new actions
  silently no-op.

## Current state vs planned

This is the most important section for anyone picking up the code. The README at
the repo root describes the **intended** product; here is the **actual** line.

### Built (and real)

- All four product surfaces rendered as polished UI: landing, auth, dashboard,
  editor (with two-tab Write/Design + live preview + device toggle), billing,
  account, admin.
- The full design system as data (`registry.ts`) and tokens (`main.css`).
- The `StoryPage` contract and both themes, fully honoring it.
- The complete motion engine (`useMotion.ts`) with reduced-motion and mobile
  handling.
- The editor store with working undo/redo, looks, shuffle, section
  reorder/visibility.

### Stubbed / mocked

- **Persistence:** none. Pages are the in-memory fixtures in `sample.ts`
  (`aliaStory`, `hurufStory`, `samplePages`).
- **Autosave:** `store.touch()` is a pair of `setTimeout`s that flip a
  "Saving… → Saved" indicator. No PATCH is sent.
- **Slug availability:** `setSlug()` is a 500ms mocked check against the
  `TAKEN_SLUGS` / `RESERVED_SLUGS` arrays.
- **Auth:** `logout()` just navigates to `/auth`. No sessions, no magic link,
  no OAuth.
- **Publish:** `togglePublish()` flips a boolean on the in-memory story; draft
  pages stay viewable by slug because there is no server-side gate yet.
- **Media:** "upload" appends a placeholder gallery slot; there is no R2 flow.
- **Billing / admin data:** rendered against fixtures.

### Planned (named in README, not yet present)

Nuxt server routes (Nitro), Drizzle ORM + MySQL 8, zod validation,
Cloudflare R2 presigned uploads, `@nuxt/image`, Billplz FPX payments + webhooks,
auth (magic link + Google), `@nuxt/ui` primitives, Lenis smooth scroll,
Docker/GHCR/VPS deploy, Cloudflare Access on admin. None of these packages are
in `package.json` today — treat the README's "Stack" and "Deployment" sections
as the roadmap.

When wiring the backend, the natural seams are already cut: `sample.ts` is the
shape the `pages` table must return, `normalizeDesign` is the forward-compat
backfill, and the store's `touch`/`setSlug`/`togglePublish` are the exact
functions that should become real API calls.

## Conventions that affect architecture

- **Money** (when billing lands) is stored as integer **sen**.
- **UUIDs** as primary keys; a single `users` table with a role enum.
- The **accent gradient appears in exactly three places**: the logo tile, one
  primary action per screen, and one accented display word — enforced by using
  the `bg-accent` / `text-gradient` utilities only in those spots.
- **Moderation verbs** are `take down` / `restore`, identical across UI, API,
  and the status enum.
- Sentence case everywhere; warm, plain copy; no em dashes.
</content>
