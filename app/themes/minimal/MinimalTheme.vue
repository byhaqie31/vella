<script setup lang="ts">
import type { SectionId, StoryPage } from '~/types/story'
import { DENSITIES, linkHost, resolveAccent, SHAPES, splitHeadline, TYPE_MOODS, TYPE_SCALES } from '~/themes/registry'

const props = defineProps<{ story: StoryPage }>()

const d = computed(() => props.story.design)
const accent = computed(() => resolveAccent('minimal', props.story))
const mood = computed(() => TYPE_MOODS[props.story.typeMood])
const headline = computed(() => splitHeadline(props.story.identity.headline))
const eyebrow = computed(() =>
  [props.story.identity.name, props.story.identity.role, props.story.identity.location]
    .filter(Boolean)
    .join(' · '),
)

const sectionLabels: Record<SectionId, string> = { about: 'About', chapters: 'Chapters', gallery: 'Gallery', links: 'Links' }
function hasContent(id: SectionId) {
  if (id === 'about') return !!(props.story.about.quote || props.story.about.body)
  if (id === 'chapters') return props.story.chapters.length > 0
  if (id === 'gallery') return props.story.gallery.length > 0
  return props.story.links.length > 0
}
const sections = computed(() =>
  props.story.design.sections.filter((s) => s.visible && hasContent(s.id)).map((s) => ({ id: s.id, label: sectionLabels[s.id] })),
)

const displayStyle = computed(() => ({
  fontFamily: mood.value.font,
  fontWeight: mood.value.weight,
  letterSpacing: mood.value.tracking,
}))

const headlineEm = computed(() => {
  switch (d.value.headlineAccent) {
    case 'gradient':
      return { cls: 'text-gradient', style: {} as Record<string, string> }
    case 'solid':
      return { cls: '', style: { color: accent.value[0] } }
    case 'underline':
      return { cls: '', style: { color: 'var(--color-paper-ink)', borderBottom: `0.08em solid ${accent.value[0]}`, paddingBottom: '0.02em' } }
    default:
      return { cls: '', style: { color: 'var(--color-paper-ink)' } }
  }
})

const rootStyle = computed(() => ({
  '--accent-a': accent.value[0],
  '--accent-b': accent.value[1],
  '--radius-card': SHAPES[d.value.shape].card,
  '--radius-field': SHAPES[d.value.shape].field,
  '--vella-type': String(TYPE_SCALES[d.value.typeScale]),
  '--vella-space': String(DENSITIES[d.value.density]),
}))
</script>

