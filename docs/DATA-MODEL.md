# Data model — the `StoryPage` contract

`StoryPage` is the spine of the product. It is the single JSON document that a
user's page *is*, the prop every theme receives, and the shape the future
`pages.content` column must store. Content and theme are fully decoupled, so this
contract is the only thing both sides agree on.

Defined in [`app/types/story.ts`](../app/types/story.ts). Fixtures that exercise
it live in [`app/data/sample.ts`](../app/data/sample.ts).

## Top-level shape

```ts
interface StoryPage {
  themeKey: ThemeKey        // 'editorial' | 'minimal'
  accent: AccentKey         // 'aurora' | 'ember' | 'jade' | 'mono' | 'custom'
  typeMood: TypeMood        // 'serif' | 'sans' | 'mono-accent'
  design: DesignConfig      // the bounded design layer (see below)
  identity: Identity        // hero / who you are (always rendered first)
  about: About              // pull-quote + longer story
  chapters: Chapter[]       // timeline entries
  gallery: GalleryItem[]    // media slots
  links: StoryLink[]        // outbound links
  isPublished: boolean
}
```

The three top-level enums (`themeKey`, `accent`, `typeMood`) plus `design` are
the customization surface; the rest is content. See
[DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) for how the design fields resolve to CSS,
and [ARCHITECTURE.md](ARCHITECTURE.md) for how the document is rendered.

## `DesignConfig` — the bounded design layer

```ts
interface DesignConfig {
  customHue: number              // 0–360; used only when accent === 'custom' (L/C locked)
  typeScale: TypeScale           // 'compact' | 'balanced' | 'generous'
  density: Density               // 'snug' | 'balanced' | 'airy'   (vertical rhythm)
  shape: Shape                   // 'sharp' | 'soft' | 'round'     (corner radii)
  atmosphere: Atmosphere         // 'clean' | 'glow' | 'grain' | 'vignette'
  motionLevel: MotionLevel       // 'calm' | 'balanced' | 'expressive' (amplitude)
  headlineAccent: HeadlineAccent // 'gradient' | 'solid' | 'underline' | 'plain'
  sections: SectionSetting[]     // body section order + visibility
}

interface SectionSetting { id: SectionId; visible: boolean }   // SectionId: about|chapters|gallery|links
```

Every field is a bounded enum or a single locked number — never a raw style
value. `defaultDesign()` provides the starting block; `normalizeDesign()`
backfills it for older documents (forward-compatible).

## Content sections

### `Identity` (the hero — always first, never in `sections`)

```ts
interface Identity {
  name: string
  role: string
  location: string
  headline: string           // the big display line; its LAST word is auto-accented
  intro: string              // paragraph under the headline
  meta: string[]             // mono meta row, e.g. "studio practice since 2017"
  availability?: string      // optional, rendered in the positive color
}
```

The eyebrow above the headline is composed as `name · role · location`. The
headline's accented word is derived by `splitHeadline()` — users never mark up
text; the last word is always the accent.

### `About`

```ts
interface About {
  quote: string              // the pull-quote that sums you up
  body: string               // the longer story behind it
}
```

### `Chapter[]`

```ts
interface Chapter { period: string; title: string; body: string }
```

Rendered as a timeline (period column + title/body). The editor starts a blank
story with one empty chapter.

### `GalleryItem[]`

```ts
interface GalleryItem {
  slot: string               // placeholder label until real media lands, e.g. "specimen poster"
  caption: string
  ratio?: string             // CSS aspect-ratio, e.g. "4 / 5"
  dir?: 1 | -1               // parallax direction
  offset?: number            // editorial column offset in px
}
```

Until the media pipeline exists, gallery items render as striped placeholders
(`media-stripes`) labeled with `slot`.

### `StoryLink[]`

```ts
interface StoryLink { label: string; url: string }
```

`linkHost(url)` derives the displayed host (with a `mailto:`/protocol fallback).

## `MotionPersonality` (theme-level, not per-page)

Lives on each theme in the registry, not on the story — but it's part of the
type module because it travels with rendering:

```ts
interface MotionPersonality {
  ease: string; easeExpressive: string
  duration: { fast; base; slow }
  stagger:  { tight; base; loose }
  distance: { sm; md; lg }
  parallax: { subtle; deep }
}
```

See [MOTION.md](MOTION.md) for how `scaleMotion(personality, motionLevel)`
combines the theme's temperament with the user's motion level.

## Persistence shape (today vs planned)

Today the "table" is `samplePages: PageRecord[]` in `sample.ts`:

```ts
interface PageRecord {
  id: string                 // 'alia', 'huruf'
  slug: string               // public address segment (/[slug])
  story: StoryPage
  views: string              // display string (stub)
  updated: string            // display string (stub)
}
```

When the backend lands, the intended persistence is a `pages` row whose
`content` column holds the `StoryPage` JSON, keyed by UUID, owned by a `users`
row (role enum). `normalizeDesign` is the read-path backfill so older rows keep
rendering as the contract evolves. Money (billing) is stored as integer **sen**,
never floats.

## Invariants worth preserving

- The accented headline word is **always** the last word — don't add a separate
  "accent word" field; keep `splitHeadline` as the single rule.
- `design.sections` covers only the four body sections; **identity is always
  first** and is not in the array.
- A section renders only when **visible AND has content** (`hasContent` per
  theme) — empty sections never leave a gap.
- Any new persisted field needs a default in `defaultDesign()` / safe handling
  in `normalizeDesign()` so existing documents keep working.
</content>
