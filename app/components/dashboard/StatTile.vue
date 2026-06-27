<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    value?: string | number | null
    tone?: 'default' | 'warning' | 'positive'
  }>(),
  { value: null, tone: 'default' },
)

const isEmpty = (v: unknown) => v === null || v === undefined || v === ''
</script>

<template>
  <div class="flex flex-col gap-2 rounded-card border border-line-soft bg-ink-raised px-5 py-[18px]">
    <span class="text-[0.82rem] text-text-faint">{{ label }}</span>
    <span
      class="text-[1.35rem] leading-none font-semibold"
      :class="{ 'text-warning': tone === 'warning', 'text-positive': tone === 'positive', 'text-text-faint': isEmpty(value) }"
    >{{ isEmpty(value) ? '—' : value }}</span>
  </div>
</template>
