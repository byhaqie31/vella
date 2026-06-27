<script setup lang="ts">
const props = defineProps<{ label: string; used: number; limit: number | null }>()

const pct = computed(() =>
  props.limit === null ? 100 : Math.min(100, Math.round((props.used / props.limit) * 100)),
)
const limitText = computed(() => (props.limit === null ? 'Unlimited' : props.limit))
const full = computed(() => props.limit !== null && props.used >= props.limit)
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center justify-between text-[0.85rem]">
      <span class="text-text-dim">{{ label }}</span>
      <span class="font-mono text-[0.78rem] text-text-faint">{{ used }} / {{ limitText }}</span>
    </div>
    <div class="h-1.5 overflow-hidden rounded-full bg-ink-field">
      <div class="h-full rounded-full transition-[width] duration-500" :class="full ? 'bg-warning' : 'bg-brand'" :style="{ width: `${pct}%` }" />
    </div>
  </div>
</template>
