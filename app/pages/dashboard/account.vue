<script setup lang="ts">
definePageMeta({ layout: 'studio' })
useHead({ title: 'vella — account' })

const name = ref('Alia Rahman')
const email = ref('alia@huruf.studio')
const saved = ref(false)
let savedT: ReturnType<typeof setTimeout> | undefined

function save() {
  saved.value = true
  clearTimeout(savedT)
  savedT = setTimeout(() => (saved.value = false), 2000)
}

interface Session {
  id: number
  device: string
  meta: string
  current: boolean
}
const sessions = ref<Session[]>([
  { id: 1, device: 'MacBook · Arc', meta: 'kuala lumpur · active now', current: true },
  { id: 2, device: 'iPhone · Safari', meta: 'kuala lumpur · 2 days ago', current: false },
])
function revoke(id: number) {
  sessions.value = sessions.value.filter((s) => s.id !== id)
}

const confirmText = ref('')
const deleted = ref(false)
const canDelete = computed(() => confirmText.value.trim().toLowerCase() === 'delete')

const fieldCls =
  'rounded-field border border-line bg-ink-field px-3 py-2.5 font-sans text-[0.92rem] text-text outline-none transition-colors focus:border-[oklch(0.82_0.10_205)]'
</script>

<template>
  <div class="flex max-w-[640px] flex-col gap-9">
    <header class="flex flex-col gap-2">
      <h1 class="m-0 font-display text-[clamp(1.9rem,1.4rem+2vw,2.8rem)] font-normal leading-[1.05] tracking-[-0.01em]">Account</h1>
      <p class="m-0 text-[0.95rem] text-text-dim">Who you are to us, and where you are signed in.</p>
    </header>

    <!-- profile -->
    <section class="flex flex-col gap-3.5">
      <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">Profile</span>
      <div class="flex flex-col gap-3.5 rounded-card border border-line-soft bg-ink-raised px-[26px] py-6">
        <label class="flex flex-col gap-1.5">
          <span class="text-[0.8rem] text-text-dim">Name</span>
          <input v-model="name" :class="fieldCls" @input="saved = false">
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-[0.8rem] text-text-dim">Email</span>
          <input v-model="email" :class="fieldCls" @input="saved = false">
          <span class="font-mono text-[0.7rem] text-text-faint">Changing email sends a confirmation link to the new address</span>
        </label>
        <div class="flex justify-end">
          <button
            class="cursor-pointer rounded-field border border-line bg-transparent px-[22px] py-[9px] font-sans text-[0.88rem] font-medium text-text transition-colors hover:bg-ink-card"
            @click="save"
          >{{ saved ? 'Saved' : 'Save changes' }}</button>
        </div>
      </div>
    </section>

    <!-- sessions -->
    <section class="flex flex-col gap-3.5">
      <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">Sessions</span>
      <div class="overflow-hidden rounded-card border border-line-soft">
        <div
          v-for="ses in sessions"
          :key="ses.id"
          class="flex items-center justify-between gap-4 border-b border-line-soft/60 bg-ink-raised px-[22px] py-[15px]"
        >
          <div class="flex flex-col gap-[3px]">
            <span class="text-[0.9rem] font-medium">{{ ses.device }}</span>
            <span class="font-mono text-[0.72rem] text-text-faint">{{ ses.meta }}</span>
          </div>
          <StatusPill v-if="ses.current" label="This device" tone="positive" />
          <button
            v-else
            class="cursor-pointer rounded-full border border-line bg-transparent px-3.5 py-1.5 font-sans text-[0.8rem] text-text-dim transition-colors hover:border-danger/50 hover:text-danger"
            @click="revoke(ses.id)"
          >Sign out</button>
        </div>
      </div>
    </section>

    <!-- danger zone -->
    <section class="flex flex-col gap-3.5">
      <span class="font-mono text-[0.7rem] tracking-[0.16em] text-danger">Danger zone</span>
      <div class="flex flex-col gap-3.5 rounded-card border border-danger/35 bg-ink-raised px-[26px] py-6">
        <div class="flex flex-col gap-1">
          <span class="text-[0.95rem] font-medium">Delete account</span>
          <span class="text-[0.88rem] leading-[1.55] text-text-dim">
            Your pages go offline immediately. Data is kept 30 days, then purged for good.
          </span>
        </div>
        <div class="flex items-center gap-2.5">
          <input
            v-model="confirmText"
            placeholder='Type "delete" to confirm'
            class="min-w-0 flex-1 rounded-field border border-line bg-ink-field px-3 py-2.5 font-mono text-[0.8rem] text-text outline-none transition-colors focus:border-danger"
          >
          <button
            :disabled="!canDelete"
            class="rounded-field border border-danger/50 bg-transparent px-5 py-2.5 font-sans text-[0.88rem] font-medium transition-colors"
            :class="canDelete ? 'cursor-pointer text-danger' : 'cursor-not-allowed text-text-faint'"
            @click="canDelete && (deleted = true)"
          >Delete account</button>
        </div>
        <span v-if="deleted" class="font-mono text-[0.74rem] text-danger">Account scheduled for deletion. Signing you out…</span>
      </div>
    </section>
  </div>
</template>
