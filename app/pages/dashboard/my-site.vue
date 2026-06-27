<script setup lang="ts">
definePageMeta({ layout: 'studio' })
useHead({ title: 'Vella — my site' })

const { user } = useAuth()
const { site, publicUrl, isPublished, setHandle, publish, unpublish } = useSite()

const SECTION_LABELS: Record<string, string> = { about: 'About', chapters: 'Chapters', gallery: 'Gallery', links: 'Links' }
const sections = computed(() => site.value.story.design.sections.map((s) => ({ id: s.id, label: SECTION_LABELS[s.id] ?? s.id, visible: s.visible })))

const isPro = computed(() => user.value.plan === 'pro')
</script>

<template>
  <div class="mx-auto flex max-w-[860px] flex-col gap-6">
    <header class="dash-rise flex flex-col gap-1.5">
      <h1 class="m-0 text-[clamp(1.55rem,1.2rem+1.6vw,2.1rem)] font-bold tracking-[-0.02em]">My site</h1>
      <p class="m-0 text-[0.96rem] text-text-dim">Adjust your pages, address, and what's live.</p>
    </header>

    <div class="dash-rise" style="animation-delay: 60ms">
      <DashboardSiteCard :site="site" />
    </div>

    <!-- address + status -->
    <section class="dash-rise flex flex-col gap-4 rounded-card border border-line-soft bg-ink-raised p-6" style="animation-delay: 110ms">
      <h2 class="m-0 text-[1.05rem] font-semibold">Address &amp; status</h2>
      <label class="flex flex-col gap-1.5">
        <span class="text-[0.82rem] text-text-dim">Page address</span>
        <div class="flex items-center overflow-hidden rounded-field border border-line bg-ink-field">
          <input
            :value="site.handle"
            class="min-w-0 flex-1 border-none bg-transparent py-2.5 pr-1 pl-3 font-mono text-[0.85rem] text-text outline-none"
            @input="setHandle(($event.target as HTMLInputElement).value)"
          >
          <span class="py-2.5 pr-3 font-mono text-[0.85rem] text-text-faint">.vella.site</span>
        </div>
      </label>
      <div class="flex flex-wrap items-center justify-between gap-3 border-t border-line-soft pt-4">
        <div class="flex items-center gap-2.5">
          <StatusPill :label="isPublished ? 'Published' : 'Draft'" :tone="isPublished ? 'positive' : 'warning'" />
          <span class="text-[0.85rem] text-text-dim">{{ isPublished ? `Live at ${publicUrl}` : 'Not visible to anyone yet' }}</span>
        </div>
        <button
          v-if="!isPublished"
          type="button"
          class="inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-[0.88rem] font-semibold text-ink transition-[filter] hover:brightness-110"
          @click="publish"
        >
          <DashboardIcon name="rocket" :size="16" /> Publish
        </button>
        <button
          v-else
          type="button"
          class="cursor-pointer rounded-full border border-line bg-transparent px-5 py-2.5 text-[0.88rem] font-medium text-text transition-colors hover:border-text-faint"
          @click="unpublish"
        >Unpublish</button>
      </div>
    </section>

    <!-- pages / sections -->
    <section class="dash-rise flex flex-col gap-4 rounded-card border border-line-soft bg-ink-raised p-6" style="animation-delay: 160ms">
      <div class="flex items-center justify-between gap-3">
        <h2 class="m-0 text-[1.05rem] font-semibold">Pages &amp; sections</h2>
        <NuxtLink
          :to="`/edit/${site.id}`"
          class="inline-flex items-center gap-2 rounded-field border border-line px-3.5 py-2 text-[0.84rem] font-medium text-text no-underline transition-colors hover:border-text-faint hover:bg-ink-card"
        >
          <DashboardIcon name="edit" :size="15" /> Edit content
        </NuxtLink>
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-3 rounded-field border border-line-soft bg-ink px-4 py-2.5 opacity-70">
          <span class="font-mono text-[0.66rem] tracking-[0.08em] text-text-faint">00</span>
          <span class="text-[0.9rem] font-medium text-text-dim">Identity</span>
          <span class="ml-auto font-mono text-[0.62rem] text-text-faint">Always first</span>
        </div>
        <div
          v-for="(s, i) in sections"
          :key="s.id"
          class="flex items-center gap-3 rounded-field border border-line-soft bg-ink px-4 py-2.5"
          :class="{ 'opacity-50': !s.visible }"
        >
          <span class="font-mono text-[0.66rem] tracking-[0.08em] text-text-faint">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="text-[0.9rem] font-medium">{{ s.label }}</span>
          <span class="ml-auto text-text-faint">
            <DashboardIcon :name="s.visible ? 'eye' : 'lock'" :size="15" />
          </span>
        </div>
      </div>
      <p class="m-0 text-[0.8rem] text-text-faint">Reorder, hide, and restyle sections in the editor's Design tab.</p>
    </section>

    <!-- add another page (pro) -->
    <section class="dash-rise" style="animation-delay: 210ms">
      <NuxtLink
        :to="isPro ? `/edit/${site.id}` : '/dashboard/billing'"
        class="flex items-center justify-center gap-2.5 rounded-card border border-dashed border-line py-6 text-text-faint no-underline transition-colors hover:border-text-faint hover:text-text"
      >
        <DashboardIcon name="plus" :size="17" />
        <span class="text-[0.9rem] font-medium">Add another page</span>
        <DashboardProBadge v-if="!isPro" />
      </NuxtLink>
    </section>
  </div>
</template>
