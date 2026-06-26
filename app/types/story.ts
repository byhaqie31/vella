/** The StoryPage contract — the spine of the product.
 *  Content and theme are fully decoupled: a theme renders this document,
 *  nothing more. Persisted as the `content` JSON column of `pages`. */

export type ThemeKey = 'editorial' | 'minimal'
/** The named accent presets. `custom` resolves from design.customHue instead. */
export type AccentPreset = 'aurora' | 'ember' | 'jade' | 'mono'
export type AccentKey = AccentPreset | 'custom'
export type TypeMood = 'serif' | 'sans' | 'mono-accent'

/* ── The design layer ───────────────────────────────────────────────────────
   Vella's promise is customization that cannot be broken. Every control below
   is a *bounded* choice, not a raw knob: pick any hue but never an ugly one,
   pick the rhythm but never a broken layout. The design object travels with
   the story so the published themes render exactly what the editor previews. */

export type TypeScale = 'compact' | 'balanced' | 'generous'
export type Density = 'snug' | 'balanced' | 'airy'
export type Shape = 'sharp' | 'soft' | 'round'
export type Atmosphere = 'clean' | 'glow' | 'grain' | 'vignette'
export type MotionLevel = 'calm' | 'balanced' | 'expressive'
/** How the accented display word is treated. */
export type HeadlineAccent = 'gradient' | 'solid' | 'underline' | 'plain'
export type SectionId = 'about' | 'chapters' | 'gallery' | 'links'

/** One movable section in the page spine — order is the array order. */
export interface SectionSetting {
  id: SectionId
  visible: boolean
}

export interface DesignConfig {
  /** 0–360, the hue used when accent === 'custom'. Chroma/lightness stay locked. */
  customHue: number
  typeScale: TypeScale
  density: Density
  shape: Shape
  atmosphere: Atmosphere
  motionLevel: MotionLevel
  headlineAccent: HeadlineAccent
  /** Section order + visibility for the body (identity/hero is always first). */
  sections: SectionSetting[]
}

export interface Identity {
  name: string
  role: string
  location: string
  /** The big display line. The last word is automatically the accented word. */
  headline: string
  /** The paragraph under the headline. */
  intro: string
  /** Mono meta row under the intro, e.g. "studio practice since 2017". */
  meta: string[]
  /** Optional highlighted meta item, rendered in the positive color. */
  availability?: string
}

export interface About {
  /** The pull-quote — the line that sums you up. */
  quote: string
  /** The longer story behind it. */
  body: string
}

export interface Chapter {
  period: string
  title: string
  body: string
}

export interface GalleryItem {
  /** What belongs in this slot, e.g. "specimen poster". Placeholder label until real media lands. */
  slot: string
  caption: string
  ratio?: string
  /** Parallax direction, 1 or -1. */
  dir?: 1 | -1
  /** Editorial column offset in px. */
  offset?: number
}

export interface StoryLink {
  label: string
  url: string
}

export interface StoryPage {
  themeKey: ThemeKey
  accent: AccentKey
  typeMood: TypeMood
  /** The bounded design layer — see DesignConfig. */
  design: DesignConfig
  identity: Identity
  about: About
  chapters: Chapter[]
  gallery: GalleryItem[]
  links: StoryLink[]
  isPublished: boolean
}

/** Per-theme motion temperament — same primitives, different feel. */
export interface MotionPersonality {
  ease: string
  easeExpressive: string
  duration: { fast: number; base: number; slow: number }
  stagger: { tight: number; base: number; loose: number }
  distance: { sm: number; md: number; lg: number }
  parallax: { subtle: number; deep: number }
}
