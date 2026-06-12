<script setup lang="ts">
const props = withDefaults(
  defineProps<{ label: string; tone?: 'positive' | 'warning' | 'danger' | 'accent' | 'neutral' }>(),
  { tone: 'neutral' },
)

const TONES = {
  positive: 'text-positive border-positive/35',
  warning: 'text-warning border-warning/35',
  danger: 'text-danger border-danger/35',
  accent: 'border-line text-text-faint',
  neutral: 'border-line text-text-faint',
} as const

const accentStyle = computed(() =>
  props.tone === 'accent' ? { color: 'var(--accent-a)', borderColor: 'color-mix(in oklab, var(--accent-a) 40%, transparent)' } : {},
)
</script>

<template>
  <span
    class="rounded-full border px-2.5 py-[3px] font-mono text-[0.68rem] tracking-[0.08em] whitespace-nowrap"
    :class="TONES[tone]"
    :style="accentStyle"
  >{{ label }}</span>
</template>
