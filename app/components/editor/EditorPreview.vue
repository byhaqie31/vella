<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useEditorStore } from '~/stores/editor'
import { DENSITIES, resolveAccent, SHAPES, splitHeadline, THEMES, TYPE_MOODS, TYPE_SCALES } from '~/themes/registry'

const store = useEditorStore()
const { story } = storeToRefs(store)

const design = computed(() => story.value.design)
const theme = computed(() => THEMES[story.value.themeKey])
const mood = computed(() => TYPE_MOODS[story.value.typeMood])
const accent = computed(() => resolveAccent(story.value.themeKey, story.value))
const scale = computed(() => TYPE_SCALES[design.value.typeScale])
const space = computed(() => DENSITIES[design.value.density])
const shape = computed(() => SHAPES[design.value.shape])

/** Theme swap is a token/background swap only — the transition reads nicely. */
const pv = computed(() =>
  theme.value.dark
    ? { bg: 'var(--color-ink)', text: 'var(--color-text)', dim: 'var(--color-text-dim)', faint: 'var(--color-text-faint)', line: 'var(--color-line)', card: 'var(--color-ink-raised)' }
    : { bg: 'var(--color-paper)', text: 'var(--color-paper-ink)', dim: 'var(--color-paper-dim)', faint: 'var(--color-paper-faint)', line: 'var(--color-paper-line)', card: 'oklch(0.94 0.008 95)' },
)

const eyebrow = computed(() =>
  [story.value.identity.name, story.value.identity.role, story.value.identity.location].filter(Boolean).join(' · ').toLowerCase(),
)
const headline = computed(() => splitHeadline(story.value.identity.headline))

/** The accented display word, treated per the user's headline-accent choice. */
const emStyle = computed(() => {
  const [a, b] = accent.value
  switch (design.value.headlineAccent) {
    case 'gradient':
      return { background: `linear-gradient(105deg, ${a}, ${b})`, '-webkit-background-clip': 'text', backgroundClip: 'text', color: 'transparent' }
    case 'solid':
      return { color: a }
    case 'underline':
      return { color: pv.value.text, borderBottom: `0.08em solid ${a}`, paddingBottom: '0.02em' }
    default:
      return { color: pv.value.text }
  }
})

const chapters = computed(() => story.value.chapters.filter((c) => c.title || c.body))
const links = computed(() => story.value.links.filter((l) => l.label))
const gallery = computed(() => story.value.gallery)
const hasAbout = computed(() => !!(story.value.about.quote || story.value.about.body))

/** Visible sections, in the user's order. */
const orderedSections = computed(() => design.value.sections.filter((s) => s.visible))

/** Atmosphere layer behind the content. */
const atmos = computed(() => design.value.atmosphere)

const rootStyle = computed(() => ({
  background: pv.value.bg,
  '--accent-a': accent.value[0],
  '--accent-b': accent.value[1],
  '--pv-scale': String(scale.value),
  '--pv-space': String(space.value),
  '--pv-radius': shape.value.card,
}))
</script>

