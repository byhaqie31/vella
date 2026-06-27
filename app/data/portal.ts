/** Portal mock data — the stand-in "backend" for the customer dashboard.
 *  Everything here is seeded into localStorage by the portal composables and
 *  edited client-side. When the real API lands, these shapes become the rows a
 *  `pages` / `users` / `domains` table returns, and the composables swap their
 *  localStorage reads for `$fetch` — the types and call sites stay put. */

import type { StoryPage, ThemeKey } from '~/types/story'
import { aliaStory } from '~/data/sample'
import { ACCENTS, hueToPair, LOOKS, THEMES } from '~/themes/registry'

/** Single-site model: a free account owns one site, addressed by its id. */
export const PORTAL_SITE_ID = 'my-site'
export const SITE_KEY = 'vella:site'
export const USER_KEY = 'vella:user'
export const AUTH_KEY = 'vella:authed'
export const DOMAINS_KEY = 'vella:domains'

export interface PortalUser {
  name: string
  email: string
  plan: 'free' | 'pro'
  initial: string
}

export interface Template {
  key: string
  name: string
  tagline: string
  tier: 'free' | 'pro'
  themeKey: ThemeKey
  dark: boolean
  /** Two-stop preview gradient, resolved for the template's own surface. */
  accent: [string, string]
}

export interface PortalDomain {
  id: string
  domain: string
  status: 'verified' | 'pending' | 'error'
  addedAt: string
}

export interface PortalSite {
  id: string
  handle: string
  title: string
  templateKey: string
  themeKey: ThemeKey
  status: 'draft' | 'published'
  lastEditedAt: string
  publishedAt: string | null
  views7d: number | null
  visitors7d: number | null
  story: StoryPage
}

/** Which curated looks sit behind the Pro paywall. The rest are free. */
const PRO_TEMPLATES = new Set(['warm-ember', 'mono-brutal', 'violet-bold'])

/** Templates are the registry's curated LOOKS, tagged free/pro and given a
 *  resolved preview gradient — one source of truth, no duplicated design data. */
export const TEMPLATES: Template[] = LOOKS.map((l) => {
  const dark = THEMES[l.themeKey].dark
  const accent: [string, string] =
    l.accent === 'custom'
      ? hueToPair(l.customHue ?? 265, dark)
      : dark
        ? ACCENTS[l.accent].onDark
        : ACCENTS[l.accent].onLight
  return {
    key: l.key,
    name: l.label,
    tagline: l.hint,
    tier: PRO_TEMPLATES.has(l.key) ? 'pro' : 'free',
    themeKey: l.themeKey,
    dark,
    accent,
  }
})

export const defaultUser: PortalUser = {
  name: 'Qie',
  email: 'qie@axelnova.dev',
  plan: 'free',
  initial: 'Q',
}

/** Seed a fresh site. Starts from the sample story so the editor and preview
 *  have real content to render, but as a draft. */
export function makeSite(handle = 'qie', templateKey = 'editorial-night'): PortalSite {
  const tpl = TEMPLATES.find((t) => t.key === templateKey) ?? TEMPLATES[0]!
  const story = structuredClone(aliaStory)
  story.themeKey = tpl.themeKey
  story.isPublished = false
  return {
    id: PORTAL_SITE_ID,
    handle,
    title: 'My portfolio',
    templateKey: tpl.key,
    themeKey: tpl.themeKey,
    status: 'draft',
    lastEditedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    publishedAt: null,
    views7d: null,
    visitors7d: null,
    story,
  }
}

/** Relative time for "edited X ago" labels. */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return 'just now'
  const s = Math.max(0, Math.floor((Date.now() - then) / 1000))
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} minute${m > 1 ? 's' : ''} ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d} day${d > 1 ? 's' : ''} ago`
  const mo = Math.floor(d / 30)
  return `${mo} month${mo > 1 ? 's' : ''} ago`
}
