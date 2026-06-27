<script setup lang="ts">
import type { StoryPage } from '~/types/story'
import { samplePages } from '~/data/sample'
import { SITE_KEY } from '~/data/portal'
import { normalizeDesign, scaleMotion, THEMES } from '~/themes/registry'
import { useMotion } from '~/themes/_motion/useMotion'

const route = useRoute()

/** Resolve the story to render: sample pages (SSR-friendly) first, then the
 *  user's published portal site from localStorage (client only). */
function resolve(): StoryPage | null {
  const rec = samplePages.find((p) => p.slug === route.params.slug)
  if (rec) {
    rec.story.design = normalizeDesign(rec.story.design)
    return rec.story
  }
  if (import.meta.client) {
    try {
      const raw = localStorage.getItem(SITE_KEY)
      if (raw) {
        const s = JSON.parse(raw)
        if (s.handle === route.params.slug && s.status === 'published') {
          s.story.design = normalizeDesign(s.story.design)
          return s.story as StoryPage
        }
      }
    } catch {
      // fall through to not-found
    }
  }
  return null
}

const story = ref<StoryPage | null>(resolve())
// True once we've made a client-side resolution attempt; gates the not-found UI
// so SSR (which can't read a portal site) never flashes "not here".
const checked = ref(import.meta.client)

const theme = computed(() => (story.value ? THEMES[story.value.themeKey] : null))

useHead({
  title: () => (story.value ? `${story.value.identity.name} — ${story.value.identity.headline}` : 'vella'),
})

const rootRef = ref<HTMLElement | null>(null)
// No-ops when rootRef is absent (not-found / SSR portal case); only the
// personality factory touches theme/story, and only once motion actually binds.
useMotion(rootRef, () => scaleMotion(theme.value!.motion, story.value!.design.motionLevel))
</script>

<template>
  <div v-if="story && theme" ref="rootRef">
    <component :is="theme.component" :story="story" />
  </div>
  <div v-else-if="checked" class="grid min-h-screen place-items-center bg-ink p-6 font-sans text-text">
    <div class="flex flex-col items-center gap-4 text-center">
      <AppLogo :size="34" />
      <h1 class="m-0 font-display text-2xl font-normal">This page isn't here</h1>
      <p class="m-0 max-w-[34ch] text-[0.95rem] text-text-dim">It may be unpublished, or the address is wrong.</p>
      <NuxtLink to="/" class="rounded-full border border-line px-5 py-2.5 text-[0.88rem] text-text no-underline transition-colors hover:border-text-faint">
        Back to vella
      </NuxtLink>
    </div>
  </div>
</template>
