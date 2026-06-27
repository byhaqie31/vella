<script setup lang="ts">
definePageMeta({ layout: 'studio' })
useHead({ title: 'Vella — templates' })

const { templates, isLocked } = useTemplates()
const { site, applyTemplate } = useSite()
const router = useRouter()

const justApplied = ref<string | null>(null)
let appliedT: ReturnType<typeof setTimeout> | undefined

function onApply(key: string) {
  applyTemplate(key)
  justApplied.value = key
  clearTimeout(appliedT)
  appliedT = setTimeout(() => (justApplied.value = null), 2200)
}
function onUpgrade() {
  router.push('/dashboard/billing')
}
</script>

<template>
  <div class="mx-auto flex max-w-[1000px] flex-col gap-6">
    <header class="dash-rise flex flex-col gap-1.5">
      <h1 class="m-0 text-[clamp(1.55rem,1.2rem+1.6vw,2.1rem)] font-bold tracking-[-0.02em]">Templates</h1>
      <p class="m-0 text-[0.96rem] text-text-dim">Every template arrives fully designed. Switch any time, your content stays.</p>
    </header>

    <p v-if="justApplied" class="dash-rise m-0 rounded-field border border-positive/35 bg-ink-raised px-4 py-2.5 text-[0.86rem] text-positive">
      Template applied. Open your site to see it.
    </p>

    <div class="dash-rise grid gap-4" style="animation-delay: 60ms; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))">
      <DashboardTemplateCard
        v-for="t in templates"
        :key="t.key"
        :template="t"
        :locked="isLocked(t)"
        :active="site.templateKey === t.key"
        @apply="onApply(t.key)"
        @upgrade="onUpgrade"
      />
    </div>
  </div>
</template>
