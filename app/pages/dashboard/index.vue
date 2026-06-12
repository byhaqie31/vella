<script setup lang="ts">
import { samplePages } from '~/data/sample'
import { THEMES, TYPE_MOODS } from '~/themes/registry'

definePageMeta({ layout: 'studio' })
useHead({ title: 'vella — your pages' })

const cards = samplePages.map((p) => {
  const theme = THEMES[p.story.themeKey]
  const mood = TYPE_MOODS[p.story.typeMood]
  const dark = theme.dark
  return {
    id: p.id,
    name: p.story.identity.name,
    slug: `vella.page/${p.slug}`,
    published: p.story.isPublished,
    views: p.story.isPublished ? p.views : '— views · 30d',
    updated: p.updated,
    themeLine: `${theme.key} · ${p.story.accent}`,
    eyebrow: `${p.story.identity.name} · ${p.story.identity.role}`.toLowerCase(),
    title: p.story.identity.headline,
    preview: {
      background: dark ? 'var(--color-ink-deep)' : 'var(--color-paper)',
      color: dark ? 'var(--color-text)' : 'var(--color-paper-ink)',
      dim: dark ? 'var(--color-text-faint)' : 'var(--color-paper-faint)',
      line: dark ? 'var(--color-line)' : 'var(--color-paper-line)',
      font: mood.font,
      weight: mood.weight,
    },
  }
})
</script>

<template>
  <div class="flex max-w-[980px] flex-col gap-8">
    <header class="flex flex-wrap items-end justify-between gap-6">
      <div class="flex flex-col gap-2">
        <h1 class="m-0 font-display text-[clamp(1.9rem,1.4rem+2vw,2.8rem)] font-normal leading-[1.05] tracking-[-0.01em]">Your pages</h1>
        <p class="m-0 text-[0.95rem] text-text-dim">Two pages, one published. Edits go live the moment you publish.</p>
      </div>
      <NuxtLink
        to="/edit/new"
        class="bg-accent inline-flex items-center rounded-full px-[22px] py-[11px] text-[0.91rem] font-semibold text-ink no-underline transition-[filter] hover:brightness-110"
      >New page</NuxtLink>
    </header>

    <div class="grid gap-5" style="grid-template-columns: repeat(auto-fill, minmax(290px, 1fr))">
      <article
        v-for="pg in cards"
        :key="pg.id"
        class="flex flex-col overflow-hidden rounded-card border border-line-soft bg-ink-raised transition-colors duration-250 hover:border-line"
      >
        <div
          class="flex min-h-[116px] flex-col gap-[9px] px-6 pt-[26px] pb-[30px]"
          :style="{ background: pg.preview.background }"
        >
          <span class="font-mono text-[0.6rem] tracking-[0.16em]" :style="{ color: pg.preview.dim }">{{ pg.eyebrow }}</span>
          <span
            class="text-[1.55rem] leading-none tracking-[-0.02em]"
            :style="{ fontFamily: pg.preview.font, fontWeight: pg.preview.weight, color: pg.preview.color }"
          >{{ pg.title }}</span>
          <div class="mt-[5px] h-px w-[52%]" :style="{ background: pg.preview.line }" />
        </div>
        <div class="flex flex-col gap-3 px-5 pt-4 pb-[18px]">
          <div class="flex items-center justify-between gap-3">
            <span class="text-[0.98rem] font-semibold">{{ pg.name }}</span>
            <StatusPill :label="pg.published ? 'published' : 'draft'" :tone="pg.published ? 'positive' : 'warning'" />
          </div>
          <div class="flex items-center gap-3.5 font-mono text-[0.74rem] text-text-faint">
            <span>{{ pg.slug }}</span>
            <span class="ml-auto">{{ pg.views }}</span>
          </div>
          <div class="flex items-center gap-3.5 font-mono text-[0.74rem] text-text-faint">
            <span>{{ pg.themeLine }}</span>
            <span class="ml-auto">{{ pg.updated }}</span>
          </div>
          <div class="flex gap-2.5 pt-0.5">
            <NuxtLink
              :to="`/edit/${pg.id}`"
              class="flex-1 rounded-field border border-line py-[9px] text-center text-[0.86rem] font-medium text-text no-underline transition-colors hover:border-text-faint hover:bg-ink-card"
            >Edit</NuxtLink>
            <NuxtLink
              :to="`/u/${pg.id}`"
              class="flex-1 rounded-field border border-line py-[9px] text-center text-[0.86rem] font-medium text-text no-underline transition-colors hover:border-text-faint hover:bg-ink-card"
            >View</NuxtLink>
          </div>
        </div>
      </article>

      <NuxtLink
        to="/edit/new"
        class="flex min-h-[280px] flex-col items-center justify-center gap-2.5 rounded-card border border-dashed border-line text-text-faint no-underline transition-colors duration-250 hover:border-text-faint hover:text-text"
      >
        <span class="text-[1.6rem] leading-none font-normal">+</span>
        <span class="font-mono text-[0.78rem] tracking-[0.12em]">new page</span>
      </NuxtLink>
    </div>
  </div>
</template>
