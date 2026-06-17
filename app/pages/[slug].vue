<script setup lang="ts">
import { samplePages } from '~/data/sample'
import { THEMES } from '~/themes/registry'
import { useMotion } from '~/themes/_motion/useMotion'

const route = useRoute()
const record = samplePages.find((p) => p.slug === route.params.slug)

// Draft pages stay viewable by their owner for now — the publish gate moves
// server-side once the pages API lands.
if (!record) {
  throw createError({ statusCode: 404, statusMessage: 'This page is not here', fatal: true })
}

const story = record.story
const theme = THEMES[story.themeKey]

useHead({
  title: `${story.identity.name} — ${story.identity.headline.toLowerCase()}`,
})

const rootRef = ref<HTMLElement | null>(null)
useMotion(rootRef, () => theme.motion)
</script>

<template>
  <div ref="rootRef">
    <component :is="theme.component" :story="story" />
  </div>
</template>
