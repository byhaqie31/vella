import { acceptHMRUpdate, defineStore } from 'pinia'
import type {
  AccentKey,
  Atmosphere,
  Density,
  HeadlineAccent,
  MotionLevel,
  SectionId,
  Shape,
  StoryPage,
  ThemeKey,
  TypeMood,
  TypeScale,
} from '~/types/story'
import { aliaStory, hurufStory } from '~/data/sample'
import { defaultDesign, type Look, normalizeDesign, THEMES } from '~/themes/registry'

const TAKEN_SLUGS = ['huruf', 'daniel-w', 'sofia-reads', 'admin', 'www']
// Slugs live at the root (/[slug]), so they share the namespace with real
// routes — a static route always wins, so these names can't be claimed.
const RESERVED_SLUGS = ['admin', 'auth', 'dashboard', 'edit', 'www', 'api', 'u']

export type SavedState = 'idle' | 'saving' | 'saved'
export type SlugState = 'yours' | 'checking' | 'taken' | 'available' | 'empty'

function blankStory(): StoryPage {
  return {
    themeKey: 'editorial',
    accent: 'aurora',
    typeMood: 'serif',
    design: defaultDesign(),
    identity: { name: '', role: '', location: '', headline: '', intro: '', meta: [] },
    about: { quote: '', body: '' },
    chapters: [{ period: '', title: '', body: '' }],
    gallery: [],
    links: [{ label: '', url: '' }],
    isPublished: false,
  }
}

/** The customization slice undo/redo tracks — design + the three top knobs. */
interface DesignSnapshot {
  themeKey: ThemeKey
  accent: AccentKey
  typeMood: TypeMood
  design: StoryPage['design']
}

