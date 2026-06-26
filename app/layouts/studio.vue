<script setup lang="ts">
const route = useRoute()

const nav = [
  { label: 'Pages', to: '/dashboard' },
  { label: 'Account', to: '/dashboard/account' },
  { label: 'Billing', to: '/dashboard/billing' },
]

const isActive = (to: string) => route.path === to

// Session clearing lands with the auth API — for now logout just returns to sign-in.
async function logout() {
  await navigateTo('/auth')
}
</script>

<template>
  <div class="flex min-h-screen bg-ink font-sans text-text">
    <aside class="sticky top-0 flex h-screen w-[216px] shrink-0 flex-col border-r border-line-soft px-3.5 py-5">
      <NuxtLink to="/" class="flex items-center gap-[11px] px-2.5 pt-1 pb-[18px] text-text no-underline">
        <AppLogo :size="28" wordmark />
      </NuxtLink>
      <nav class="flex flex-col gap-1">
        <NuxtLink
          v-for="n in nav"
          :key="n.to"
          :to="n.to"
          class="flex items-center gap-2.5 rounded-field px-3 py-[9px] text-[0.92rem] no-underline transition-colors"
          :class="isActive(n.to) ? 'bg-ink-card font-medium text-text' : 'text-text-dim hover:bg-ink-raised hover:text-text'"
        >{{ n.label }}</NuxtLink>
      </nav>
      <div class="mt-auto flex flex-col gap-0.5 border-t border-line-soft pt-2.5">
        <div class="flex items-center gap-2.5 px-2.5 pb-1.5">
          <div
            class="h-7 w-7 shrink-0 rounded-full border border-line"
            style="background: repeating-linear-gradient(45deg, oklch(0.225 0.018 265) 0 6px, oklch(0.255 0.018 265) 6px 12px)"
          />
          <div class="flex min-w-0 flex-col">
            <span class="truncate text-[0.82rem] font-medium">Alia Rahman</span>
            <span class="truncate font-mono text-[0.66rem] text-text-faint">Free plan</span>
          </div>
        </div>
        <button
          type="button"
          @click="logout"
          class="rounded-field px-3 py-[9px] text-left text-[0.92rem] text-text-dim transition-colors hover:bg-ink-raised hover:text-text"
        >Log out</button>
      </div>
    </aside>

    <main class="min-w-0 flex-1 px-[clamp(24px,4vw,56px)] pt-[clamp(32px,6vh,56px)] pb-20">
      <slot />
    </main>
  </div>
</template>
