<script setup lang="ts">
import type { SectionId, StoryPage } from '~/types/story'
import { DENSITIES, linkHost, resolveAccent, SHAPES, splitHeadline, TYPE_MOODS, TYPE_SCALES } from '~/themes/registry'

const props = defineProps<{ story: StoryPage }>()

const d = computed(() => props.story.design)
const accent = computed(() => resolveAccent('editorial', props.story))
const mood = computed(() => TYPE_MOODS[props.story.typeMood])
const headline = computed(() => splitHeadline(props.story.identity.headline))
const eyebrow = computed(() =>
  [props.story.identity.name, props.story.identity.role, props.story.identity.location]
    .filter(Boolean)
    .join(' · '),
)

/** A section renders only when it's visible and actually has content. Order
 *  follows the user's design.sections array. */
const sectionLabels: Record<SectionId, string> = { about: 'About', chapters: 'Chapters', gallery: 'Gallery', links: 'Links' }
function hasContent(id: SectionId) {
  if (id === 'about') return !!(props.story.about.quote || props.story.about.body)
  if (id === 'chapters') return props.story.chapters.length > 0
  if (id === 'gallery') return props.story.gallery.length > 0
  return props.story.links.length > 0
}
const sections = computed(() =>
  props.story.design.sections
    .filter((s) => s.visible && hasContent(s.id))
    .map((s) => ({ id: s.id, label: sectionLabels[s.id] })),
)
const sectionNumber = (id: SectionId) => String(sections.value.findIndex((s) => s.id === id) + 1).padStart(2, '0')

const displayStyle = computed(() => ({
  fontFamily: mood.value.font,
  fontWeight: mood.value.weight,
  letterSpacing: mood.value.tracking,
}))

/** The accented display word, treated per the user's headline-accent choice. */
const headlineEm = computed(() => {
  switch (d.value.headlineAccent) {
    case 'gradient':
      return { cls: 'text-gradient', style: {} as Record<string, string> }
    case 'solid':
      return { cls: '', style: { color: accent.value[0] } }
    case 'underline':
      return { cls: '', style: { color: 'var(--color-text)', borderBottom: `0.08em solid ${accent.value[0]}`, paddingBottom: '0.02em' } }
    default:
      return { cls: '', style: { color: 'var(--color-text)' } }
  }
})

/** All design tokens that cascade as CSS variables: accent, corner radius,
 *  type scale and vertical rhythm. The whole theme reads from these. */
const rootStyle = computed(() => ({
  '--accent-a': accent.value[0],
  '--accent-b': accent.value[1],
  '--radius-card': SHAPES[d.value.shape].card,
  '--radius-field': SHAPES[d.value.shape].field,
  '--vella-type': String(TYPE_SCALES[d.value.typeScale]),
  '--vella-space': String(DENSITIES[d.value.density]),
}))

const sectionPad = 'calc(clamp(80px, 12vh, 140px) * var(--vella-space))'
</script>