/** The editor is the one stateful surface — the live preview just reads this. */
export const useEditorStore = defineStore('editor', () => {
  const story = ref<StoryPage>(structuredClone(aliaStory))
  const pageId = ref('alia')
  const slug = ref('alia')
  const originalSlug = ref('alia')
  const savedState = ref<SavedState>('idle')
  const slugState = ref<SlugState>('yours')

  /** Design-only undo/redo. Content already autosaves; the design panel is the
   *  one surface where exploratory, reversible moves matter. */
  const past = ref<DesignSnapshot[]>([])
  const future = ref<DesignSnapshot[]>([])
  const canUndo = computed(() => past.value.length > 0)
  const canRedo = computed(() => future.value.length > 0)

  let saveT1: ReturnType<typeof setTimeout> | undefined
  let saveT2: ReturnType<typeof setTimeout> | undefined
  let slugT: ReturnType<typeof setTimeout> | undefined

  function load(id: string) {
    pageId.value = id
    if (id === 'huruf') {
      story.value = structuredClone(hurufStory)
      slug.value = 'huruf'
    } else if (id === 'alia') {
      story.value = structuredClone(aliaStory)
      slug.value = 'alia'
    } else {
      story.value = blankStory()
      slug.value = ''
    }
    // Backfill design for any story that predates the design layer.
    story.value.design = normalizeDesign(story.value.design)
    originalSlug.value = slug.value
    slugState.value = slug.value ? 'yours' : 'empty'
    savedState.value = 'idle'
    past.value = []
    future.value = []
  }

  /** Autosave indicator — stands in for the debounced PATCH until the API lands. */
  function touch() {
    savedState.value = 'saving'
    clearTimeout(saveT1)
    clearTimeout(saveT2)
    saveT1 = setTimeout(() => (savedState.value = 'saved'), 800)
    saveT2 = setTimeout(() => (savedState.value = 'idle'), 2600)
  }

  /** Async availability check on the slug field (mocked, 500ms). */
  function setSlug(raw: string) {
    const clean = raw.toLowerCase().replace(/[^a-z0-9-]/g, '')
    slug.value = clean
    slugState.value = 'checking'
    touch()
    clearTimeout(slugT)
    slugT = setTimeout(() => {
      slugState.value = !clean
        ? 'empty'
        : clean === originalSlug.value
          ? 'yours'
          : TAKEN_SLUGS.includes(clean) || RESERVED_SLUGS.includes(clean)
            ? 'taken'
            : 'available'
    }, 500)
  }

  function togglePublish() {
    story.value.isPublished = !story.value.isPublished
  }

  function addChapter() {
    story.value.chapters.push({ period: '', title: '', body: '' })
    touch()
  }
  function removeChapter(i: number) {
    story.value.chapters.splice(i, 1)
    touch()
  }
  function addLink() {
    story.value.links.push({ label: '', url: '' })
    touch()
  }
  function removeLink(i: number) {
    story.value.links.splice(i, 1)
    touch()
  }
  function addMedia() {
    story.value.gallery.push({ slot: `image ${story.value.gallery.length + 1}`, caption: '' })
    touch()
  }
  function removeMedia(i: number) {
    story.value.gallery.splice(i, 1)
    touch()
  }

  /* ── Design layer ────────────────────────────────────────────────────────
     Every design mutation snapshots first, so undo/redo is reliable and a
     drag on the hue slider collapses to a single, reversible step. */

  // Deep clone via JSON: the design config is pure data, and this reads cleanly
  // through Vue's reactive proxies. structuredClone(toRaw(...)) does NOT work
  // here — toRaw only unwraps the top level, so nested proxies (the sections
  // array) survive and structuredClone throws "could not be cloned".
  const cloneDesign = (d: StoryPage['design']): StoryPage['design'] => JSON.parse(JSON.stringify(d))

  function capture(): DesignSnapshot {
    return {
      themeKey: story.value.themeKey,
      accent: story.value.accent,
      typeMood: story.value.typeMood,
      design: cloneDesign(story.value.design),
    }
  }
  function apply(s: DesignSnapshot) {
    story.value.themeKey = s.themeKey
    story.value.accent = s.accent
    story.value.typeMood = s.typeMood
    story.value.design = cloneDesign(s.design)
    touch()
  }
  /** Push the current state onto the undo stack. Call before a mutation; the
   *  slider calls it once on pointerdown so a whole drag is one step. */
  function snapshot() {
    past.value.push(capture())
    if (past.value.length > 60) past.value.shift()
    future.value = []
  }
  function undo() {
    const prev = past.value.pop()
    if (!prev) return
    future.value.push(capture())
    apply(prev)
  }
  function redo() {
    const next = future.value.pop()
    if (!next) return
    past.value.push(capture())
    apply(next)
  }

  const d = () => story.value.design

  function setTheme(k: ThemeKey) {
    if (story.value.themeKey === k) return
    snapshot()
    story.value.themeKey = k
    // Lean into the theme's intended mood when the user hasn't strayed far.
    touch()
  }
  function setAccent(k: AccentKey) {
    if (story.value.accent === k) return
    snapshot()
    story.value.accent = k
    touch()
  }
  function setMood(k: TypeMood) {
    if (story.value.typeMood === k) return
    snapshot()
    story.value.typeMood = k
    touch()
  }
  /** Live hue updates during a drag — history is captured once on pointerdown
   *  via snapshot(), so this stays cheap and does not pollute the stack. */
  function setHue(hue: number) {
    story.value.accent = 'custom'
    d().customHue = Math.round(((hue % 360) + 360) % 360)
    touch()
  }
  function setTypeScale(v: TypeScale) {
    if (d().typeScale === v) return
    snapshot()
    d().typeScale = v
    touch()
  }
  function setDensity(v: Density) {
    if (d().density === v) return
    snapshot()
    d().density = v
    touch()
  }
  function setShape(v: Shape) {
    if (d().shape === v) return
    snapshot()
    d().shape = v
    touch()
  }
  function setAtmosphere(v: Atmosphere) {
    if (d().atmosphere === v) return
    snapshot()
    d().atmosphere = v
    touch()
  }
  function setMotionLevel(v: MotionLevel) {
    if (d().motionLevel === v) return
    snapshot()
    d().motionLevel = v
    touch()
  }
  function setHeadlineAccent(v: HeadlineAccent) {
    if (d().headlineAccent === v) return
    snapshot()
    d().headlineAccent = v
    touch()
  }

  function toggleSection(id: SectionId) {
    const s = d().sections.find((x) => x.id === id)
    if (!s) return
    snapshot()
    s.visible = !s.visible
    touch()
  }
  function moveSection(id: SectionId, dir: -1 | 1) {
    const list = d().sections
    const i = list.findIndex((x) => x.id === id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= list.length) return
    snapshot()
    const [item] = list.splice(i, 1)
    list.splice(j, 0, item!)
    touch()
  }

  function applyLook(look: Look) {
    snapshot()
    story.value.themeKey = look.themeKey
    story.value.accent = look.accent
    story.value.typeMood = look.typeMood
    if (look.customHue !== undefined) d().customHue = look.customHue
    Object.assign(d(), look.design)
    touch()
  }

  /** Surprise me — every roll lands on a tasteful combination by construction,
   *  because each pool is already curated. Never an ugly result. */
  function shuffle() {
    snapshot()
    const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)]!
    const themeKeys = Object.keys(THEMES) as ThemeKey[]
    const theme = pick(themeKeys)
    story.value.themeKey = theme
    // Half the time, a real custom hue; half, a named preset.
    if (Math.random() < 0.5) {
      story.value.accent = 'custom'
      d().customHue = Math.floor(Math.random() * 360)
    } else {
      story.value.accent = pick(['aurora', 'ember', 'jade', 'mono'] as AccentKey[])
    }
    story.value.typeMood = pick(['serif', 'sans', 'mono-accent'] as TypeMood[])
    d().typeScale = pick(['compact', 'balanced', 'generous'] as TypeScale[])
    d().density = pick(['snug', 'balanced', 'airy'] as Density[])
    d().shape = pick(['sharp', 'soft', 'round'] as Shape[])
    d().atmosphere = pick(['clean', 'glow', 'grain', 'vignette'] as Atmosphere[])
    d().motionLevel = pick(['calm', 'balanced', 'expressive'] as MotionLevel[])
    d().headlineAccent = pick(['gradient', 'solid', 'underline', 'plain'] as HeadlineAccent[])
    touch()
  }

  /** Reset the design knobs to defaults, leaving theme/accent/mood as chosen. */
  function resetDesign() {
    snapshot()
    const fresh = defaultDesign()
    fresh.customHue = d().customHue
    story.value.design = fresh
    touch()
  }

  return {
    story,
    pageId,
    slug,
    savedState,
    slugState,
    canUndo,
    canRedo,
    load,
    touch,
    setSlug,
    togglePublish,
    addChapter,
    removeChapter,
    addLink,
    removeLink,
    addMedia,
    removeMedia,
    // design
    snapshot,
    undo,
    redo,
    setTheme,
    setAccent,
    setMood,
    setHue,
    setTypeScale,
    setDensity,
    setShape,
    setAtmosphere,
    setMotionLevel,
    setHeadlineAccent,
    toggleSection,
    moveSection,
    applyLook,
    shuffle,
    resetDesign,
  }
})

/* Hot-reload the store in place during dev. Without this, editing this file
   leaves an open editor tab holding a stale store instance whose new actions
   (applyLook, setTheme, …) are missing, so design clicks silently no-op. */
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEditorStore, import.meta.hot))
}
