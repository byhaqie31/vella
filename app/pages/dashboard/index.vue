<script setup lang="ts">
definePageMeta({ layout: 'studio' })
useHead({ title: 'Vella — home' })

const { user } = useAuth()
const { site, setup, setupDone, publicUrl, isPublished, publish } = useSite()

const quickActions = [
  { label: 'Add project', icon: 'plus', to: `/edit/${site.value.id}` },
  { label: 'Switch template', icon: 'grid', to: '/dashboard/templates' },
  { label: 'Connect domain', icon: 'globe', to: '/dashboard/domains' },
]
</script>

<template>
  <div class="mx-auto flex max-w-[860px] flex-col gap-6">
    <header class="dash-rise flex flex-col gap-1.5">
      <h1 class="m-0 text-[clamp(1.55rem,1.2rem+1.6vw,2.1rem)] font-bold tracking-[-0.02em]">Welcome back, {{ user.name }}</h1>
      <p class="m-0 text-[0.96rem] text-text-dim">
        <template v-if="isPublished">Your site is live at <span class="text-text">{{ publicUrl }}</span>.</template>
        <template v-else>Your site is in draft. Finish setup to go live.</template>
      </p>
    </header>

    <div class="dash-rise" style="animation-delay: 60ms">
      <DashboardSetupChecklist :steps="setup" :done="setupDone" />
    </div>

    <div class="dash-rise" style="animation-delay: 110ms">
      <DashboardSiteCard :site="site" />
    </div>

    <div class="dash-rise grid grid-cols-2 gap-3.5 sm:grid-cols-3" style="animation-delay: 160ms">
      <DashboardStatTile label="Views (7d)" :value="site.views7d" />
      <DashboardStatTile label="Visitors (7d)" :value="site.visitors7d" />
      <DashboardStatTile label="Status" :value="isPublished ? 'Live' : 'Not live'" :tone="isPublished ? 'positive' : 'warning'" />
    </div>

    <div class="dash-rise flex flex-col gap-4 rounded-card border border-line-soft bg-ink-raised p-6" style="animation-delay: 210ms">
      <h2 class="m-0 text-[1.05rem] font-semibold">Quick actions</h2>
      <div class="flex flex-wrap gap-2.5">
        <NuxtLink
          v-for="a in quickActions"
          :key="a.label"
          :to="a.to"
          class="inline-flex items-center gap-2 rounded-field border border-line px-4 py-2.5 text-[0.88rem] font-medium text-text no-underline transition-colors hover:border-text-faint hover:bg-ink-card"
        >
          <DashboardIcon :name="a.icon" :size="16" /> {{ a.label }}
        </NuxtLink>
        <button
          v-if="!isPublished"
          type="button"
          class="inline-flex cursor-pointer items-center gap-2 rounded-field border border-brand/40 bg-brand-bg px-4 py-2.5 text-[0.88rem] font-medium text-brand transition-[filter] hover:brightness-110"
          @click="publish"
        >
          <DashboardIcon name="rocket" :size="16" /> Publish
        </button>
        <NuxtLink
          v-else
          :to="`/${site.handle}`"
          target="_blank"
          class="inline-flex items-center gap-2 rounded-field border border-brand/40 bg-brand-bg px-4 py-2.5 text-[0.88rem] font-medium text-brand no-underline transition-[filter] hover:brightness-110"
        >
          <DashboardIcon name="external" :size="16" /> View live
        </NuxtLink>
      </div>
    </div>

    <div class="dash-rise flex justify-center pt-1" style="animation-delay: 260ms">
      <span class="grid h-9 w-9 place-items-center rounded-full border border-line-soft text-text-faint">
        <DashboardIcon name="arrow-down" :size="16" />
      </span>
    </div>
  </div>
</template>
