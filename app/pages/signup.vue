<script setup lang="ts">
definePageMeta({ layout: 'auth' })
useHead({ title: 'Vella — create your account' })

const { signup } = useAuth()
const name = ref('')
const email = ref('')
const password = ref('')

function submit() {
  signup(name.value, email.value)
}

const fieldCls =
  'rounded-field border border-line bg-ink-field px-3.5 py-3 font-sans text-[0.95rem] text-text outline-none transition-colors focus:border-brand'
</script>

<template>
  <div class="grid min-h-screen place-items-center p-6">
    <div class="dash-rise flex w-[min(400px,100%)] flex-col gap-7">
      <NuxtLink to="/" class="flex items-center justify-center gap-3 text-text no-underline">
        <AppLogo :size="34" />
      </NuxtLink>

      <div class="flex flex-col gap-[22px] rounded-card border border-line-soft bg-ink-raised px-[30px] pt-8 pb-[30px]">
        <div class="flex flex-col gap-1.5 text-center">
          <h1 class="m-0 text-[1.55rem] font-bold tracking-[-0.01em]">Build your portfolio</h1>
          <p class="m-0 text-[0.92rem] text-text-dim">A beautiful page about you, in ten minutes.</p>
        </div>
        <form class="flex flex-col gap-3" @submit.prevent="submit">
          <input v-model="name" required placeholder="Your name" :class="fieldCls">
          <input v-model="email" type="email" required placeholder="you@somewhere.com" :class="fieldCls">
          <input v-model="password" type="password" required placeholder="Choose a password" :class="fieldCls">
          <button
            type="submit"
            class="cursor-pointer rounded-field bg-brand py-3 font-sans text-[0.93rem] font-semibold text-ink transition-[filter] hover:brightness-110"
          >Create my account</button>
        </form>
        <div class="flex items-center gap-3">
          <span class="h-px flex-1 bg-line-soft" />
          <span class="font-mono text-[0.68rem] tracking-[0.12em] text-text-faint">Or</span>
          <span class="h-px flex-1 bg-line-soft" />
        </div>
        <button
          type="button"
          class="cursor-pointer rounded-field border border-line bg-transparent py-[11px] font-sans text-[0.92rem] font-medium text-text transition-colors hover:bg-ink-card"
          @click="signup(name, email)"
        >Continue with Google</button>
      </div>

      <NuxtLink to="/login" class="text-center text-[0.88rem] text-text-dim no-underline transition-colors hover:text-text">
        Already have a page? Sign in
      </NuxtLink>
    </div>
  </div>
</template>