<template>
  <div class="relative min-h-screen overflow-x-hidden bg-ink font-sans text-text" :style="rootStyle">
    <!-- L0 atmosphere -->
    <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <template v-if="d.atmosphere === 'glow'">
        <div
          data-load="0"
          data-motion="glow"
          data-opacity="0.5"
          data-drift
          data-follow
          class="absolute -top-[18%] -left-[8%] h-[62vw] w-[62vw] rounded-full blur-[40px]"
          :style="{ background: `radial-gradient(circle, ${accent[0].replace(')', ' / 0.16)')}, transparent 65%)` }"
        />
        <div
          data-load="0"
          data-motion="glow"
          data-opacity="0.5"
          data-drift
          data-follow
          class="absolute top-[24%] -right-[16%] h-[54vw] w-[54vw] rounded-full blur-[40px]"
          :style="{ background: `radial-gradient(circle, ${accent[1].replace(')', ' / 0.14)')}, transparent 65%)` }"
        />
      </template>
      <div v-else-if="d.atmosphere === 'grain'" class="vella-grain absolute inset-0" />
      <div v-else-if="d.atmosphere === 'vignette'" class="absolute inset-0" style="box-shadow: inset 0 0 240px 70px oklch(0 0 0 / 0.55)" />
    </div>

    <!-- L3 nav -->
    <nav
      data-load="0.85"
      data-motion="rise-sm"
      class="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-[clamp(24px,5vw,72px)] py-[22px] backdrop-blur-[6px]"
      style="background: linear-gradient(oklch(0.168 0.018 265 / 0.85), transparent)"
    >
      <span class="eyebrow text-text-dim">{{ story.identity.name }}</span>
      <div class="flex gap-[clamp(14px,2.5vw,34px)]">
        <a
          v-for="s in sections"
          :key="s.id"
          :href="`#${s.id}`"
          data-magnetic
          class="eyebrow text-text-faint no-underline transition-colors duration-250 hover:text-text"
        >{{ s.label }}</a>
      </div>
    </nav>

    <!-- Identity / hero -->
    <header class="relative z-[2] flex min-h-screen flex-col justify-center px-[clamp(24px,6vw,96px)] pt-[120px] pb-16">
      <div class="mx-auto flex w-full max-w-[1180px] flex-col" style="gap: calc(clamp(24px, 3.5vh, 40px) * var(--vella-space))">
        <span data-load="0.15" data-motion="eyebrow" class="eyebrow text-text-faint">{{ eyebrow }}</span>
        <h1
          data-load="0.25"
          data-motion="split"
          class="m-0 leading-[0.96]"
          :style="{ ...displayStyle, fontSize: 'calc(clamp(3.2rem, 2rem + 8vw, 8rem) * var(--vella-type))' }"
        >
          {{ headline.head }}
          <em v-if="headline.accent" :class="[headlineEm.cls, mood.accentItalic ? 'italic' : 'not-italic']" :style="headlineEm.style">{{ headline.accent }}</em>
        </h1>
        <p
          v-if="story.identity.intro"
          data-load="0.55"
          data-motion="rise"
          class="m-0 max-w-[38rem] text-[clamp(1rem,0.96rem+0.2vw,1.0625rem)] leading-[1.6] text-pretty text-text-dim"
        >{{ story.identity.intro }}</p>
        <div data-load="0.75" data-motion="fade" class="flex flex-wrap gap-[clamp(18px,3vw,40px)] pt-2">
          <span v-for="m in story.identity.meta" :key="m" class="font-mono text-[0.85rem] tracking-[0.02em] text-text-faint">{{ m }}</span>
          <span v-if="story.identity.availability" class="font-mono text-[0.85rem] tracking-[0.02em] text-positive">{{ story.identity.availability }}</span>
        </div>
      </div>
    </header>

    <!-- Body sections, in the user's chosen order -->
    <template v-for="s in sections" :key="s.id">
      <!-- About -->
      <section v-if="s.id === 'about'" id="about" class="relative z-[2] px-[clamp(24px,6vw,96px)]" :style="{ paddingBlock: sectionPad }">
        <div class="mx-auto flex max-w-[1180px] flex-col gap-10">
          <div class="flex flex-col gap-3">
            <span data-reveal="fade" class="eyebrow text-text-faint">{{ sectionNumber('about') }} · About</span>
            <div data-reveal="line" class="h-px bg-line" />
          </div>
          <div class="grid items-start gap-[clamp(32px,5vw,72px)] md:grid-cols-[minmax(0,1.6fr)_minmax(220px,1fr)]">
            <div class="flex flex-col gap-8">
              <blockquote
                v-if="story.about.quote"
                data-reveal="split"
                class="m-0 max-w-[24ch] font-display font-light leading-[1.28]"
                :style="{ fontSize: 'calc(clamp(1.6rem, 1.1rem + 2.4vw, 3rem) * var(--vella-type))' }"
              >{{ story.about.quote }}</blockquote>
              <p
                v-if="story.about.body"
                data-reveal="rise"
                class="m-0 max-w-[38rem] text-[clamp(1rem,0.96rem+0.2vw,1.0625rem)] leading-[1.6] text-pretty text-text-dim"
              >{{ story.about.body }}</p>
            </div>
            <figure data-reveal="clip" class="relative m-0 aspect-[3/4] overflow-hidden rounded-card border border-line-soft">
              <div data-media class="media-stripes absolute inset-0 grid place-items-center">
                <span class="eyebrow text-text-faint">Portrait</span>
              </div>
            </figure>
          </div>
        </div>
      </section>

      <!-- Chapters -->
      <section v-else-if="s.id === 'chapters'" id="chapters" class="relative z-[2] px-[clamp(24px,6vw,96px)]" :style="{ paddingBlock: sectionPad }">
        <div class="mx-auto flex max-w-[1180px] flex-col gap-10">
          <div class="flex flex-col gap-3">
            <span data-reveal="fade" class="eyebrow text-text-faint">{{ sectionNumber('chapters') }} · Chapters</span>
            <div data-reveal="line" class="h-px bg-line" />
          </div>
          <div class="flex flex-col">
            <article
              v-for="ch in story.chapters"
              :key="ch.title + ch.period"
              data-reveal="rise"
              class="grid grid-cols-[minmax(140px,220px)_minmax(0,1fr)] gap-[clamp(20px,4vw,64px)] border-b border-line-soft py-[clamp(28px,4vh,44px)]"
            >
              <span data-reveal="slide" class="pt-2 font-mono text-[0.85rem] tracking-[0.02em] text-text-faint">{{ ch.period }}</span>
              <div class="flex flex-col gap-3">
                <h3 class="m-0 font-display text-[clamp(1.5rem,1.1rem+1.4vw,2.2rem)] font-medium leading-[1.1]">{{ ch.title }}</h3>
                <p class="m-0 max-w-[38rem] text-[clamp(1rem,0.96rem+0.2vw,1.0625rem)] leading-[1.6] text-pretty text-text-dim">{{ ch.body }}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- Gallery -->
      <section v-else-if="s.id === 'gallery'" id="gallery" class="relative z-[2] px-[clamp(24px,6vw,96px)]" :style="{ paddingBlock: sectionPad }">
        <div class="mx-auto flex max-w-[1180px] flex-col gap-10">
          <div class="flex flex-col gap-3">
            <span data-reveal="fade" class="eyebrow text-text-faint">{{ sectionNumber('gallery') }} · Gallery</span>
            <div data-reveal="line" class="h-px bg-line" />
          </div>
          <div class="grid items-start gap-[clamp(20px,3vw,36px)]" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))">
            <figure v-for="g in story.gallery" :key="g.slot" class="m-0 flex flex-col gap-3" :style="{ marginTop: `${g.offset || 0}px` }">
              <div
                data-reveal="clip"
                data-parallax="subtle"
                :data-dir="g.dir || 1"
                class="relative overflow-hidden rounded-card border border-line-soft"
                :style="{ aspectRatio: g.ratio || '4 / 3' }"
              >
                <div data-media class="media-stripes absolute inset-0 grid place-items-center">
                  <span class="eyebrow text-text-faint">{{ g.slot }}</span>
                </div>
              </div>
              <figcaption class="font-mono text-[0.74rem] tracking-[0.1em] text-text-faint">{{ g.caption }}</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <!-- Links -->
      <section v-else-if="s.id === 'links'" id="links" class="relative z-[2] px-[clamp(24px,6vw,96px)]" :style="{ paddingBlock: sectionPad }">
        <div class="mx-auto flex max-w-[1180px] flex-col gap-10">
          <div class="flex flex-col gap-3">
            <span data-reveal="fade" class="eyebrow text-text-faint">{{ sectionNumber('links') }} · Links</span>
            <div data-reveal="line" class="h-px bg-line" />
          </div>
          <div class="flex flex-col">
            <a
              v-for="l in story.links"
              :key="l.url + l.label"
              :href="l.url"
              data-reveal="rise"
              data-magnetic
              class="flex items-baseline justify-between gap-6 rounded-field border-b border-line-soft px-2 py-[26px] text-text no-underline transition-colors duration-250 hover:bg-ink-raised"
            >
              <span class="font-display text-[clamp(1.3rem,1rem+1.2vw,1.9rem)]">{{ l.label }}</span>
              <span class="font-mono text-[0.85rem] tracking-[0.02em] text-text-faint">{{ linkHost(l.url) }}</span>
            </a>
          </div>
        </div>
      </section>
    </template>

    <!-- Footer -->
    <footer class="relative z-[2] px-[clamp(24px,6vw,96px)] pt-8 pb-12">
      <div class="mx-auto flex max-w-[1180px] items-center justify-between gap-4">
        <span class="eyebrow text-text-faint">© 2026 {{ story.identity.name }}</span>
        <NuxtLink
          to="/"
          class="eyebrow inline-flex items-center gap-2 text-text-faint no-underline transition-colors duration-250 hover:text-text"
        >
          <span class="bg-accent h-2.5 w-2.5 rounded-[3px]" />
          Made with vella
        </NuxtLink>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.vella-grain {
  background-image: radial-gradient(oklch(1 0 0 / 0.5) 0.5px, transparent 0.5px);
  background-size: 3px 3px;
  opacity: 0.06;
}
</style>
