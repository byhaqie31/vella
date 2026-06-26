<script setup lang="ts">
import { samplePages } from '~/data/sample'
import { normalizeDesign, scaleMotion, THEMES } from '~/themes/registry'
import { useMotion } from '~/themes/_motion/useMotion'

const route = useRoute()
const record = samplePages.find((p) => p.slug === route.params.slug)

// Draft pages stay viewable by their owner for now — the publish gate moves
// server-side once the pages API lands.
if (!record) {
  throw createError({ statusCode: 404, statusMessage: 'This page is not here', fatal: true })
}

const story = record.story
// Backfill the design layer for any record that predates it.
story.design = normalizeDesign(story.design)
const theme = THEMES[story.themeKey]

useHead({
  title: `${story.identity.name} — ${story.identity.headline.toLowerCase()}`,
})

const rootRef = ref<HTMLElement | null>(null)
// Motion amplitude follows the user's chosen temperament (calm/balanced/expressive).
useMotion(rootRef, () => scaleMotion(theme.motion, story.design.motionLevel))
</script>

<template>
  <div ref="rootRef">
    <component :is="theme.component" :story="story" />
  </div>
</template>
