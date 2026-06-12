import { defineStore } from 'pinia'
import type { StoryPage } from '~/types/story'
import { aliaStory, hurufStory } from '~/data/sample'

const TAKEN_SLUGS = ['huruf', 'daniel-w', 'sofia-reads', 'admin', 'www']

export type SavedState = 'idle' | 'saving' | 'saved'
export type SlugState = 'yours' | 'checking' | 'taken' | 'available' | 'empty'

function blankStory(): StoryPage {
  return {
    themeKey: 'editorial',
    accent: 'aurora',
    typeMood: 'serif',
    identity: { name: '', role: '', location: '', headline: '', intro: '', meta: [] },
    about: { quote: '', body: '' },
    chapters: [{ period: '', title: '', body: '' }],
    gallery: [],
    links: [{ label: '', url: '' }],
    isPublished: false,
  }
}

/** The editor is the one stateful surface — the live preview just reads this. */
export const useEditorStore = defineStore('editor', () => {
  const story = ref<StoryPage>(structuredClone(aliaStory))
  const pageId = ref('alia')
  const slug = ref('alia')
  const originalSlug = ref('alia')
  const savedState = ref<SavedState>('idle')
  const slugState = ref<SlugState>('yours')

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
    originalSlug.value = slug.value
    slugState.value = slug.value ? 'yours' : 'empty'
    savedState.value = 'idle'
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
          : TAKEN_SLUGS.includes(clean)
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

  return {
    story,
    pageId,
    slug,
    savedState,
    slugState,
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
  }
})
