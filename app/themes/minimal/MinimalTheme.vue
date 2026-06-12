<script setup lang="ts">
import type { StoryPage } from '~/types/story'
import { accentPair, linkHost, splitHeadline, TYPE_MOODS } from '~/themes/registry'

const props = defineProps<{ story: StoryPage }>()

const accent = computed(() => accentPair('minimal', props.story.accent))
const mood = computed(() => TYPE_MOODS[props.story.typeMood])
const headline = computed(() => splitHeadline(props.story.identity.headline))
const eyebrow = computed(() =>
  [props.story.identity.name, props.story.identity.role, props.story.identity.location]
    .filter(Boolean)
    .join(' · ')
    .toLowerCase(),
)

const displayStyle = computed(() => ({
  fontFamily: mood.value.font,
  fontWeight: mood.value.weight,
  letterSpacing: mood.value.tracking,
}))
</script>

<template>
  <div
    class="min-h-screen overflow-x-hidden bg-paper font-sans text-paper-ink"
    :style="{ '--accent-a': accent[0], '--accent-b': accent[1] }"
  >
    <div class="mx-auto flex max-w-[760px] flex-col gap-[clamp(64px,10vh,110px)] px-[clamp(24px,5vw,48px)] pt-[clamp(64px,12vh,120px)] pb-20">
      <!-- Identity -->
      <header class="flex flex-col gap-6">
        <span data-load="0.1" data-motion="eyebrow" class="eyebrow text-paper-faint">{{ eyebrow }}</span>
        <h1
          data-load="0.2"
          data-motion="split"
          class="m-0 text-[clamp(2.6rem,1.8rem+4.5vw,5rem)] leading-[1.02]"
          :style="displayStyle"
        >
          {{ headline.head }}
          <em v-if="headline.accent" class="text-gradient" :class="mood.accentItalic ? 'italic' : 'not-italic'">{{ headline.accent }}</em>
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

      <!-- About -->
      <section class="flex flex-col gap-7">
        <div data-reveal="line" class="h-px bg-paper-line" />
        <span data-reveal="fade" class="eyebrow text-paper-faint">about</span>
        <p
          data-reveal="rise"
          class="m-0 max-w-[28ch] text-[clamp(1.35rem,1rem+1.6vw,2rem)] font-medium leading-[1.35] tracking-[-0.015em] text-pretty"
        >{{ story.about.quote }}</p>
        <p
          v-if="story.about.body"
          data-reveal="rise"
          class="m-0 max-w-[36rem] text-[1.0625rem] leading-[1.6] text-pretty text-paper-dim"
        >{{ story.about.body }}</p>
      </section>

      <!-- Chapters -->
      <section v-if="story.chapters.length" class="flex flex-col gap-7">
        <div data-reveal="line" class="h-px bg-paper-line" />
        <span data-reveal="fade" class="eyebrow text-paper-faint">chapters</span>
        <div class="flex flex-col gap-9">
          <article v-for="ch in story.chapters" :key="ch.title + ch.period" data-reveal="rise" class="flex flex-col gap-2">
            <span data-reveal="slide" class="font-mono text-[0.8rem] text-paper-faint">{{ ch.period }}</span>
            <h3 class="m-0 text-[1.35rem] font-semibold leading-[1.2] tracking-[-0.02em]">{{ ch.title }}</h3>
            <p class="m-0 max-w-[36rem] text-base leading-[1.6] text-pretty text-paper-dim">{{ ch.body }}</p>
          </article>
        </div>
      </section>

      <!-- Gallery -->
      <section v-if="story.gallery.length" class="flex flex-col gap-7">
        <div data-reveal="line" class="h-px bg-paper-line" />
        <span data-reveal="fade" class="eyebrow text-paper-faint">gallery</span>
        <div class="grid gap-5" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))">
          <figure v-for="g in story.gallery" :key="g.slot" class="m-0 flex flex-col gap-2.5">
            <div data-reveal="clip" class="relative aspect-[4/3] overflow-hidden rounded-[10px] border border-paper-soft">
              <div data-media class="media-stripes-paper absolute inset-0 grid place-items-center">
                <span class="font-mono text-[0.72rem] tracking-[0.12em] text-paper-faint">{{ g.slot }}</span>
              </div>
            </div>
            <figcaption class="font-mono text-[0.72rem] tracking-[0.08em] text-paper-faint">{{ g.caption }}</figcaption>
          </figure>
        </div>
      </section>

      <!-- Links -->
      <section v-if="story.links.length" class="flex flex-col gap-7">
        <div data-reveal="line" class="h-px bg-paper-line" />
        <span data-reveal="fade" class="eyebrow text-paper-faint">links</span>
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

      <footer class="flex items-center justify-between gap-4 pt-2">
        <span class="eyebrow text-paper-faint">© 2026 {{ story.identity.name.toLowerCase() }}</span>
        <NuxtLink
          to="/"
          class="eyebrow inline-flex items-center gap-2 text-paper-faint no-underline transition-colors duration-200 hover:text-paper-ink"
        >
          <span class="bg-accent h-2.5 w-2.5 rounded-[3px]" />
          made with vella
        </NuxtLink>
      </footer>
    </div>
  </div>
</template>
