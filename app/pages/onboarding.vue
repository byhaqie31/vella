<script setup lang="ts">
definePageMeta({ layout: 'auth' })
useHead({ title: 'Vella — get started' })

const { user } = useAuth()
const { site, setHandle, applyTemplate } = useSite()
const { templates, isLocked } = useTemplates()

const handle = ref(site.value.handle)
const selected = ref(site.value.templateKey)

function choose(key: string, locked: boolean) {
  if (locked) return
  selected.value = key
}

function finish() {
  setHandle(handle.value || 'me')
  applyTemplate(selected.value)
  return navigateTo('/dashboard')
}
</script>

<template>
  <div class="grid min-h-screen place-items-center p-6">
    <div class="dash-rise flex w-[min(720px,100%)] flex-col gap-7 py-10">
      <div class="flex flex-col items-center gap-3 text-center">
        <AppLogo :size="34" />
        <h1 class="m-0 text-[1.7rem] font-bold tracking-[-0.01em]">Welcome, {{ user.name }}</h1>
        <p class="m-0 text-[0.95rem] text-text-dim">Pick an address and a starting template. You can change both later.</p>
      </div>

      <!-- handle -->
      <div class="flex flex-col gap-2">
        <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">Your address</span>
        <div class="flex items-center overflow-hidden rounded-field border border-line bg-ink-field">
          <input
            v-model="handle"
            placeholder="yourname"
            class="min-w-0 flex-1 border-none bg-transparent py-3 pr-1 pl-3.5 font-mono text-[0.95rem] text-text outline-none"
          >
          <span class="py-3 pr-3.5 font-mono text-[0.9rem] text-text-faint">.vella.site</span>
        </div>
      </div>

      <!-- templates -->
      <div class="flex flex-col gap-3">
        <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">Starting template</span>
        <div class="grid gap-3" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))">
          <button
            v-for="t in templates"
            :key="t.key"
            type="button"
            class="group flex flex-col overflow-hidden rounded-card border text-left transition-colors"
            :class="[
              selected === t.key ? 'border-brand' : 'border-line-soft hover:border-line',
              isLocked(t) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
            ]"
            @click="choose(t.key, isLocked(t))"
          >
            <div
              class="relative grid h-[96px] place-items-center overflow-hidden"
              :style="{ background: t.dark ? 'var(--color-ink-deep)' : 'var(--color-paper)' }"
            >
              <span class="absolute -top-4 -left-4 h-16 w-16 rounded-full blur-[18px]" :style="{ background: t.accent[0], opacity: 0.55 }" />
              <span class="relative text-[1.5rem]" :style="{ color: t.dark ? 'var(--color-text)' : 'var(--color-paper-ink)' }">Aa</span>
              <span v-if="t.tier === 'pro'" class="absolute top-2 right-2"><DashboardProBadge /></span>
            </div>
            <div class="flex items-center justify-between gap-2 px-3 py-2.5">
              <span class="text-[0.86rem] font-medium">{{ t.name }}</span>
              <DashboardIcon v-if="selected === t.key" name="check" :size="15" class="text-brand" />
            </div>
          </button>
        </div>
      </div>

      <button
        type="button"
        class="cursor-pointer self-center rounded-full bg-brand px-8 py-3 text-[0.95rem] font-semibold text-ink transition-[filter] hover:brightness-110"
        @click="finish"
      >Go to my dashboard</button>
    </div>
  </div>
</template>
