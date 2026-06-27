<script setup lang="ts">
const props = defineProps<{
  steps: { key: string; label: string; done: boolean }[]
  done: number
}>()

const pct = computed(() => (props.steps.length ? (props.done / props.steps.length) * 100 : 0))
</script>

<template>
  <div class="flex flex-col gap-5 rounded-card border border-line-soft bg-ink-raised p-6">
    <div class="flex items-center justify-between gap-4">
      <h2 class="m-0 text-[1.12rem] font-semibold">Get your portfolio live</h2>
      <span class="text-[0.85rem] text-text-faint">{{ done }} of {{ steps.length }} done</span>
    </div>
    <div class="h-1.5 overflow-hidden rounded-full bg-ink-field">
      <div class="h-full rounded-full bg-brand transition-[width] duration-500 ease-out" :style="{ width: `${pct}%` }" />
    </div>
    <ul class="flex flex-col gap-3.5">
      <li v-for="s in steps" :key="s.key" class="flex items-center gap-3">
        <span
          class="grid h-5 w-5 shrink-0 place-items-center rounded-full border"
          :class="s.done ? 'border-positive text-positive' : 'border-line text-transparent'"
        >
          <DashboardIcon v-if="s.done" name="check" :size="13" />
        </span>
        <span class="text-[0.95rem]" :class="s.done ? 'text-text-faint line-through' : 'text-text'">{{ s.label }}</span>
      </li>
    </ul>
  </div>
</template>
