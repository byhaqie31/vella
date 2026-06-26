import type { Component } from 'vue'
import type {
  AccentKey,
  AccentPreset,
  Atmosphere,
  Density,
  DesignConfig,
  HeadlineAccent,
  MotionLevel,
  MotionPersonality,
  Shape,
  StoryPage,
  ThemeKey,
  TypeMood,
  TypeScale,
} from '~/types/story'
import EditorialTheme from '~/themes/editorial/EditorialTheme.vue'
import MinimalTheme from '~/themes/minimal/MinimalTheme.vue'

/** Accent presets (gradient, 105deg). Each preset carries a dark-surface and a
 *  light-surface pair so the accented word stays legible on the paper theme. */
export const ACCENTS: Record<AccentPreset, { onDark: [string, string]; onLight: [string, string] }> = {
  aurora: {
    onDark: ['oklch(0.82 0.10 205)', 'oklch(0.74 0.13 300)'],
    onLight: ['oklch(0.55 0.10 205)', 'oklch(0.52 0.13 300)'],
  },
  ember: {
    onDark: ['oklch(0.78 0.13 55)', 'oklch(0.70 0.15 25)'],
    onLight: ['oklch(0.55 0.13 55)', 'oklch(0.50 0.15 25)'],
  },
  jade: {
    onDark: ['oklch(0.78 0.12 175)', 'oklch(0.80 0.12 130)'],
    onLight: ['oklch(0.58 0.11 165)', 'oklch(0.62 0.11 120)'],
  },
  mono: {
    onDark: ['oklch(0.80 0.01 270)', 'oklch(0.60 0.01 270)'],
    onLight: ['oklch(0.50 0.01 270)', 'oklch(0.35 0.01 270)'],
  },
}

/** Type moods swap the entire display trio as a unit. */
export const TYPE_MOODS: Record<
  TypeMood,
  { font: string; weight: number; tracking: string; accentItalic: boolean }
> = {
  serif: { font: "'Fraunces', Georgia, serif", weight: 400, tracking: '-0.02em', accentItalic: true },
  sans: { font: "'Inter', system-ui, sans-serif", weight: 600, tracking: '-0.04em', accentItalic: false },
  'mono-accent': { font: "'IBM Plex Mono', monospace", weight: 500, tracking: '-0.03em', accentItalic: false },
}

export interface ThemeDef {
  key: ThemeKey
  label: string
  tagline: string
  /** Whether the theme renders on a dark surface (drives accent pair choice). */
  dark: boolean
  /** Default type mood when the user hasn't picked one. */
  defaultMood: TypeMood
  motion: MotionPersonality
  component: Component
}

export const THEMES: Record<ThemeKey, ThemeDef> = {
  editorial: {
    key: 'editorial',
    label: 'Editorial',
    tagline: 'dark · serif · expressive motion',
    dark: true,
    defaultMood: 'serif',
    motion: {
      ease: 'power3.out',
      easeExpressive: 'expo.out',
      duration: { fast: 0.4, base: 0.9, slow: 1.4 },
      stagger: { tight: 0.05, base: 0.09, loose: 0.16 },
      distance: { sm: 18, md: 40, lg: 90 },
      parallax: { subtle: 0.08, deep: 0.22 },
    },
    component: EditorialTheme,
  },
  minimal: {
    key: 'minimal',
    label: 'Minimal',
    tagline: 'light · sans · quiet motion',
    dark: false,
    defaultMood: 'sans',
    motion: {
      ease: 'power2.out',
      easeExpressive: 'power3.out',
      duration: { fast: 0.25, base: 0.55, slow: 0.85 },
      stagger: { tight: 0.03, base: 0.06, loose: 0.1 },
      distance: { sm: 10, md: 22, lg: 44 },
      parallax: { subtle: 0.03, deep: 0.08 },
    },
    component: MinimalTheme,
  },
}

