<script setup lang="ts">
const props = withDefaults(defineProps<{ size?: number; wordmark?: boolean }>(), {
  size: 28,
  wordmark: false,
})

const tile = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  borderRadius: `${Math.round(props.size * 0.28)}px`,
  fontSize: `${Math.round(props.size * 0.57)}px`,
}))
</script>

<template>
  <span class="inline-flex items-center gap-[11px]">
    <span class="bg-accent grid place-items-center font-display font-semibold text-ink" :style="tile">v</span>
    <span v-if="wordmark" class="text-[1rem] font-semibold tracking-[-0.01em]">vella</span>
  </span>
</template>
