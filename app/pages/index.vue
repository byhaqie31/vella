<script setup lang="ts">
import { THEMES } from '~/themes/registry'
import { useMotion } from '~/themes/_motion/useMotion'

useHead({ title: 'vella — a page that moves like you' })

const rootRef = ref<HTMLElement | null>(null)
useMotion(rootRef, () => THEMES.editorial.motion)

const steps = [
  {
    num: '01',
    title: 'Pick a theme',
    body: 'Each theme is a complete voice: typography, color, rhythm and motion, designed as one piece.',
  },
  {
    num: '02',
    title: 'Fill in your story',
    body: 'A structured form. Your name, your chapters, your photos, your links. Nothing to arrange.',
  },
  {
    num: '03',
    title: 'Publish',
    body: 'One link, beautifully animated, fast everywhere. Swap themes any time without touching a word.',
  },
]

const plans = [
  {
    name: 'Free',
    tag: 'forever',
    price: 'RM0',
    per: '',
    delay: 0,
    highlight: false,
    cta: 'Start free',
    to: '/auth',
    features: ['One page, every theme', 'Your vella.page link', 'The full motion system', 'Small made-with-vella badge'],
  },
  {
    name: 'Pro',
    tag: 'rm190 / year',
    price: 'RM19',
    per: '/ month',
    delay: 0.12,
    highlight: true,
    cta: 'Go pro',
    to: '/dashboard/billing',
    features: ['Custom domain', 'Premium themes as they land', 'No badge', 'Pay once, runs 1 or 12 months'],
  },
]
</script>