<template>
  <div
    class="pv-frame relative overflow-hidden rounded-[14px] border border-line-soft shadow-[0_30px_80px_-30px_oklch(0_0_0/0.7)] transition-[background] duration-[400ms]"
    :style="rootStyle"
  >
    <!-- atmosphere -->
    <div class="pointer-events-none absolute inset-0">
      <template v-if="atmos === 'glow'">
        <span class="absolute -top-[12%] -left-[8%] h-[55%] w-[55%] rounded-full blur-[36px]" :style="{ background: `radial-gradient(circle, ${accent[0].replace(')', ' / 0.22)')}, transparent 65%)` }" />
        <span class="absolute top-[20%] -right-[12%] h-[50%] w-[50%] rounded-full blur-[36px]" :style="{ background: `radial-gradient(circle, ${accent[1].replace(')', ' / 0.18)')}, transparent 65%)` }" />
      </template>
      <span v-else-if="atmos === 'grain'" class="pv-grain absolute inset-0" :style="{ opacity: theme.dark ? 0.5 : 0.4 }" />
      <span v-else-if="atmos === 'vignette'" class="absolute inset-0" :style="{ boxShadow: theme.dark ? 'inset 0 0 120px 28px oklch(0 0 0 / 0.55)' : 'inset 0 0 120px 28px oklch(0.4 0.01 95 / 0.18)' }" />
    </div>

    <div class="pv-stack relative flex flex-col px-[clamp(28px,5vw,60px)]">
      <!-- hero -->
      <header class="pv-hero flex flex-col">
        <span class="font-mono text-[0.72rem] tracking-[0.16em]" :style="{ color: pv.faint }">{{ eyebrow || 'your name · role · place' }}</span>
        <h2
          class="pv-headline m-0 max-w-[16ch] text-balance"
          :style="{ fontFamily: mood.font, fontWeight: mood.weight, letterSpacing: mood.tracking, color: pv.text }"
        >
          {{ headline.head || 'Your headline goes here' }}
          <em v-if="headline.accent" :class="mood.accentItalic ? 'italic' : 'not-italic'" :style="emStyle">{{ headline.accent }}</em>
        </h2>
        <p v-if="story.identity.intro" class="m-0 max-w-[34rem] text-[0.95rem] leading-[1.6] text-pretty" :style="{ color: pv.dim }">{{ story.identity.intro }}</p>
        <div v-if="story.identity.meta.length || story.identity.availability" class="flex flex-wrap gap-x-5 gap-y-1.5">
          <span v-for="m in story.identity.meta" :key="m" class="font-mono text-[0.74rem]" :style="{ color: pv.faint }">{{ m }}</span>
          <span v-if="story.identity.availability" class="font-mono text-[0.74rem] text-positive">{{ story.identity.availability }}</span>
        </div>
      </header>

      <!-- body sections, in the user's order -->
      <template v-for="s in orderedSections" :key="s.id">
        <!-- about -->
        <section v-if="s.id === 'about' && hasAbout" class="pv-section flex flex-col">
          <div class="pv-divider h-px" :style="{ background: pv.line }" />
          <span class="pv-eyebrow font-mono text-[0.68rem] tracking-[0.16em]" :style="{ color: pv.faint }">about</span>
          <blockquote v-if="story.about.quote" class="pv-quote m-0 max-w-[26ch]" :style="{ fontFamily: mood.font, color: pv.text }">{{ story.about.quote }}</blockquote>
          <p v-if="story.about.body" class="m-0 max-w-[34rem] text-[0.92rem] leading-[1.6] text-pretty" :style="{ color: pv.dim }">{{ story.about.body }}</p>
        </section>

        <!-- chapters -->
        <section v-else-if="s.id === 'chapters' && chapters.length" class="pv-section flex flex-col">
          <div class="pv-divider h-px" :style="{ background: pv.line }" />
          <span class="pv-eyebrow font-mono text-[0.68rem] tracking-[0.16em]" :style="{ color: pv.faint }">chapters</span>
          <div class="pv-rows flex flex-col">
            <div v-for="(ch, i) in chapters" :key="i" class="grid grid-cols-[96px_minmax(0,1fr)] gap-4">
              <span class="pt-1 font-mono text-[0.72rem]" :style="{ color: pv.faint }">{{ ch.period }}</span>
              <div class="flex flex-col gap-1">
                <span class="pv-ch-title leading-[1.15] font-medium" :style="{ fontFamily: mood.font, color: pv.text }">{{ ch.title }}</span>
                <span class="text-[0.88rem] leading-[1.55] text-pretty" :style="{ color: pv.dim }">{{ ch.body }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- gallery -->
        <section v-else-if="s.id === 'gallery' && gallery.length" class="pv-section flex flex-col">
          <div class="pv-divider h-px" :style="{ background: pv.line }" />
          <span class="pv-eyebrow font-mono text-[0.68rem] tracking-[0.16em]" :style="{ color: pv.faint }">gallery</span>
          <div class="grid gap-2.5" style="grid-template-columns: repeat(auto-fill, minmax(96px, 1fr))">
            <div
              v-for="(m, i) in gallery"
              :key="m.slot + i"
              class="relative grid aspect-[4/5] place-items-center overflow-hidden border"
              :style="{
                borderRadius: 'var(--pv-radius)',
                borderColor: pv.line,
                background: theme.dark
                  ? 'repeating-linear-gradient(45deg, oklch(0.225 0.018 265) 0 8px, oklch(0.255 0.018 265) 8px 16px)'
                  : 'repeating-linear-gradient(45deg, oklch(0.93 0.008 95) 0 8px, oklch(0.9 0.008 95) 8px 16px)',
              }"
            >
              <span class="px-1 text-center font-mono text-[0.58rem] leading-tight tracking-[0.04em]" :style="{ color: pv.faint }">{{ m.slot }}</span>
            </div>
          </div>
        </section>

        <!-- links -->
        <section v-else-if="s.id === 'links' && links.length" class="pv-section flex flex-col">
          <div class="pv-divider h-px" :style="{ background: pv.line }" />
          <span class="pv-eyebrow font-mono text-[0.68rem] tracking-[0.16em]" :style="{ color: pv.faint }">links</span>
          <div class="flex flex-col">
            <div
              v-for="(l, i) in links"
              :key="i"
              class="flex items-baseline justify-between gap-4 border-b py-2.5"
              :style="{ borderColor: pv.line }"
            >
              <span class="text-[0.98rem]" :style="{ fontFamily: mood.font, color: pv.text }">{{ l.label }}</span>
              <span class="font-mono text-[0.72rem]" :style="{ color: pv.faint }">{{ l.url.replace(/^(https?:\/\/|mailto:)/, '').replace(/\/$/, '') }}</span>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* Every structural measurement reads --pv-scale (type) and --pv-space (rhythm),
   so the whole preview breathes with the user's density and scale choices and
   stays in proportion at any combination. */
.pv-stack {
  padding-top: calc(40px * var(--pv-space, 1));
  padding-bottom: calc(44px * var(--pv-space, 1));
  gap: calc(30px * var(--pv-space, 1));
}
.pv-hero {
  gap: calc(18px * var(--pv-space, 1));
}
.pv-section {
  gap: calc(18px * var(--pv-space, 1));
}
.pv-rows {
  gap: calc(20px * var(--pv-space, 1));
}
.pv-divider {
  margin-bottom: calc(2px * var(--pv-space, 1));
}
.pv-headline {
  font-size: calc(clamp(2rem, 1.3rem + 3.4vw, 3.7rem) * var(--pv-scale, 1));
  line-height: 1;
}
.pv-quote {
  font-size: calc(1.45rem * var(--pv-scale, 1));
  font-weight: 300;
  line-height: 1.3;
}
.pv-ch-title {
  font-size: calc(1.2rem * var(--pv-scale, 1));
}
.pv-grain {
  background-image: radial-gradient(oklch(1 0 0 / 0.5) 0.5px, transparent 0.5px);
  background-size: 3px 3px;
}
</style>
