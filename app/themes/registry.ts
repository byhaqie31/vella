import type { Component } from 'vue'
import type { AccentKey, MotionPersonality, ThemeKey, TypeMood } from '~/types/story'
import EditorialTheme from '~/themes/editorial/EditorialTheme.vue'
import MinimalTheme from '~/themes/minimal/MinimalTheme.vue'

/** Accent presets (gradient, 105deg). Each preset carries a dark-surface and a
 *  light-surface pair so the accented word stays legible on the paper theme. */
export const ACCENTS: Record<AccentKey, { onDark: [string, string]; onLight: [string, string] }> = {
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

export function accentPair(theme: ThemeKey, accent: AccentKey): [string, string] {
  return THEMES[theme].dark ? ACCENTS[accent].onDark : ACCENTS[accent].onLight
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