<template>
  <div ref="rootRef" class="relative min-h-screen overflow-x-hidden bg-ink font-sans text-text">
    <!-- atmosphere -->
    <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        data-load="0"
        data-motion="glow"
        data-opacity="0.45"
        data-drift
        class="absolute -top-[22%] -right-[10%] h-[58vw] w-[58vw] rounded-full blur-[40px]"
        style="background: radial-gradient(circle, oklch(0.74 0.13 300 / 0.13), transparent 65%)"
      />
      <div
        data-load="0"
        data-motion="glow"
        data-opacity="0.45"
        data-drift
        class="absolute -bottom-[28%] -left-[12%] h-[52vw] w-[52vw] rounded-full blur-[40px]"
        style="background: radial-gradient(circle, oklch(0.82 0.10 205 / 0.12), transparent 65%)"
      />
    </div>

    <!-- nav -->
    <nav
      data-load="0.8"
      data-motion="rise-sm"
      class="relative z-10 mx-auto flex w-full max-w-[1180px] items-center justify-between px-[clamp(24px,5vw,72px)] py-6"
    >
      <AppLogo :size="30" wordmark />
      <div class="flex items-center gap-6">
        <a href="#themes" class="text-[0.92rem] text-text-dim no-underline transition-colors hover:text-text">themes</a>
        <a href="#pricing" class="text-[0.92rem] text-text-dim no-underline transition-colors hover:text-text">pricing</a>
        <NuxtLink to="/auth" class="text-[0.92rem] text-text-dim no-underline transition-colors hover:text-text">sign in</NuxtLink>
        <NuxtLink
          to="/auth"
          class="inline-flex items-center rounded-full border border-line px-[18px] py-[9px] text-[0.88rem] font-medium text-text no-underline transition-colors hover:border-text-faint"
        >Start free</NuxtLink>
      </div>
    </nav>

    <!-- hero -->
    <header
      class="relative z-[2] mx-auto flex max-w-[1180px] flex-col items-center gap-7 px-[clamp(24px,5vw,72px)] pt-[clamp(64px,14vh,140px)] pb-[clamp(64px,10vh,120px)] text-center"
    >
      <span data-load="0.15" data-motion="eyebrow" class="eyebrow text-text-faint">your story, beautifully told</span>
      <h1
        data-load="0.25"
        data-motion="split"
        class="m-0 max-w-[14ch] font-display text-[clamp(3rem,1.8rem+6vw,6.4rem)] font-normal leading-[0.98] tracking-[-0.02em]"
      >
        A page that <em class="text-gradient italic">moves</em> like you
      </h1>
      <p data-load="0.55" data-motion="rise" class="m-0 max-w-[34rem] text-[1.0625rem] leading-[1.6] text-pretty text-text-dim">
        Pick a theme, fill in your story, publish. No canvas, no fiddling with layouts. Every theme arrives with its typography, rhythm and motion already designed.
      </p>
      <div data-load="0.8" data-motion="rise-sm" class="flex items-center gap-4 pt-1.5">
        <NuxtLink
          to="/auth"
          data-magnetic
          class="bg-accent inline-flex items-center rounded-full px-7 py-3.5 text-[0.97rem] font-semibold text-ink no-underline shadow-[0_30px_80px_-30px_oklch(0_0_0/0.7)] transition-[filter] hover:brightness-110"
        >Start free</NuxtLink>
        <NuxtLink
          to="/u/alia"
          data-magnetic
          class="inline-flex items-center rounded-full border border-line px-6 py-3.5 text-[0.97rem] font-medium text-text no-underline transition-colors hover:border-text-faint"
        >See a live page</NuxtLink>
      </div>

      <!-- preview card -->
      <div data-load="1.0" data-motion="rise" class="flex w-full justify-center pt-[clamp(28px,5vh,56px)] [perspective:1200px]">
        <div
          class="w-[min(680px,94%)] overflow-hidden rounded-card border border-line-soft bg-ink-deep text-left shadow-[0_30px_80px_-30px_oklch(0_0_0/0.7)]"
          style="transform: rotateX(6deg) rotate(-1.5deg)"
        >
          <div class="flex items-center gap-1.5 border-b border-line-soft px-4 py-3">
            <span class="h-2 w-2 rounded-full bg-line" />
            <span class="h-2 w-2 rounded-full bg-line" />
            <span class="flex-1" />
            <span class="font-mono text-[0.66rem] tracking-[0.08em] text-text-faint">vella.page/alia</span>
            <span class="flex-1" />
          </div>
          <div class="flex flex-col gap-4 px-9 pt-[34px] pb-[38px]">
            <span class="font-mono text-[0.64rem] tracking-[0.16em] text-text-faint">alia rahman · type designer · kuala lumpur</span>
            <span class="font-display text-[clamp(1.8rem,4.5vw,2.8rem)] font-normal leading-[0.98] tracking-[-0.02em]">
              Letters that carry <em class="text-gradient italic">stories</em> home
            </span>
            <div class="h-px w-[48%] bg-line" />
            <div class="grid grid-cols-[90px_minmax(0,1fr)] items-baseline gap-3.5">
              <span class="font-mono text-[0.64rem] text-text-faint">2014 – 2017</span>
              <span class="font-display text-[0.98rem] font-medium">Sign painting first</span>
            </div>
            <div class="grid grid-cols-[90px_minmax(0,1fr)] items-baseline gap-3.5">
              <span class="font-mono text-[0.64rem] text-text-faint">2017 – 2019</span>
              <span class="font-display text-[0.98rem] font-medium">The night classes</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- how it works -->
    <section class="relative z-[2] mx-auto max-w-[1180px] px-[clamp(24px,5vw,72px)] pb-[clamp(80px,12vh,130px)]">
      <div data-reveal="line" class="mb-12 h-px bg-line-soft" />
      <div class="grid gap-[clamp(24px,4vw,56px)]" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))">
        <div v-for="st in steps" :key="st.num" data-reveal="rise" class="flex flex-col gap-3">
          <span class="eyebrow text-text-faint">{{ st.num }}</span>
          <h3 class="m-0 font-display text-2xl font-medium leading-[1.1]">{{ st.title }}</h3>
          <p class="m-0 text-[0.97rem] leading-[1.6] text-pretty text-text-dim">{{ st.body }}</p>
        </div>
      </div>
    </section>

    <!-- themes -->
    <section id="themes" class="relative z-[2] mx-auto flex max-w-[1180px] flex-col gap-9 px-[clamp(24px,5vw,72px)] pb-[clamp(80px,12vh,130px)]">
      <div class="flex flex-col gap-3">
        <span data-reveal="fade" class="eyebrow text-text-faint">themes</span>
        <h2 data-reveal="rise" class="m-0 font-display text-[clamp(2rem,1.4rem+3vw,3.6rem)] font-normal leading-[1.05] tracking-[-0.01em]">
          Two voices, one story
        </h2>
      </div>
      <div class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))">
        <!-- editorial card -->
        <NuxtLink
          to="/u/alia"
          data-reveal="rise"
          class="flex flex-col overflow-hidden rounded-card border border-line-soft text-text no-underline transition-[border-color,transform] duration-250 hover:-translate-y-[3px] hover:border-line"
        >
          <div class="relative flex min-h-[200px] flex-col gap-3.5 overflow-hidden bg-ink-deep px-8 pt-9 pb-10">
            <div
              class="absolute -top-[40%] -right-[20%] aspect-square w-[70%] rounded-full blur-[20px]"
              style="background: radial-gradient(circle, oklch(0.74 0.13 300 / 0.2), transparent 65%)"
            />
            <span class="font-mono text-[0.66rem] tracking-[0.16em] text-text-faint">alia rahman · type designer</span>
            <span class="font-display text-[2.2rem] font-normal leading-[0.98] tracking-[-0.02em]">
              Letters that<br>carry <em class="text-gradient italic">stories</em>
            </span>
            <div class="h-px w-[56%] bg-line" />
          </div>
          <div class="flex items-baseline justify-between gap-3 bg-ink-raised px-6 py-[18px]">
            <span class="text-[1rem] font-semibold">Editorial</span>
            <span class="font-mono text-[0.74rem] text-text-faint">dark · serif · expressive motion</span>
          </div>
        </NuxtLink>

        <!-- minimal card -->
        <NuxtLink
          to="/u/huruf"
          data-reveal="rise"
          data-reveal-delay="0.12"
          class="flex flex-col overflow-hidden rounded-card border border-line-soft text-text no-underline transition-[border-color,transform] duration-250 hover:-translate-y-[3px] hover:border-line"
        >
          <div class="flex min-h-[200px] flex-col gap-3.5 bg-paper px-8 pt-9 pb-10">
            <span class="font-mono text-[0.66rem] tracking-[0.16em] text-paper-faint">alia rahman · type designer</span>
            <span
              class="text-[2rem] font-semibold leading-[1.02] tracking-[-0.04em] text-paper-ink"
            >
              Letters that carry<br>
              <em class="not-italic" style="background: linear-gradient(105deg, oklch(0.58 0.11 165), oklch(0.62 0.11 120)); -webkit-background-clip: text; background-clip: text; color: transparent">stories</em> home
            </span>
            <div class="h-px w-[56%] bg-paper-line" />
          </div>
          <div class="flex items-baseline justify-between gap-3 bg-ink-raised px-6 py-[18px]">
            <span class="text-[1rem] font-semibold">Minimal</span>
            <span class="font-mono text-[0.74rem] text-text-faint">light · sans · quiet motion</span>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- pricing -->
    <section id="pricing" class="relative z-[2] mx-auto flex max-w-[1180px] flex-col gap-9 px-[clamp(24px,5vw,72px)] pb-[clamp(80px,12vh,130px)]">
      <div class="flex flex-col gap-3">
        <span data-reveal="fade" class="eyebrow text-text-faint">pricing</span>
        <h2 data-reveal="rise" class="m-0 font-display text-[clamp(2rem,1.4rem+3vw,3.6rem)] font-normal leading-[1.05] tracking-[-0.01em]">
          Free to tell, pro to own
        </h2>
      </div>
      <div class="grid max-w-[760px] gap-5" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))">
        <div
          v-for="pl in plans"
          :key="pl.name"
          data-reveal="rise"
          :data-reveal-delay="pl.delay"
          class="flex flex-col gap-[18px] rounded-card border bg-ink-raised p-7"
          :style="{ borderColor: pl.highlight ? 'oklch(0.82 0.10 205 / 0.4)' : 'var(--color-line-soft)' }"
        >
          <div class="flex items-baseline justify-between gap-3">
            <span class="text-[1.05rem] font-semibold">{{ pl.name }}</span>
            <span class="font-mono text-[0.74rem] tracking-[0.1em] text-text-faint">{{ pl.tag }}</span>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="font-display text-[2.6rem] font-normal leading-none">{{ pl.price }}</span>
            <span class="font-mono text-[0.78rem] text-text-faint">{{ pl.per }}</span>
          </div>
          <div class="flex flex-col gap-[9px]">
            <div v-for="f in pl.features" :key="f" class="flex items-baseline gap-2.5">
              <span
                class="h-[5px] w-[5px] shrink-0 -translate-y-0.5 rounded-full"
                :style="{ background: pl.highlight ? 'oklch(0.82 0.10 205)' : 'var(--color-text-faint)' }"
              />
              <span class="text-[0.92rem] leading-[1.5] text-text-dim">{{ f }}</span>
            </div>
          </div>
          <NuxtLink
            :to="pl.to"
            class="mt-auto rounded-full border py-[11px] text-center text-[0.92rem] font-medium text-text no-underline transition-colors hover:bg-ink-card"
            :style="{ borderColor: pl.highlight ? 'oklch(0.82 0.10 205 / 0.5)' : 'var(--color-line)' }"
          >{{ pl.cta }}</NuxtLink>
        </div>
      </div>
    </section>

    <!-- final CTA -->
    <section class="relative z-[2] mx-auto flex max-w-[1180px] flex-col items-center gap-[26px] px-[clamp(24px,5vw,72px)] pb-[clamp(90px,14vh,150px)] text-center">
      <h2
        data-reveal="split"
        class="m-0 max-w-[16ch] font-display text-[clamp(2.2rem,1.5rem+4vw,4.6rem)] font-normal leading-[1.02] tracking-[-0.02em]"
      >
        Your story is ready. Give it a page.
      </h2>
      <NuxtLink
        to="/auth"
        data-reveal="rise"
        data-magnetic
        class="bg-accent inline-flex items-center rounded-full px-[30px] py-3.5 text-[0.97rem] font-semibold text-ink no-underline shadow-[0_30px_80px_-30px_oklch(0_0_0/0.7)] transition-[filter] hover:brightness-110"
      >Start free</NuxtLink>
    </section>

    <!-- footer -->
    <footer class="relative z-[2] mx-auto flex max-w-[1180px] items-center justify-between gap-4 border-t border-line-soft px-[clamp(24px,5vw,72px)] pt-7 pb-11">
      <div class="flex flex-col gap-1.5">
        <span class="eyebrow text-text-faint">© 2026 vella</span>
        <span class="eyebrow text-text-faint">made in kuala lumpur</span>
      </div>
      <div class="flex gap-6">
        <a href="#" class="eyebrow text-text-faint no-underline transition-colors hover:text-text">privacy</a>
        <a href="#" class="eyebrow text-text-faint no-underline transition-colors hover:text-text">terms</a>
      </div>
    </footer>
  </div>
</template>
