<script setup lang="ts">
definePageMeta({ layout: 'studio' })
useHead({ title: 'Vella — settings' })

const { user, logout } = useAuth()
const { site, publicUrl, setHandle } = useSite()

const name = ref(user.value.name)
const email = ref(user.value.email)
const phone = ref(user.value.phone ?? '')
const saved = ref(false)
let savedT: ReturnType<typeof setTimeout> | undefined

function save() {
  user.value = {
    ...user.value,
    name: name.value.trim() || user.value.name,
    email: email.value.trim(),
    phone: phone.value.trim(),
    initial: (name.value.trim()[0] ?? user.value.initial).toUpperCase(),
  }
  saved.value = true
  clearTimeout(savedT)
  savedT = setTimeout(() => (saved.value = false), 2000)
}

const confirmText = ref('')
const deleted = ref(false)
const canDelete = computed(() => confirmText.value.trim().toLowerCase() === 'delete')
function destroy() {
  if (!canDelete.value) return
  deleted.value = true
  setTimeout(() => logout(), 1200)
}

const fieldCls =
  'rounded-field border border-line bg-ink-field px-3 py-2.5 font-sans text-[0.92rem] text-text outline-none transition-colors focus:border-brand'
</script>

<template>
  <div class="mx-auto flex max-w-[640px] flex-col gap-7">
    <header class="dash-rise flex flex-col gap-1.5">
      <h1 class="m-0 text-[clamp(1.55rem,1.2rem+1.6vw,2.1rem)] font-bold tracking-[-0.02em]">Settings</h1>
      <p class="m-0 text-[0.96rem] text-text-dim">Your profile, address, and account.</p>
    </header>

    <!-- profile -->
    <section class="dash-rise flex flex-col gap-3.5" style="animation-delay: 60ms">
      <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">Profile</span>
      <div class="flex flex-col gap-3.5 rounded-card border border-line-soft bg-ink-raised px-[26px] py-6">
        <div class="flex items-center gap-3.5">
          <span class="grid h-12 w-12 place-items-center rounded-full bg-brand-bg text-[1.1rem] font-semibold text-brand">{{ user.initial }}</span>
          <div class="flex flex-col">
            <span class="text-[0.95rem] font-medium">{{ user.name }}</span>
            <span class="font-mono text-[0.74rem] text-text-faint">{{ user.plan === 'pro' ? 'Pro plan' : 'Free plan' }}</span>
          </div>
        </div>
        <label class="flex flex-col gap-1.5">
          <span class="text-[0.8rem] text-text-dim">Name</span>
          <input v-model="name" :class="fieldCls" @input="saved = false">
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-[0.8rem] text-text-dim">Email</span>
          <input v-model="email" :class="fieldCls" @input="saved = false">
          <span class="font-mono text-[0.7rem] text-text-faint">Changing email sends a confirmation link to the new address</span>
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-[0.8rem] text-text-dim">Mobile number</span>
          <input v-model="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+60 12 345 6789" :class="fieldCls" @input="saved = false">
          <span class="font-mono text-[0.7rem] text-text-faint">Used for account notifications and recovery</span>
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-[0.8rem] text-text-dim">Public address</span>
          <div class="flex items-center overflow-hidden rounded-field border border-line bg-ink-field">
            <input
              :value="site.handle"
              class="min-w-0 flex-1 border-none bg-transparent py-2.5 pr-1 pl-3 font-mono text-[0.82rem] text-text outline-none"
              @input="setHandle(($event.target as HTMLInputElement).value)"
            >
            <span class="py-2.5 pr-3 font-mono text-[0.82rem] text-text-faint">.vella.site</span>
          </div>
        </label>
        <div class="flex items-center justify-between gap-3">
          <span v-if="saved" class="font-mono text-[0.74rem] text-positive">Saved</span>
          <span v-else />
          <button
            type="button"
            class="cursor-pointer rounded-field border border-line bg-transparent px-[22px] py-[9px] font-sans text-[0.88rem] font-medium text-text transition-colors hover:bg-ink-card"
            @click="save"
          >Save changes</button>
        </div>
      </div>
    </section>

    <!-- security -->
    <section class="dash-rise flex flex-col gap-3.5" style="animation-delay: 110ms">
      <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">Security</span>
      <div class="flex items-center justify-between gap-4 rounded-card border border-line-soft bg-ink-raised px-[26px] py-5">
        <div class="flex flex-col gap-0.5">
          <span class="text-[0.92rem] font-medium">Password</span>
          <span class="text-[0.82rem] text-text-faint">Last changed a while ago</span>
        </div>
        <button class="cursor-pointer rounded-field border border-line bg-transparent px-4 py-2 text-[0.85rem] font-medium text-text transition-colors hover:bg-ink-card">Change</button>
      </div>
    </section>

    <!-- danger zone -->
    <section class="dash-rise flex flex-col gap-3.5" style="animation-delay: 160ms">
      <span class="font-mono text-[0.7rem] tracking-[0.16em] text-danger">Danger zone</span>
      <div class="flex flex-col gap-3.5 rounded-card border border-danger/35 bg-ink-raised px-[26px] py-6">
        <div class="flex flex-col gap-1">
          <span class="text-[0.95rem] font-medium">Delete account</span>
          <span class="text-[0.88rem] leading-[1.55] text-text-dim">Your site goes offline immediately. Data is kept 30 days, then purged for good.</span>
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
            @click="destroy"
          >Delete account</button>
        </div>
        <span v-if="deleted" class="font-mono text-[0.74rem] text-danger">Account scheduled for deletion. Signing you out…</span>
      </div>
    </section>
  </div>
</template>
