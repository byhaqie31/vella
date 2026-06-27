<script setup lang="ts">
/** The logged-in dashboard shell: a full-width top bar + a left sidebar.
 *  Matches the portal mockup (brand · plan badge · bell · avatar, then the
 *  Home / My site / Templates / Domains / Analytics / Settings / Billing nav). */
const route = useRoute()
const { user, logout } = useAuth()

const nav = [
  { label: 'Home', to: '/dashboard', icon: 'home' },
  { label: 'My site', to: '/dashboard/my-site', icon: 'edit' },
  { label: 'Templates', to: '/dashboard/templates', icon: 'grid' },
  { label: 'Domains', to: '/dashboard/domains', icon: 'globe' },
  { label: 'Analytics', to: '/dashboard/analytics', icon: 'chart' },
  { label: 'Settings', to: '/dashboard/settings', icon: 'settings' },
  { label: 'Billing', to: '/dashboard/billing', icon: 'card' },
]
const isActive = (to: string) => (to === '/dashboard' ? route.path === to : route.path.startsWith(to))
const isPro = computed(() => user.value.plan === 'pro')
</script>

<template>
  <div class="flex min-h-screen flex-col bg-ink font-sans text-text">
    <!-- top bar -->
    <header class="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-line-soft bg-ink/85 px-[clamp(16px,3vw,32px)] py-3 backdrop-blur-md">
      <NuxtLink to="/dashboard" class="flex items-baseline gap-2.5 text-text no-underline">
        <span class="text-[1.18rem] font-semibold tracking-[-0.01em]">Vella</span>
        <span class="hidden text-[0.82rem] text-text-faint sm:inline">portfolio builder</span>
      </NuxtLink>
      <div class="flex items-center gap-2.5">
        <NuxtLink
          to="/dashboard/billing"
          class="rounded-full border border-brand/40 bg-brand-bg px-3 py-[5px] text-[0.74rem] font-medium text-brand no-underline transition-[filter] hover:brightness-110"
        >{{ isPro ? 'Pro plan' : 'Free plan' }}</NuxtLink>
        <button
          type="button"
          aria-label="Notifications"
          class="grid h-9 w-9 place-items-center rounded-full border border-line text-text-dim transition-colors hover:border-text-faint hover:text-text"
        >
          <DashboardIcon name="bell" :size="17" />
        </button>
        <NuxtLink
          to="/dashboard/settings"
          class="grid h-9 w-9 place-items-center rounded-full bg-brand-bg text-[0.85rem] font-semibold text-brand no-underline"
        >{{ user.initial }}</NuxtLink>
      </div>
    </header>

    <!-- mobile nav strip -->
    <nav class="flex gap-1.5 overflow-x-auto border-b border-line-soft px-4 py-2 md:hidden">
      <NuxtLink
        v-for="n in nav"
        :key="n.to"
        :to="n.to"
        class="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.82rem] no-underline transition-colors"
        :class="isActive(n.to) ? 'bg-brand-bg text-brand' : 'text-text-dim'"
      >
        <DashboardIcon :name="n.icon" :size="15" />
        {{ n.label }}
      </NuxtLink>
    </nav>

    <div class="mx-auto flex w-full max-w-[1280px] flex-1">
      <!-- sidebar -->
      <aside class="sticky top-[57px] hidden h-[calc(100vh-57px)] w-[214px] shrink-0 flex-col justify-between border-r border-line-soft px-3 py-5 md:flex">
        <nav class="flex flex-col gap-1">
          <NuxtLink
            v-for="n in nav"
            :key="n.to"
            :to="n.to"
            class="flex items-center gap-3 rounded-field px-3 py-[9px] text-[0.92rem] no-underline transition-colors"
            :class="isActive(n.to) ? 'bg-brand-bg font-medium text-brand' : 'text-text-dim hover:bg-ink-raised hover:text-text'"
          >
            <DashboardIcon :name="n.icon" :size="18" />
            {{ n.label }}
          </NuxtLink>
        </nav>
        <button
          type="button"
          class="flex items-center gap-3 rounded-field px-3 py-[9px] text-left text-[0.9rem] text-text-dim transition-colors hover:bg-ink-raised hover:text-text"
          @click="logout"
        >
          <DashboardIcon name="logout" :size="18" />
          Log out
        </button>
      </aside>

      <main class="min-w-0 flex-1 px-[clamp(18px,4vw,48px)] pt-[clamp(24px,5vh,44px)] pb-24">
        <slot />
      </main>
    </div>
  </div>
</template>
