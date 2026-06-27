<script setup lang="ts">
import type { Template } from '~/data/portal'

defineProps<{ template: Template; locked?: boolean; active?: boolean }>()
defineEmits<{ apply: []; upgrade: [] }>()
</script>

<template>
  <div
    class="flex flex-col overflow-hidden rounded-card border bg-ink-raised transition-colors"
    :class="active ? 'border-brand' : 'border-line-soft hover:border-line'"
  >
    <!-- preview -->
    <div
      class="relative grid h-[150px] place-items-center overflow-hidden"
      :style="{ background: template.dark ? 'var(--color-ink-deep)' : 'var(--color-paper)' }"
    >
      <span class="absolute -top-6 -left-6 h-24 w-24 rounded-full blur-[26px]" :style="{ background: template.accent[0], opacity: 0.55 }" />
      <span class="absolute -right-6 -bottom-6 h-24 w-24 rounded-full blur-[26px]" :style="{ background: template.accent[1], opacity: 0.4 }" />
      <span class="relative text-[2rem]" :style="{ color: template.dark ? 'var(--color-text)' : 'var(--color-paper-ink)' }">Aa</span>
      <span v-if="template.tier === 'pro'" class="absolute top-2.5 right-2.5"><DashboardProBadge /></span>
    </div>

    <!-- body -->
    <div class="flex flex-col gap-3 p-4">
      <div class="flex items-center justify-between gap-2">
        <span class="text-[0.98rem] font-semibold">{{ template.name }}</span>
        <span v-if="active" class="font-mono text-[0.66rem] tracking-[0.08em] text-brand">In use</span>
      </div>
      <span class="text-[0.8rem] text-text-faint">{{ template.tagline }}</span>
      <button
        v-if="locked"
        type="button"
        class="mt-1 inline-flex cursor-pointer items-center justify-center gap-2 rounded-field border border-brand/40 bg-brand-bg py-2 text-[0.85rem] font-medium text-brand transition-[filter] hover:brightness-110"
        @click="$emit('upgrade')"
      >
        <DashboardIcon name="lock" :size="14" /> Unlock with Pro
      </button>
      <button
        v-else
        type="button"
        :disabled="active"
        class="mt-1 rounded-field border py-2 text-[0.85rem] font-medium transition-colors"
        :class="active ? 'cursor-default border-line-soft text-text-faint' : 'cursor-pointer border-line text-text hover:border-text-faint hover:bg-ink-card'"
        @click="$emit('apply')"
      >{{ active ? 'Applied' : 'Apply to my site' }}</button>
    </div>
  </div>
</template>
