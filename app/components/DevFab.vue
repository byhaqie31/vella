<script setup lang="ts">
/* Floating dev-only shortcut back to the /dev launcher. Rendered globally from
   app.vue behind an import.meta.dev guard, so it never ships to production.
   Hidden while already on the launcher. */

const route = useRoute()
const onLauncher = computed(() => route.path === '/dev')
</script>

<template>
  <NuxtLink
    v-show="!onLauncher"
    to="/dev"
    aria-label="Open dev launcher"
    title="Dev launcher"
    class="group fixed bottom-5 right-5 z-[9999] flex items-center gap-2 rounded-full border border-line bg-ink-raised/90 py-2 pl-2 pr-2 text-text shadow-[0_18px_40px_-18px_oklch(0_0_0/0.8)] backdrop-blur-md transition-[padding,border-color] hover:border-text-faint hover:pr-4"
  >
    <span class="grid h-8 w-8 place-items-center">
      <svg viewBox="0 0 24 24" class="h-[18px] w-[18px]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 9l-3 3 3 3" />
        <path d="M16 9l3 3-3 3" />
        <path d="M13 7l-2 10" />
      </svg>
    </span>
    <span class="eyebrow max-w-0 overflow-hidden whitespace-nowrap text-text-dim opacity-0 transition-[max-width,opacity] duration-200 group-hover:max-w-[64px] group-hover:opacity-100">
      dev
    </span>
  </NuxtLink>
</template>
