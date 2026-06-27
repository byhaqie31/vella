# Design system

Vella's promise is **customization that cannot be broken**. Every design control
is a *bounded* choice, not a raw knob: pick any hue but never an ugly one, pick
the rhythm but never a broken layout. The whole bet is **depth inside a fence** —
real expressive reach for the user, with no combination that reads cheap.

Two files hold the system:

- [`app/assets/css/main.css`](../app/assets/css/main.css) — the **tokens**
  (Tailwind v4 `@theme`, OKLCH).
- [`app/themes/registry.ts`](../app/themes/registry.ts) — the **system as data**:
  every control's full allowed range, the resolvers, the curated presets, and
  the one-tap "looks".

Themes and the editor both import from `registry.ts`, so the design system has a
single source of truth and the editor can never expose an option the renderer
can't honor.

## Tokens (`main.css`)

Tailwind v4 is CSS-first: tokens are declared in `@theme {}` and there is **no
`tailwind.config.js`**. Every color is **OKLCH** for perceptually even lightness
and predictable accent math.

### Fonts

| token | stack | role |
|---|---|---|
| `--font-sans` | Inter, system-ui | body, UI |
| `--font-display` | Fraunces, Georgia | headlines, display |
| `--font-mono` | IBM Plex Mono | eyebrows, meta, labels |

Loaded from Google Fonts in [`nuxt.config.ts`](../nuxt.config.ts) (`Fraunces`
variable optical-size, `Inter`, `IBM Plex Mono`).

### Surfaces & text — editorial / app (dark)

| token | value | use |
|---|---|---|
| `--color-ink` | `oklch(0.168 0.018 265)` | base background |
| `--color-ink-deep` | `oklch(0.13 …)` | recessed (preview canvas) |
| `--color-ink-raised` | `oklch(0.205 …)` | raised panels |
| `--color-ink-card` | `oklch(0.225 …)` | cards |
| `--color-ink-field` | `oklch(0.235 …)` | form fields |
| `--color-line` | `oklch(0.3 0.02 265)` | borders |
| `--color-line-soft` | `oklch(0.255 …)` | hairlines |
| `--color-text` | `oklch(0.95 0.01 95)` | primary text |
| `--color-text-dim` | `oklch(0.74 …)` | secondary |
| `--color-text-faint` | `oklch(0.58 …)` | tertiary / eyebrows |

### Minimal theme — light "paper"

`--color-paper`, `--color-paper-line`, `--color-paper-soft`, `--color-paper-ink`,
`--color-paper-dim`, `--color-paper-faint`. Warm off-white (`hue 95`) rather than
pure white, so the light theme reads like paper, not a blank screen.

### Status

| token | value | meaning |
|---|---|---|
| `--color-positive` | `oklch(0.85 0.13 160)` | available, saved, published |
| `--color-warning` | `oklch(0.84 0.13 80)` | draft |
| `--color-danger` | `oklch(0.72 0.16 25)` | destructive, taken slug |

### Radii (defaults; overridden per-page by the `shape` control)

`--radius-field: 9px`, `--radius-card: 18px`.

### Custom utilities

Declared with Tailwind v4 `@utility`:

| utility | what it does |
|---|---|
| `text-gradient` | the accented display word — `linear-gradient(105deg, --accent-a, --accent-b)` clipped to text |
| `bg-accent` | gradient **fill** (120deg) for the logo tile and the one primary action per screen |
| `eyebrow` | IBM Plex Mono, 0.74rem, `letter-spacing: 0.16em` — the mono label role |
| `media-stripes` / `media-stripes-paper` | diagonal striped placeholder for not-yet-uploaded media |

> The accent gradient is allowed in **exactly three places**: the logo, one
> primary action per screen, one accented display word. `text-gradient` and
> `bg-accent` exist to make those three spots trivial and to make over-use
> obvious in review.

## The bounded design layer

Everything a user can change lives in `DesignConfig` (plus the three top-level
choices: `themeKey`, `accent`, `typeMood`). Each control maps to a **finite,
curated table** in `registry.ts`. There are no free font, color, spacing, or
motion inputs anywhere — by design.

| control | type | values | resolver / table |
|---|---|---|---|
| theme | `ThemeKey` | `editorial`, `minimal` | `THEMES` |
| accent | `AccentKey` | `aurora`, `ember`, `jade`, `mono`, `custom` | `ACCENTS` + `resolveAccent` |
| custom hue | `0–360` | any hue (chroma/lightness locked) | `hueToPair` |
| type mood | `TypeMood` | `serif`, `sans`, `mono-accent` | `TYPE_MOODS` |
| type scale | `TypeScale` | `compact 0.92`, `balanced 1`, `generous 1.12` | `TYPE_SCALES` |
| density | `Density` | `snug 0.82`, `balanced 1`, `airy 1.24` | `DENSITIES` |
| shape | `Shape` | `sharp`, `soft`, `round` (field+card radii) | `SHAPES` |
| atmosphere | `Atmosphere` | `clean`, `glow`, `grain`, `vignette` | `ATMOSPHERES` |
| motion level | `MotionLevel` | `calm 0.55`, `balanced 1`, `expressive 1.45` | `MOTION_LEVELS` + `scaleMotion` |
| headline accent | `HeadlineAccent` | `gradient`, `solid`, `underline`, `plain` | `HEADLINE_ACCENTS` |
| sections | `SectionSetting[]` | order + visibility of `about/chapters/gallery/links` | — |

