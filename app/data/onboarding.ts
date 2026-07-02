/** Onboarding draft engine — turns a 60-second interview into a first draft
 *  of the whole StoryPage, plus a ranked pick from the curated Looks.
 *
 *  Pure and deterministic: `(context, seed) → draft`. Same answers, same page.
 *  The "AI" moment in the onboarding UI is staged (like the mocked autosave);
 *  when the backend lands, a real generation endpoint can replace
 *  `generateDraft` behind the same signature. See docs/ONBOARDING.md. */

import type { About, Chapter, GalleryItem, Identity, StoryLink } from '~/types/story'

/* ── The interview ─────────────────────────────────────────────────────── */

export type FieldKey = 'design' | 'engineering' | 'writing' | 'visual' | 'business' | 'other'
export type VibeKey = 'bold' | 'quiet' | 'warm' | 'technical'
export type GoalKey = 'clients' | 'hired' | 'story' | 'showcase'

export interface OnboardingContext {
  name: string
  role: string
  location: string
  field: FieldKey
  vibe: VibeKey
  goal: GoalKey
  available: boolean
  links: StoryLink[]
}

/** Field chips — each carries role suggestions for the free-text input. */
export const FIELDS: { key: FieldKey; label: string; hint: string; roles: string[] }[] = [
  { key: 'design', label: 'Design', hint: 'product · brand · type', roles: ['product designer', 'brand designer', 'ui/ux designer'] },
  { key: 'engineering', label: 'Engineering', hint: 'software · systems · data', roles: ['software engineer', 'frontend engineer', 'data engineer'] },
  { key: 'writing', label: 'Writing & content', hint: 'words · editorial · strategy', roles: ['writer', 'content strategist', 'editor'] },
  { key: 'visual', label: 'Photo, art & film', hint: 'image makers', roles: ['photographer', 'illustrator', 'filmmaker'] },
  { key: 'business', label: 'Founder & business', hint: 'ventures · consulting', roles: ['founder', 'consultant', 'product manager'] },
  { key: 'other', label: 'Something else', hint: 'your own lane', roles: [] },
]

/** Vibe chips — the main signal for the Look. Hints mirror the Look language. */
export const VIBES: { key: VibeKey; label: string; hint: string }[] = [
  { key: 'bold', label: 'Bold & dramatic', hint: 'dark · expressive motion' },
  { key: 'quiet', label: 'Quiet & refined', hint: 'light · airy · calm' },
  { key: 'warm', label: 'Warm & personal', hint: 'rounded · glowing' },
  { key: 'technical', label: 'Technical & precise', hint: 'mono · sharp · exact' },
]

export const GOALS: { key: GoalKey; label: string; hint: string }[] = [
  { key: 'clients', label: 'Win client work', hint: 'commissions & projects' },
  { key: 'hired', label: 'Get hired', hint: 'find the right team' },
  { key: 'story', label: 'Tell my story', hint: 'the long version of you' },
  { key: 'showcase', label: 'Showcase my work', hint: 'a living archive' },
]

/* ── Look scoring ──────────────────────────────────────────────────────── */

type ScoreTable = Partial<Record<string, number>>

/** Vibe is the loudest signal (0–3), field seasons it (0–2), goal nudges (0–1). */
const VIBE_LOOKS: Record<VibeKey, ScoreTable> = {
  bold: { 'editorial-night': 3, 'violet-bold': 2, 'warm-ember': 1 },
  quiet: { 'quiet-paper': 3, 'jade-studio': 2 },
  warm: { 'warm-ember': 3, 'jade-studio': 2, 'editorial-night': 1 },
  technical: { 'mono-brutal': 3, 'quiet-paper': 2 },
}
const FIELD_LOOKS: Record<FieldKey, ScoreTable> = {
  design: { 'editorial-night': 2, 'violet-bold': 1 },
  engineering: { 'mono-brutal': 2, 'quiet-paper': 1 },
  writing: { 'quiet-paper': 2, 'editorial-night': 1 },
  visual: { 'editorial-night': 2, 'warm-ember': 1 },
  business: { 'jade-studio': 2, 'quiet-paper': 1 },
  other: {},
}
const GOAL_LOOKS: Record<GoalKey, ScoreTable> = {
  clients: { 'jade-studio': 1 },
  hired: { 'quiet-paper': 1 },
  story: { 'warm-ember': 1 },
  showcase: { 'editorial-night': 1 },
}