export function accentPair(theme: ThemeKey, accent: AccentPreset): [string, string] {
  return THEMES[theme].dark ? ACCENTS[accent].onDark : ACCENTS[accent].onLight
}

/* ── The curated design system ───────────────────────────────────────────────
   Every map below is the full allowed range of a control. The editor exposes
   these and nothing finer, so a user has real expressive reach without a single
   combination that reads cheap. This is the whole bet: depth inside a fence. */

/** Custom accent. The user steers only the hue; chroma and lightness stay
 *  pinned to the OKLCH sweet spot, and the second stop is a fixed analogous
 *  step away — so any hue lands as a premium two-stop gradient, never mud. */
export function hueToPair(hue: number, dark: boolean): [string, string] {
  const h = ((hue % 360) + 360) % 360
  const h2 = (h + 34) % 360
  return dark
    ? [`oklch(0.81 0.125 ${h})`, `oklch(0.75 0.14 ${h2})`]
    : [`oklch(0.56 0.12 ${h})`, `oklch(0.52 0.14 ${h2})`]
}

/** The one accent resolver — presets and custom hue, dark and light surfaces. */
export function resolveAccent(theme: ThemeKey, story: StoryPage): [string, string] {
  if (story.accent === 'custom') return hueToPair(story.design.customHue, THEMES[theme].dark)
  return accentPair(theme, story.accent)
}

/** Display-type size multiplier. */
export const TYPE_SCALES: Record<TypeScale, number> = {
  compact: 0.92,
  balanced: 1,
  generous: 1.12,
}

/** Vertical rhythm multiplier — gaps and section padding scale together. */
export const DENSITIES: Record<Density, number> = {
  snug: 0.82,
  balanced: 1,
  airy: 1.24,
}

/** Corner language, as field + card radii (consumed via --radius-* overrides). */
export const SHAPES: Record<Shape, { field: string; card: string }> = {
  sharp: { field: '3px', card: '5px' },
  soft: { field: '9px', card: '18px' },
  round: { field: '15px', card: '28px' },
}

export const ATMOSPHERES: Record<Atmosphere, { label: string; hint: string }> = {
  clean: { label: 'Clean', hint: 'nothing behind the words' },
  glow: { label: 'Aurora', hint: 'two soft accent halos' },
  grain: { label: 'Grain', hint: 'fine analog texture' },
  vignette: { label: 'Vignette', hint: 'a quiet darkened frame' },
}

/** Motion temperament — scales distance, stagger and parallax of the page's
 *  motion personality. Durations stay; only amplitude moves. */
export const MOTION_LEVELS: Record<MotionLevel, { label: string; k: number }> = {
  calm: { label: 'Calm', k: 0.55 },
  balanced: { label: 'Balanced', k: 1 },
  expressive: { label: 'Expressive', k: 1.45 },
}

export function scaleMotion(p: MotionPersonality, level: MotionLevel): MotionPersonality {
  const k = MOTION_LEVELS[level].k
  return {
    ease: p.ease,
    easeExpressive: p.easeExpressive,
    duration: p.duration,
    stagger: { tight: p.stagger.tight * k, base: p.stagger.base * k, loose: p.stagger.loose * k },
    distance: { sm: p.distance.sm * k, md: p.distance.md * k, lg: p.distance.lg * k },
    parallax: { subtle: p.parallax.subtle * k, deep: p.parallax.deep * k },
  }
}

export const HEADLINE_ACCENTS: Record<HeadlineAccent, string> = {
  gradient: 'gradient wash',
  solid: 'solid accent',
  underline: 'accent underline',
  plain: 'no accent',
}

/** A "look" is a one-tap curated combination — the fastest path to a finished
 *  page. Looks never touch section order; they dress, they don't restructure. */
export interface Look {
  key: string
  label: string
  hint: string
  themeKey: ThemeKey
  accent: AccentKey
  customHue?: number
  typeMood: TypeMood
  design: Omit<DesignConfig, 'customHue' | 'sections'>
}