<template>
  <div class="relative min-h-screen overflow-x-hidden bg-paper font-sans text-paper-ink" :style="rootStyle">
    <!-- atmosphere (kept whisper-quiet on paper) -->
    <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <template v-if="d.atmosphere === 'glow'">
        <div class="absolute -top-[15%] -left-[6%] h-[48vw] w-[48vw] rounded-full blur-[44px]" :style="{ background: `radial-gradient(circle, ${accent[0].replace(')', ' / 0.14)')}, transparent 65%)` }" />
        <div class="absolute top-[30%] -right-[12%] h-[42vw] w-[42vw] rounded-full blur-[44px]" :style="{ background: `radial-gradient(circle, ${accent[1].replace(')', ' / 0.12)')}, transparent 65%)` }" />
      </template>
      <div v-else-if="d.atmosphere === 'grain'" class="vella-grain absolute inset-0" />
      <div v-else-if="d.atmosphere === 'vignette'" class="absolute inset-0" style="box-shadow: inset 0 0 240px 70px oklch(0.4 0.01 95 / 0.14)" />
    </div>

    <div
      class="relative z-[1] mx-auto flex max-w-[760px] flex-col px-[clamp(24px,5vw,48px)] pt-[clamp(64px,12vh,120px)] pb-20"
      style="gap: calc(clamp(64px, 10vh, 110px) * var(--vella-space))"
    >
      <!-- Identity -->
      <header class="flex flex-col gap-6">
        <span data-load="0.1" data-motion="eyebrow" class="eyebrow text-paper-faint">{{ eyebrow }}</span>
        <h1
          data-load="0.2"
          data-motion="split"
          class="m-0 leading-[1.02]"
          :style="{ ...displayStyle, fontSize: 'calc(clamp(2.6rem, 1.8rem + 4.5vw, 5rem) * var(--vella-type))' }"
        >
          {{ headline.head }}
          <em v-if="headline.accent" :class="[headlineEm.cls, mood.accentItalic ? 'italic' : 'not-italic']" :style="headlineEm.style">{{ headline.accent }}</em>
        </h1>
        <p
          v-if="story.identity.intro"
          data-load="0.45"
          data-motion="rise"
          class="m-0 max-w-[36rem] text-[1.0625rem] leading-[1.6] text-pretty text-paper-dim"
        >{{ story.identity.intro }}</p>
        <div data-load="0.6" data-motion="fade" class="flex flex-wrap gap-6">
          <span v-for="m in story.identity.meta" :key="m" class="font-mono text-[0.8rem] text-paper-faint">{{ m }}</span>
          <span v-if="story.identity.availability" class="font-mono text-[0.8rem]" style="color: oklch(0.52 0.10 160)">{{ story.identity.availability }}</span>
        </div>
      </header>

      <!-- Body sections, in the user's chosen order -->
      <template v-for="s in sections" :key="s.id">
        <!-- About -->
        <section v-if="s.id === 'about'" class="flex flex-col gap-7">
          <div data-reveal="line" class="h-px bg-paper-line" />
          <span data-reveal="fade" class="eyebrow text-paper-faint">About</span>
          <p
            v-if="story.about.quote"
            data-reveal="rise"
            class="m-0 max-w-[28ch] font-medium leading-[1.35] tracking-[-0.015em] text-pretty"
            :style="{ fontSize: 'calc(clamp(1.35rem, 1rem + 1.6vw, 2rem) * var(--vella-type))' }"
          >{{ story.about.quote }}</p>
          <p
            v-if="story.about.body"
            data-reveal="rise"
            class="m-0 max-w-[36rem] text-[1.0625rem] leading-[1.6] text-pretty text-paper-dim"
          >{{ story.about.body }}</p>
        </section>

        <!-- Chapters -->
        <section v-else-if="s.id === 'chapters'" class="flex flex-col gap-7">
          <div data-reveal="line" class="h-px bg-paper-line" />
          <span data-reveal="fade" class="eyebrow text-paper-faint">Chapters</span>
          <div class="flex flex-col gap-9">
            <article v-for="ch in story.chapters" :key="ch.title + ch.period" data-reveal="rise" class="flex flex-col gap-2">
              <span data-reveal="slide" class="font-mono text-[0.8rem] text-paper-faint">{{ ch.period }}</span>
              <h3 class="m-0 text-[1.35rem] font-semibold leading-[1.2] tracking-[-0.02em]">{{ ch.title }}</h3>
              <p class="m-0 max-w-[36rem] text-base leading-[1.6] text-pretty text-paper-dim">{{ ch.body }}</p>
            </article>
          </div>
        </section>

        <!-- Gallery -->
        <section v-else-if="s.id === 'gallery'" class="flex flex-col gap-7">
          <div data-reveal="line" class="h-px bg-paper-line" />
          <span data-reveal="fade" class="eyebrow text-paper-faint">Gallery</span>
          <div class="grid gap-5" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))">
            <figure v-for="g in story.gallery" :key="g.slot" class="m-0 flex flex-col gap-2.5">
              <div data-reveal="clip" class="relative aspect-[4/3] overflow-hidden rounded-card border border-paper-soft">
                <div data-media class="media-stripes-paper absolute inset-0 grid place-items-center">
                  <span class="font-mono text-[0.72rem] tracking-[0.12em] text-paper-faint">{{ g.slot }}</span>
                </div>
              </div>
              <figcaption class="font-mono text-[0.72rem] tracking-[0.08em] text-paper-faint">{{ g.caption }}</figcaption>
            </figure>
          </div>
        </section>

        <!-- Links -->
        <section v-else-if="s.id === 'links'" class="flex flex-col gap-7">
          <div data-reveal="line" class="h-px bg-paper-line" />
          <span data-reveal="fade" class="eyebrow text-paper-faint">Links</span>
          <div class="flex flex-col">
            <a
              v-for="l in story.links"
              :key="l.url + l.label"
              :href="l.url"
              data-reveal="rise"
              class="flex items-baseline justify-between gap-5 border-b border-paper-soft px-1 py-4 text-paper-ink no-underline transition-colors duration-200 hover:bg-[oklch(0.94_0.008_95)]"
            >
              <span class="text-[1.05rem] font-medium tracking-[-0.01em]">{{ l.label }}</span>
              <span class="font-mono text-[0.8rem] text-paper-faint">{{ linkHost(l.url) }}</span>
            </a>
          </div>
        </section>
      </template>

      <footer class="flex items-center justify-between gap-4 pt-2">
        <span class="eyebrow text-paper-faint">© 2026 {{ story.identity.name }}</span>
        <NuxtLink
          to="/"
          class="eyebrow inline-flex items-center gap-2 text-paper-faint no-underline transition-colors duration-200 hover:text-paper-ink"
        >
          <span class="bg-accent h-2.5 w-2.5 rounded-[3px]" />
          Made with vella
        </NuxtLink>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.vella-grain {
  background-image: radial-gradient(oklch(0 0 0 / 0.5) 0.5px, transparent 0.5px);
  background-size: 3px 3px;
  opacity: 0.045;
}
</style>