/** Rank the allowed Look keys (pass only plan-unlocked keys) best-first.
 *  Ties break on the allowed-list order, which follows the curated LOOKS. */
export function rankLooks(ctx: OnboardingContext, allowed: string[]): string[] {
  const score = (k: string) =>
    (VIBE_LOOKS[ctx.vibe][k] ?? 0) + (FIELD_LOOKS[ctx.field][k] ?? 0) + (GOAL_LOOKS[ctx.goal][k] ?? 0)
  return [...allowed].sort((a, b) => score(b) - score(a))
}

/* ── Copy tables ───────────────────────────────────────────────────────── */

const VIBE_ORDER: VibeKey[] = ['bold', 'quiet', 'warm', 'technical']

/** Headlines per field, ordered [bold, quiet, warm, technical]. The initial
 *  pick follows the vibe; the redraft seed rotates through the field's pool.
 *  The last word is the accented display word (splitHeadline). */
const HEADLINES: Record<FieldKey, [string, string, string, string]> = {
  design: [
    'Design that refuses to whisper',
    'Design that earns its silence',
    'Design that feels like home',
    'Design measured to the pixel',
  ],
  engineering: [
    'Systems built to outlast trends',
    'Software that stays out of the way',
    'Building things people actually love',
    'Engineered down to the detail',
  ],
  writing: [
    'Stories too sharp to skim',
    'Writing that trusts the reader',
    'Words that sound like a friend',
    'Every sentence pulls its weight',
  ],
  visual: [
    'Images that stop the scroll',
    'Frames that hold their breath',
    'Moments worth keeping forever',
    'Light, measured to the frame',
  ],
  business: [
    'Building what comes next',
    'Substance over noise',
    'Built around people first',
    'Decisions backed by evidence',
  ],
  other: [
    'Made to be remembered',
    'Less noise, more signal',
    'Work with a heartbeat',
    'Craft you can measure',
  ],
}

/** Pull-quotes, ordered [bold, quiet, warm, technical] like the headlines. */
const QUOTES: [string, string, string, string] = [
  'The work should be impossible to scroll past.',
  'Restraint is a feature, not a compromise.',
  'Everything I make starts with the person on the other side.',
  'Craft is what quality looks like up close.',
]

const GOAL_INTRO: Record<GoalKey, string> = {
  clients: 'Taking on select projects for people who care about the details.',
  hired: 'Looking for the right team to do my best work with.',
  story: 'This page is the longer version of who I am and how I got here.',
  showcase: 'A living archive of what I make and why it matters.',
}

const FIELD_ABOUT: Record<FieldKey, string> = {
  design: 'I care about the space between how something looks and how it feels to use.',
  engineering: 'I like problems that look impossible until the right abstraction shows up.',
  writing: 'I believe clarity is a form of respect for the reader.',
  visual: 'I chase the frames that say what words cannot.',
  business: 'I build things by listening first and shipping second.',
  other: 'I follow the work that feels worth doing well.',
}

const GOAL_ABOUT: Record<GoalKey, string> = {
  clients: 'The best collaborations start with a good brief and an honest conversation. That is what this page is for.',
  hired: 'I am at my best inside a team that sweats the details as much as I do.',
  story: 'What follows is the road so far, detours included.',
  showcase: 'Everything below is real work, shown the way it deserves.',
}

const GOAL_AVAILABILITY: Record<GoalKey, string> = {
  clients: 'open for new projects',
  hired: 'open to opportunities',
  story: 'say hello anytime',
  showcase: 'say hello anytime',
}

