<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useEditorStore } from '~/stores/editor'
import { accentPair, splitHeadline, THEMES, TYPE_MOODS } from '~/themes/registry'

const store = useEditorStore()
const { story } = storeToRefs(store)

const theme = computed(() => THEMES[story.value.themeKey])
const mood = computed(() => TYPE_MOODS[story.value.typeMood])
const accent = computed(() => accentPair(story.value.themeKey, story.value.accent))

/** Theme swap is a token/background swap only — the 0.4s transition reads nicely. */
const pv = computed(() =>
  theme.value.dark
    ? {
        bg: 'var(--color-ink)',
        text: 'var(--color-text)',
        dim: 'var(--color-text-dim)',
        faint: 'var(--color-text-faint)',
        line: 'var(--color-line)',
      }
    : {
        bg: 'var(--color-paper)',
        text: 'var(--color-paper-ink)',
        dim: 'var(--color-paper-dim)',
        faint: 'var(--color-paper-faint)',
        line: 'var(--color-paper-line)',
      },
)

const eyebrow = computed(() =>
  [story.value.identity.name, story.value.identity.role, story.value.identity.location]
    .filter(Boolean)
    .join(' · ')
    .toLowerCase(),
)
const headline = computed(() => splitHeadline(story.value.identity.headline))
const chapters = computed(() => story.value.chapters.filter((c) => c.title || c.body))
const links = computed(() => story.value.links.filter((l) => l.label))
</script>

<template>
  <div
    class="overflow-hidden rounded-[14px] border border-line-soft shadow-[0_30px_80px_-30px_oklch(0_0_0/0.7)] transition-[background] duration-[400ms]"
    :style="{ background: pv.bg }"
  >
    <div class="flex flex-col gap-[30px] px-[clamp(28px,5vw,64px)] pt-[clamp(36px,6vw,72px)] pb-[clamp(40px,6vw,72px)]">
      <span class="font-mono text-[0.72rem] tracking-[0.16em]" :style="{ color: pv.faint }">{{ eyebrow }}</span>
      <div
        class="max-w-[16ch] text-[clamp(2.4rem,1.6rem+4vw,4.6rem)] leading-none text-balance"
        :style="{ fontFamily: mood.font, fontWeight: mood.weight, letterSpacing: mood.tracking, color: pv.text }"
      >
        {{ headline.head }}
        <em
          v-if="headline.accent"
          :class="mood.accentItalic ? 'italic' : 'not-italic'"
          :style="{
            background: `linear-gradient(105deg, ${accent[0]}, ${accent[1]})`,
            '-webkit-background-clip': 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }"
        >{{ headline.accent }}</em>
      </div>
      <p v-if="story.about.body" class="m-0 max-w-[36rem] text-base leading-[1.6] text-pretty" :style="{ color: pv.dim }">
        {{ story.about.body }}
      </p>
      <div class="h-px" :style="{ background: pv.line }" />
      <div class="flex flex-col gap-[22px]">
        <div v-for="(ch, i) in chapters" :key="i" class="grid grid-cols-[130px_minmax(0,1fr)] gap-5">
          <span class="pt-1 font-mono text-[0.78rem]" :style="{ color: pv.faint }">{{ ch.period }}</span>
          <div class="flex flex-col gap-1.5">
            <span
              class="text-[1.3rem] leading-[1.15] font-medium"
              :style="{ fontFamily: mood.font, color: pv.text }"
            >{{ ch.title }}</span>
            <span class="text-[0.92rem] leading-[1.55] text-pretty" :style="{ color: pv.dim }">{{ ch.body }}</span>
          </div>
        </div>
      </div>
      <div class="h-px" :style="{ background: pv.line }" />
      <div class="flex flex-wrap gap-2.5">
        <span
          v-for="(l, i) in links"
          :key="i"
          class="rounded-full border px-3.5 py-[7px] font-mono text-[0.76rem]"
          :style="{ borderColor: pv.line, color: pv.dim }"
        >{{ l.label }}</span>
      </div>
    </div>
  </div>
</template>
