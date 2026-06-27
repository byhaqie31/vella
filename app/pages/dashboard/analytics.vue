<script setup lang="ts">
definePageMeta({ layout: 'studio' })
useHead({ title: 'Vella — analytics' })

const { site, isPublished } = useSite()

// Placeholder weekly bars — flat/empty until the site is live and real tracking lands.
const bars = [38, 52, 30, 64, 48, 72, 40]
</script>

<template>
  <div class="mx-auto flex max-w-[860px] flex-col gap-6">
    <header class="dash-rise flex flex-col gap-1.5">
      <h1 class="m-0 text-[clamp(1.55rem,1.2rem+1.6vw,2.1rem)] font-bold tracking-[-0.02em]">Analytics</h1>
      <p class="m-0 text-[0.96rem] text-text-dim">How your site is doing across the last 7 days.</p>
    </header>

    <div class="dash-rise grid grid-cols-2 gap-3.5 sm:grid-cols-4" style="animation-delay: 60ms">
      <DashboardStatTile label="Views (7d)" :value="site.views7d" />
      <DashboardStatTile label="Visitors (7d)" :value="site.visitors7d" />
      <DashboardStatTile label="Avg. time" :value="null" />
      <DashboardStatTile label="Top referrer" :value="null" />
    </div>

    <section class="dash-rise flex flex-col gap-5 rounded-card border border-line-soft bg-ink-raised p-6" style="animation-delay: 110ms">
      <div class="flex items-center justify-between gap-3">
        <h2 class="m-0 text-[1.05rem] font-semibold">Views over time</h2>
        <span class="font-mono text-[0.72rem] text-text-faint">Last 7 days</span>
      </div>
      <div class="relative flex h-[160px] items-end gap-2.5" :class="{ 'opacity-30': !isPublished }">
        <div v-for="(b, i) in bars" :key="i" class="flex-1 rounded-t-[5px] bg-brand/35" :style="{ height: `${b}%` }" />
      </div>
      <p v-if="!isPublished" class="m-0 flex items-center gap-2 text-[0.86rem] text-text-faint">
        <DashboardIcon name="chart" :size="15" />
        Analytics start collecting once your site is published.
      </p>
    </section>

    <section class="dash-rise flex flex-col gap-4 rounded-card border border-line-soft bg-ink-raised p-6" style="animation-delay: 160ms">
      <h2 class="m-0 text-[1.05rem] font-semibold">Top pages</h2>
      <div class="flex items-center justify-between border-b border-line-soft/60 py-2.5">
        <span class="font-mono text-[0.85rem]">{{ site.handle }}.vella.site</span>
        <span class="font-mono text-[0.8rem] text-text-faint">—</span>
      </div>
      <p class="m-0 text-[0.84rem] text-text-faint">Per-page breakdowns appear here once there's traffic.</p>
    </section>
  </div>
</template>