/** Gallery scaffolds per field: [slot, caption] × 3. */
const GALLERY: Record<FieldKey, [string, string][]> = {
  design: [
    ['flagship project', 'The project that best says who you are'],
    ['interface or identity detail', 'A close-up that rewards a second look'],
    ['process shot', 'The messy middle: sketches, boards, drafts'],
  ],
  engineering: [
    ['flagship product', 'The thing you shipped that you are proudest of'],
    ['system in motion', 'A diagram or demo of how it works'],
    ['behind the scenes', 'The setup, the terminal, the whiteboard'],
  ],
  writing: [
    ['signature piece', 'The piece you would hand a stranger first'],
    ['published work', 'Where your words have appeared'],
    ['work in progress', 'The desk, the drafts, the margins'],
  ],
  visual: [
    ['signature image', 'The frame that best carries your eye'],
    ['recent series', 'A taste of what you are shooting now'],
    ['behind the lens', 'You, at work'],
  ],
  business: [
    ['the venture', 'What you are building, in one image'],
    ['the team or the room', 'The people and places behind it'],
    ['a milestone', 'A launch, a signing, a first sale'],
  ],
  other: [
    ['signature work', 'The piece that best says who you are'],
    ['recent favourite', 'Something new you are proud of'],
    ['the process', 'How the work actually gets made'],
  ],
}

const GALLERY_SHAPE: { ratio: string; dir: 1 | -1; offset?: number }[] = [
  { ratio: '4 / 5', dir: 1 },
  { ratio: '1 / 1', dir: -1, offset: 40 },
  { ratio: '3 / 4', dir: 1 },
]

/* ── The generator ─────────────────────────────────────────────────────── */

export interface OnboardingDraft {
  identity: Identity
  about: About
  chapters: Chapter[]
  gallery: GalleryItem[]
  links: StoryLink[]
  /** Suggested site title, e.g. "Qie — software engineer". */
  title: string
}

function clean(s: string): string {
  return s.trim().replace(/\s+/g, ' ')
}

/** A lowercase, url-safe handle suggestion from the user's name. */
export function suggestHandle(name: string): string {
  return clean(name)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30)
}

/** Deterministic draft of the whole story. `seed` rotates the copy variants
 *  (headline + quote) so "redraft the words" always lands somewhere new. */
export function generateDraft(ctx: OnboardingContext, seed = 0): OnboardingDraft {
  const name = clean(ctx.name) || 'Your name'
  const role = clean(ctx.role).toLowerCase() || 'maker'
  const location = clean(ctx.location).toLowerCase()
  const vibeIdx = VIBE_ORDER.indexOf(ctx.vibe)
  const idx = (vibeIdx + seed) % 4

  const roleCap = role.charAt(0).toUpperCase() + role.slice(1)
  const intro = `${roleCap}${location ? ` based in ${location}` : ''}. ${GOAL_INTRO[ctx.goal]}`

  const meta = [role, location].filter(Boolean)
  if (ctx.goal === 'clients') meta.push('select projects')
  if (ctx.goal === 'hired') meta.push('portfolio & cv in one')

  const identity: Identity = {
    name,
    role,
    location,
    headline: HEADLINES[ctx.field][idx]!,
    intro,
    meta,
    availability: ctx.available ? GOAL_AVAILABILITY[ctx.goal] : undefined,
  }

  const about: About = {
    quote: QUOTES[(vibeIdx + seed) % 4]!,
    body: `${FIELD_ABOUT[ctx.field]} ${GOAL_ABOUT[ctx.goal]}`,
  }

  /** Scaffolds that coach — each body says what belongs there, in the page's
   *  own voice, so an unedited page still reads intentionally. */
  const chapters: Chapter[] = [
    {
      period: 'the spark',
      title: 'Where it started',
      body: `Every ${role} has an origin story. Put yours here: the first project, the person who opened the door, the moment it turned serious.`,
    },
    {
      period: 'the craft',
      title: 'Learning by doing',
      body: 'The years of reps: what you studied, shipped, failed at and figured out. Two or three honest sentences beat a résumé.',
    },
    {
      period: 'now',
      title: 'Where I am today',
      body: `What today looks like${location ? ` in ${location}` : ''}: current work, current obsessions, and what you want to build next.`,
    },
  ]

  const gallery: GalleryItem[] = GALLERY[ctx.field].map(([slot, caption], i) => ({
    slot,
    caption,
    ...GALLERY_SHAPE[i]!,
  }))

  return {
    identity,
    about,
    chapters,
    gallery,
    links: ctx.links.filter((l) => l.url.trim()),
    title: `${name} — ${role}`,
  }
}

/** The staged "crafting" lines the reveal step plays before showing the draft. */
export const CRAFTING_LINES = [
  'Reading your answers…',
  'Drafting your headline…',
  'Writing your first sections…',
  'Choosing your look…',
  'Setting the type…',
]