The editor exposes exactly these tables and nothing finer — see
[`EditorDesignPanel.vue`](../app/components/editor/EditorDesignPanel.vue), whose
option arrays mirror the registry one-to-one.

### Accents

`ACCENTS` defines four presets, each as a **two-stop gradient** and each carrying
a dark-surface pair *and* a light-surface pair, so the accented word stays
legible whether it's on `--color-ink` or `--color-paper`:

```ts
ACCENTS = {
  aurora: { onDark: ['…205', '…300'], onLight: ['…205', '…300'] },  // cyan → violet
  ember:  { onDark: ['…55',  '…25' ], onLight: […] },               // amber → red
  jade:   { onDark: ['…175', '…130'], onLight: […] },               // teal → green
  mono:   { onDark: ['…270', '…270'], onLight: […] },               // neutral
}
```

`accentPair(theme, preset)` picks the right pair for the theme's surface.

### The custom hue — why it can't go ugly

The user steers **only the hue**. Chroma and lightness stay pinned to the OKLCH
sweet spot, and the second gradient stop is a fixed analogous step (`+34°`) away.
So any hue lands as a premium two-stop gradient, never mud:

```ts
hueToPair(hue, dark) {
  const h  = ((hue % 360) + 360) % 360
  const h2 = (h + 34) % 360
  return dark
    ? [`oklch(0.81 0.125 ${h})`, `oklch(0.75 0.14 ${h2})`]   // locked L/C
    : [`oklch(0.56 0.12  ${h})`, `oklch(0.52 0.14 ${h2})`]
}
```

`resolveAccent(theme, story)` is the **one** accent resolver — it handles presets
and custom hue, dark and light surfaces. Both themes and the preview call it; no
one computes accent colors by hand.

### Type moods

A mood swaps the entire display trio (font, weight, tracking, and whether the
accented word is italic) as a single unit:

| mood | font | weight | tracking | accent italic |
|---|---|---|---|---|
| `serif` | Fraunces | 400 | `-0.02em` | yes |
| `sans` | Inter | 600 | `-0.04em` | no |
| `mono-accent` | IBM Plex Mono | 500 | `-0.03em` | no |

### Scale & density as multipliers

`typeScale` and `density` are **pure multipliers** emitted as `--vella-type` and
`--vella-space`. Every size and gap in a theme is written as
`calc(base * var(--vella-type|space))`, so the page scales coherently instead of
each element being independently sized. The preview does the same with
`--pv-scale` / `--pv-space`.

### Headline accent treatment

How the last word of the headline is dressed — `gradient` (the text-gradient
wash), `solid` (accent color), `underline` (accent underline), or `plain` (no
accent). The accented word is **automatically the last word of the headline**
(`splitHeadline`), so users never mark up text.

### Atmosphere

The layer behind the content: `clean` (nothing), `glow` (two soft drifting
accent halos), `grain` (fine analog texture), `vignette` (a darkened frame).
Rendered both full-strength in the theme and as a miniature in the design panel
swatches.

### Sections

`design.sections` is an ordered array of `{ id, visible }`. Identity/hero is
always first and not in the array; the four body sections (`about`, `chapters`,
`gallery`, `links`) can be reordered and toggled. A section renders only when
it's both visible **and** has content (`hasContent` in each theme).

## Looks — one-tap curated combinations

A **look** is a named, pre-composed combination (theme + accent + mood + design),
the fastest path to a finished page. Looks **dress, they don't restructure** —
they never touch section order. Defined in `LOOKS`:

`Editorial Night`, `Quiet Paper`, `Warm Ember`, `Mono Brutal`, `Jade Studio`,
`Violet Bold`. Applying one snapshots first (so it's undoable) and assigns
theme/accent/mood/design in one step.

`shuffle()` ("Surprise me") rolls each control from its curated pool
independently — every roll is tasteful by construction.

## Defaults & forward-compat

- `defaultDesign()` — the starting design block (aurora-ish glow, balanced
  everything, soft corners, gradient headline, all four sections visible).
- `normalizeDesign(input?)` — backfills a full design block for any story that
  predates the design layer and repairs a `sections` array missing ids, so old
  documents keep rendering as the schema evolves.

## Adding to the system

- **New accent preset:** add a key to `AccentPreset` and an entry (both
  `onDark`/`onLight` pairs) to `ACCENTS`. The editor swatches and resolver pick
  it up automatically.
- **New design control:** add the field to `DesignConfig`, a values table +
  (if numeric) a multiplier in `registry.ts`, expose it in `EditorDesignPanel`,
  consume it as a CSS var in both themes, and add a setter (with `snapshot()`)
  to the store. Update `defaultDesign` / `normalizeDesign`.
- **New look:** append to `LOOKS`. No code changes elsewhere.

Keep the fence intact: a new control must still be a finite, curated table.
</content>
