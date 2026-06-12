<script setup lang="ts">
useHead({ title: 'vella — sign in' })

const mode = ref<'signup' | 'login'>('signup')
const email = ref('')
const sent = ref(false)

const signup = computed(() => mode.value === 'signup')
const title = computed(() => (signup.value ? 'Tell your story' : 'Welcome back'))
const subtitle = computed(() =>
  signup.value ? 'One email, no password. We send you a link.' : 'We send a sign-in link to your email.',
)
const buttonLabel = computed(() => (signup.value ? 'Create my account' : 'Send sign-in link'))
const switchLabel = computed(() => (signup.value ? 'Already have a page? Sign in' : 'New here? Start free'))

function submit() {
  if (email.value.trim()) sent.value = true
}
function toggleMode() {
  mode.value = signup.value ? 'login' : 'signup'
  sent.value = false
}

const router = useRouter()
function google() {
  router.push('/dashboard')
}
</script>

<template>
  <div class="grid min-h-screen place-items-center bg-ink p-6 font-sans text-text">
    <div class="auth-rise flex w-[min(400px,100%)] flex-col gap-7">
      <NuxtLink to="/" class="flex items-center justify-center gap-3 text-text no-underline">
        <AppLogo :size="34" />
      </NuxtLink>

      <div class="flex flex-col gap-[22px] rounded-card border border-line-soft bg-ink-raised px-[30px] pt-8 pb-[30px]">
        <template v-if="!sent">
          <div class="flex flex-col gap-1.5 text-center">
            <h1 class="m-0 font-display text-[1.7rem] font-normal leading-[1.1]">{{ title }}</h1>
            <p class="m-0 text-[0.92rem] leading-[1.5] text-text-dim">{{ subtitle }}</p>
          </div>
          <form class="flex flex-col gap-3" @submit.prevent="submit">
            <input
              v-model="email"
              type="email"
              required
              placeholder="you@somewhere.com"
              class="rounded-field border border-line bg-ink-field px-3.5 py-3 font-sans text-[0.95rem] text-text outline-none transition-colors focus:border-[oklch(0.82_0.10_205)]"
            >
            <button
              type="submit"
              class="cursor-pointer rounded-field border-none bg-text py-3 font-sans text-[0.93rem] font-semibold text-ink transition-[filter] hover:brightness-[0.92]"
            >{{ buttonLabel }}</button>
          </form>
          <div class="flex items-center gap-3">
            <span class="h-px flex-1 bg-line-soft" />
            <span class="font-mono text-[0.68rem] tracking-[0.12em] text-text-faint">or</span>
            <span class="h-px flex-1 bg-line-soft" />
          </div>
          <button
            class="cursor-pointer rounded-field border border-line bg-transparent py-[11px] font-sans text-[0.92rem] font-medium text-text transition-colors hover:bg-ink-card"
            @click="google"
          >Continue with Google</button>
        </template>

        <template v-else>
          <div class="flex flex-col gap-3 py-3 text-center">
            <span class="eyebrow text-positive">link sent</span>
            <h1 class="m-0 font-display text-[1.7rem] font-normal leading-[1.15]">Check your email</h1>
            <p class="m-0 text-[0.92rem] leading-[1.55] text-text-dim">
              We sent a sign-in link to {{ email }}. It works once and expires in 15 minutes.
            </p>
            <button
              class="mt-2 cursor-pointer border-none bg-transparent font-mono text-[0.74rem] tracking-[0.1em] text-text-faint transition-colors hover:text-text"
              @click="sent = false"
            >use a different email</button>
          </div>
        </template>
      </div>

      <button
        class="cursor-pointer border-none bg-transparent font-sans text-[0.88rem] text-text-dim transition-colors hover:text-text"
        @click="toggleMode"
      >{{ switchLabel }}</button>
    </div>
  </div>
</template>

<style scoped>
@keyframes auth-rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.auth-rise {
  animation: auth-rise 0.3s ease-out both;
}
</style>
