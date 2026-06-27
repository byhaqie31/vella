<script setup lang="ts">
/* Dev-only launcher. A single place to jump into the three surfaces of the app
   while the backend (auth, routing guards) does not exist yet. This route is
   compiled out of any real navigation and 404s in a production build, so it is
   safe to keep checked in. */

if (!import.meta.dev) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

useHead({ title: 'vella — dev launcher' })

const surfaces = [
  {
    num: '01',
    title: 'Marketing site',
    body: 'The public landing page: hero, theme showcase, pricing.',
    to: '/',
  },
  {
    num: '02',
    title: 'Customer studio',
    body: 'The signed-in dashboard where someone builds and manages their page.',
    to: '/dashboard',
  },
  {
    num: '03',
    title: 'Admin',
    body: 'Internal overview: users, pages, moderation, payments.',
    to: '/admin',
  },
]

const groups = [
  {
    label: 'Auth and onboarding',
    links: [
      { to: '/signup', name: 'Sign up' },
      { to: '/login', name: 'Sign in' },
      { to: '/onboarding', name: 'Onboarding' },
      { to: '/auth', name: 'Auth redirect' },
    ],
  },
  {
    label: 'Studio pages',
    links: [
      { to: '/dashboard/my-site', name: 'My site' },
      { to: '/edit/my-site', name: 'Editor' },
      { to: '/dashboard/templates', name: 'Templates' },
      { to: '/dashboard/domains', name: 'Domains' },
      { to: '/dashboard/analytics', name: 'Analytics' },
      { to: '/dashboard/billing', name: 'Billing' },
      { to: '/dashboard/settings', name: 'Settings' },
      { to: '/dashboard/account', name: 'Account' },
    ],
  },
  {
    label: 'Live page previews',
    links: [
      { to: '/alia', name: '/alia' },
      { to: '/huruf', name: '/huruf' },
    ],
  },
]
</script>

<template>
  <div class="relative min-h-screen overflow-x-hidden bg-ink font-sans text-text">
    <!-- atmosphere -->
    <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        class="absolute -top-[20%] -right-[8%] h-[48vw] w-[48vw] rounded-full blur-2xl"
        style="background: radial-gradient(circle, oklch(0.74 0.13 300 / 0.1), transparent 65%)"
      />
      <div
        class="absolute -bottom-[24%] -left-[10%] h-[44vw] w-[44vw] rounded-full blur-2xl"
        style="background: radial-gradient(circle, oklch(0.82 0.1 205 / 0.09), transparent 65%)"
      />
    </div>

    <main class="relative z-10 mx-auto w-full max-w-[1100px] px-[clamp(24px,5vw,72px)] py-[clamp(48px,9vh,96px)]">
      <!-- header -->
      <header class="flex flex-col gap-7">
        <div class="flex items-center justify-between gap-4">
          <AppLogo :size="30" wordmark />
          <span
            class="eyebrow inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-text-faint"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-warning" />
            dev only
          </span>
        </div>

        <div class="flex flex-col gap-3">
          <span class="eyebrow text-text-faint">Internal launcher</span>
          <h1 class="m-0 max-w-[18ch] font-display text-[clamp(2.4rem,1.8rem+3vw,3.8rem)] font-normal leading-[1.02] tracking-[-0.02em]">
            Where do you want to <em class="text-gradient italic">go</em>
          </h1>
          <p class="m-0 max-w-[44ch] text-[1.0625rem] leading-[1.6] text-pretty text-text-dim">
            Jump straight into any surface. There is no auth yet, so every route opens directly.
          </p>
        </div>
      </header>

      <!-- the three surfaces -->
      <nav class="mt-12 grid gap-4 sm:grid-cols-3">
        <NuxtLink
          v-for="s in surfaces"
          :key="s.to"
          :to="s.to"
          class="group flex flex-col gap-4 rounded-card border border-line bg-ink-raised/60 p-6 no-underline transition-colors hover:border-text-faint"
        >
          <div class="flex items-center justify-between">
            <span class="eyebrow text-text-faint">{{ s.num }}</span>
            <span class="text-text-faint transition-colors group-hover:text-text">&rarr;</span>
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-[1.15rem] font-semibold leading-tight">{{ s.title }}</span>
            <span class="text-[0.92rem] leading-[1.55] text-text-dim">{{ s.body }}</span>
          </div>
          <span class="mt-auto font-mono text-[0.78rem] text-text-faint">{{ s.to }}</span>
        </NuxtLink>
      </nav>

      <!-- the route index -->
      <section class="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="g in groups" :key="g.label" class="flex flex-col gap-4">
          <h2 class="eyebrow m-0 text-text-faint">{{ g.label }}</h2>
          <ul class="m-0 flex list-none flex-col gap-1 p-0">
            <li v-for="l in g.links" :key="l.to">
              <NuxtLink
                :to="l.to"
                class="group flex items-center justify-between gap-4 rounded-field px-3 py-2 text-[0.95rem] text-text-dim no-underline transition-colors hover:bg-ink-raised/60 hover:text-text"
              >
                <span>{{ l.name }}</span>
                <span class="font-mono text-[0.76rem] text-text-faint transition-colors group-hover:text-text-dim">{{ l.to }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </section>
    </main>
  </div>
</template>