export const LOOKS: Look[] = [
  {
    key: 'editorial-night',
    label: 'Editorial Night',
    hint: 'dark · serif · expressive',
    themeKey: 'editorial',
    accent: 'aurora',
    typeMood: 'serif',
    design: { typeScale: 'balanced', density: 'balanced', shape: 'soft', atmosphere: 'glow', motionLevel: 'expressive', headlineAccent: 'gradient' },
  },
  {
    key: 'quiet-paper',
    label: 'Quiet Paper',
    hint: 'light · sans · calm',
    themeKey: 'minimal',
    accent: 'mono',
    typeMood: 'sans',
    design: { typeScale: 'generous', density: 'airy', shape: 'soft', atmosphere: 'clean', motionLevel: 'calm', headlineAccent: 'solid' },
  },
  {
    key: 'warm-ember',
    label: 'Warm Ember',
    hint: 'dark · serif · round',
    themeKey: 'editorial',
    accent: 'ember',
    typeMood: 'serif',
    design: { typeScale: 'balanced', density: 'balanced', shape: 'round', atmosphere: 'glow', motionLevel: 'expressive', headlineAccent: 'gradient' },
  },
  {
    key: 'mono-brutal',
    label: 'Mono Brutal',
    hint: 'dark · mono · sharp',
    themeKey: 'editorial',
    accent: 'mono',
    typeMood: 'mono-accent',
    design: { typeScale: 'compact', density: 'snug', shape: 'sharp', atmosphere: 'grain', motionLevel: 'balanced', headlineAccent: 'underline' },
  },
  {
    key: 'jade-studio',
    label: 'Jade Studio',
    hint: 'light · sans · vignette',
    themeKey: 'minimal',
    accent: 'jade',
    typeMood: 'sans',
    design: { typeScale: 'balanced', density: 'balanced', shape: 'soft', atmosphere: 'vignette', motionLevel: 'balanced', headlineAccent: 'gradient' },
  },
  {
    key: 'violet-bold',
    label: 'Violet Bold',
    hint: 'dark · sans · generous',
    themeKey: 'editorial',
    accent: 'custom',
    customHue: 295,
    typeMood: 'sans',
    design: { typeScale: 'generous', density: 'airy', shape: 'round', atmosphere: 'glow', motionLevel: 'expressive', headlineAccent: 'gradient' },
  },
]

export function defaultDesign(): DesignConfig {
  return {
    customHue: 265,
    typeScale: 'balanced',
    density: 'balanced',
    shape: 'soft',
    atmosphere: 'glow',
    motionLevel: 'balanced',
    headlineAccent: 'gradient',
    sections: [
      { id: 'about', visible: true },
      { id: 'chapters', visible: true },
      { id: 'gallery', visible: true },
      { id: 'links', visible: true },
    ],
  }
}

/** Backfill a design block for any story that predates the design layer, and
 *  repair a sections array that's missing ids (forward-compatible). */
export function normalizeDesign(input?: Partial<DesignConfig>): DesignConfig {
  const base = defaultDesign()
  if (!input) return base
  const byId = new Map((input.sections ?? []).map((s) => [s.id, s]))
  const sections = base.sections.map((s) => byId.get(s.id) ?? s)
  return { ...base, ...input, sections }
}

/** The accented display word is automatically the last word of the headline. */
export function splitHeadline(headline: string): { head: string; accent: string } {
  const words = headline.trim().split(/\s+/)
  if (words.length < 2) return { head: headline.trim(), accent: '' }
  return { head: words.slice(0, -1).join(' '), accent: words[words.length - 1]! }
}

export function linkHost(url: string): string {
  try {
    const u = new URL(url)
    return u.host || url
  } catch {
    return url.replace(/^(https?:\/\/|mailto:)/, '')
  }
}
