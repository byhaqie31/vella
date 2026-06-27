<script setup lang="ts">
import type { PortalSite } from '~/data/portal'
import { timeAgo } from '~/data/portal'
import { resolveAccent, THEMES, TYPE_MOODS } from '~/themes/registry'

const props = defineProps<{ site: PortalSite }>()

const dark = computed(() => THEMES[props.site.themeKey].dark)
const accent = computed(() => resolveAccent(props.site.themeKey, props.site.story))
const mood = computed(() => TYPE_MOODS[props.site.story.typeMood])
</script>

<template>
  <div class="flex flex-col gap-5 rounded-card border border-line-soft bg-ink-raised p-5 sm:flex-row sm:items-center">
    <!-- mini preview -->
    <div
      class="relative h-[124px] w-full shrink-0 overflow-hidden rounded-xl border border-line-soft sm:w-[188px]"
      :style="{ background: dark ? 'var(--color-ink-deep)' : 'var(--color-paper)' }"
    >
      <span class="absolute -top-5 -left-5 h-20 w-20 rounded-full blur-[20px]" :style="{ background: accent[0], opacity: 0.5 }" />
      <span class="absolute right-3 bottom-3 left-3 text-[0.98rem] leading-[1.15]"
        :style="{ fontFamily: mood.font, fontWeight: mood.weight, color: dark ? 'var(--color-text)' : 'var(--color-paper-ink)' }"
      >{{ site.story.identity.headline }}</span>
    </div>

    <!-- meta + actions -->
    <div class="flex min-w-0 flex-1 flex-col gap-3">
      <div class="flex flex-wrap items-center gap-2.5">
        <span class="font-mono text-[0.92rem]">{{ site.handle }}.vella.site</span>
        <StatusPill
          :label="site.status === 'published' ? 'Published' : 'Draft'"
          :tone="site.status === 'published' ? 'positive' : 'warning'"
        />
      </div>
      <span class="text-[0.82rem] text-text-faint">Last edited {{ timeAgo(site.lastEditedAt) }}</span>
      <div class="flex flex-wrap gap-2.5 pt-0.5">
        <NuxtLink
          :to="`/edit/${site.id}`"
          class="inline-flex items-center gap-2 rounded-field border border-line px-4 py-2 text-[0.86rem] font-medium text-text no-underline transition-colors hover:border-text-faint hover:bg-ink-card"
        >
          <DashboardIcon name="edit" :size="15" /> Edit site
        </NuxtLink>
        <NuxtLink
          :to="`/${site.handle}`"
          target="_blank"
          class="inline-flex items-center gap-2 rounded-field border border-line px-4 py-2 text-[0.86rem] font-medium text-text no-underline transition-colors hover:border-text-faint hover:bg-ink-card"
        >
          <DashboardIcon name="eye" :size="15" /> Preview
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
