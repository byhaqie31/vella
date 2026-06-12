<script setup lang="ts">
import type { StoryPage } from '~/types/story'
import { accentPair, linkHost, splitHeadline, TYPE_MOODS } from '~/themes/registry'

const props = defineProps<{ story: StoryPage }>()

const accent = computed(() => accentPair('editorial', props.story.accent))
const mood = computed(() => TYPE_MOODS[props.story.typeMood])
const headline = computed(() => splitHeadline(props.story.identity.headline))
const eyebrow = computed(() =>
  [props.story.identity.name, props.story.identity.role, props.story.identity.location]
    .filter(Boolean)
    .join(' · ')
    .toLowerCase(),
)

const sections = computed(() => {
  const list: { id: string; label: string }[] = [{ id: 'about', label: 'about' }]
  if (props.story.chapters.length) list.push({ id: 'chapters', label: 'chapters' })
  if (props.story.gallery.length) list.push({ id: 'gallery', label: 'gallery' })
  if (props.story.links.length) list.push({ id: 'links', label: 'links' })
  return list
})
const sectionNumber = (id: string) =>
  String(sections.value.findIndex((s) => s.id === id) + 1).padStart(2, '0')

const displayStyle = computed(() => ({
  fontFamily: mood.value.font,
  fontWeight: mood.value.weight,
  letterSpacing: mood.value.tracking,
}))
</script>

<template>
  <div
    class="relative min-h-screen overflow-x-hidden bg-ink font-sans text-text"
    :style="{ '--accent-a': accent[0], '--accent-b': accent[1] }"
  >
    <!-- L0 atmosphere -->
    <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        data-load="0"
        data-motion="glow"
        data-opacity="0.5"
        data-drift
        data-follow
        class="absolute -top-[18%] -left-[8%] h-[62vw] w-[62vw] rounded-full blur-[40px]"
        :style="{ background: `radial-gradient(circle, ${accent[0].replace(')', ' / 0.16)')}, transparent 65%)` }"
      />
      <div
        data-load="0"
        data-motion="glow"
        data-opacity="0.5"
        data-drift
        data-follow
        class="absolute top-[24%] -right-[16%] h-[54vw] w-[54vw] rounded-full blur-[40px]"
        :style="{ background: `radial-gradient(circle, ${accent[1].replace(')', ' / 0.14)')}, transparent 65%)` }"
      />
    </div>

    <!-- L3 nav -->
    <nav
      data-load="0.85"
      data-motion="rise-sm"
      class="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-[clamp(24px,5vw,72px)] py-[22px] backdrop-blur-[6px]"
      style="background: linear-gradient(oklch(0.168 0.018 265 / 0.85), transparent)"
    >
      <span class="eyebrow text-text-dim">{{ story.identity.name.toLowerCase() }}</span>
      <div class="flex gap-[clamp(14px,2.5vw,34px)]">
        <a
          v-for="s in sections"
          :key="s.id"
          :href="`#${s.id}`"
          data-magnetic
          class="eyebrow text-text-faint no-underline transition-colors duration-250 hover:text-text"
        >{{ s.label }}</a>
      </div>
    </nav>

    <!-- Identity / hero -->
    <header class="relative z-[2] flex min-h-screen flex-col justify-center px-[clamp(24px,6vw,96px)] pt-[120px] pb-16">
      <div class="mx-auto flex w-full max-w-[1180px] flex-col gap-[clamp(24px,3.5vh,40px)]">
        <span data-load="0.15" data-motion="eyebrow" class="eyebrow text-text-faint">{{ eyebrow }}</span>
        <h1
          data-load="0.25"
          data-motion="split"
          class="m-0 text-[clamp(3.2rem,2rem+8vw,8rem)] leading-[0.96]"
          :style="displayStyle"
        >
          {{ headline.head }}
          <em v-if="headline.accent" class="text-gradient" :class="mood.accentItalic ? 'italic' : 'not-italic'">{{ headline.accent }}</em>
        </h1>
        <p
          v-if="story.identity.intro"
          data-load="0.55"
          data-motion="rise"
          class="m-0 max-w-[38rem] text-[clamp(1rem,0.96rem+0.2vw,1.0625rem)] leading-[1.6] text-pretty text-text-dim"
        >{{ story.identity.intro }}</p>
        <div data-load="0.75" data-motion="fade" class="flex flex-wrap gap-[clamp(18px,3vw,40px)] pt-2">
          <span
            v-for="m in story.identity.meta"
            :key="m"
            class="font-mono text-[0.85rem] tracking-[0.02em] text-text-faint"
          >{{ m }}</span>
          <span
            v-if="story.identity.availability"
            class="font-mono text-[0.85rem] tracking-[0.02em] text-positive"
          >{{ story.identity.availability }}</span>
        </div>
      </div>
    </header>

    <!-- About -->
    <section id="about" class="relative z-[2] px-[clamp(24px,6vw,96px)] py-[clamp(80px,12vh,140px)]">
      <div class="mx-auto flex max-w-[1180px] flex-col gap-10">
        <div class="flex flex-col gap-3">
          <span data-reveal="fade" class="eyebrow text-text-faint">{{ sectionNumber('about') }} · about</span>
          <div data-reveal="line" class="h-px bg-line" />
        </div>
        <div class="grid items-start gap-[clamp(32px,5vw,72px)] md:grid-cols-[minmax(0,1.6fr)_minmax(220px,1fr)]">
          <div class="flex flex-col gap-8">
            <blockquote
              data-reveal="split"
              class="m-0 max-w-[24ch] font-display text-[clamp(1.6rem,1.1rem+2.4vw,3rem)] font-light leading-[1.28]"
            >{{ story.about.quote }}</blockquote>
            <p
              v-if="story.about.body"
              data-reveal="rise"
              class="m-0 max-w-[38rem] text-[clamp(1rem,0.96rem+0.2vw,1.0625rem)] leading-[1.6] text-pretty text-text-dim"
            >{{ story.about.body }}</p>
          </div>
          <figure data-reveal="clip" class="relative m-0 aspect-[3/4] overflow-hidden rounded-card border border-line-soft">
            <div data-media class="media-stripes absolute inset-0 grid place-items-center">
              <span class="eyebrow text-text-faint">portrait</span>
            </div>
          </figure>
        </div>
      </div>
    </section>

    <!-- Chapters -->
    <section v-if="story.chapters.length" id="chapters" class="relative z-[2] px-[clamp(24px,6vw,96px)] py-[clamp(80px,12vh,140px)]">
      <div class="mx-auto flex max-w-[1180px] flex-col gap-10">
        <div class="flex flex-col gap-3">
          <span data-reveal="fade" class="eyebrow text-text-faint">{{ sectionNumber('chapters') }} · chapters</span>
          <div data-reveal="line" class="h-px bg-line" />
        </div>
        <div class="flex flex-col">
          <article
            v-for="ch in story.chapters"
            :key="ch.title + ch.period"
            data-reveal="rise"
            class="grid grid-cols-[minmax(140px,220px)_minmax(0,1fr)] gap-[clamp(20px,4vw,64px)] border-b border-line-soft py-[clamp(28px,4vh,44px)]"
          >
            <span data-reveal="slide" class="pt-2 font-mono text-[0.85rem] tracking-[0.02em] text-text-faint">{{ ch.period }}</span>
            <div class="flex flex-col gap-3">
              <h3 class="m-0 font-display text-[clamp(1.5rem,1.1rem+1.4vw,2.2rem)] font-medium leading-[1.1]">{{ ch.title }}</h3>
              <p class="m-0 max-w-[38rem] text-[clamp(1rem,0.96rem+0.2vw,1.0625rem)] leading-[1.6] text-pretty text-text-dim">{{ ch.body }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Gallery -->
    <section v-if="story.gallery.length" id="gallery" class="relative z-[2] px-[clamp(24px,6vw,96px)] py-[clamp(80px,12vh,140px)]">
      <div class="mx-auto flex max-w-[1180px] flex-col gap-10">
        <div class="flex flex-col gap-3">
          <span data-reveal="fade" class="eyebrow text-text-faint">{{ sectionNumber('gallery') }} · gallery</span>
          <div data-reveal="line" class="h-px bg-line" />
        </div>
        <div class="grid items-start gap-[clamp(20px,3vw,36px)]" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))">
          <figure
            v-for="g in story.gallery"
            :key="g.slot"
            class="m-0 flex flex-col gap-3"
            :style="{ marginTop: `${g.offset || 0}px` }"
          >
            <div
              data-reveal="clip"
              data-parallax="subtle"
              :data-dir="g.dir || 1"
              class="relative overflow-hidden rounded-card border border-line-soft"
              :style="{ aspectRatio: g.ratio || '4 / 3' }"
            >
              <div data-media class="media-stripes absolute inset-0 grid place-items-center">
                <span class="eyebrow text-text-faint">{{ g.slot }}</span>
              </div>
            </div>
            <figcaption class="font-mono text-[0.74rem] tracking-[0.1em] text-text-faint">{{ g.caption }}</figcaption>
          </figure>
        </div>
      </div>
    </section>

    <!-- Links -->
    <section
      v-if="story.links.length"
      id="links"
      class="relative z-[2] px-[clamp(24px,6vw,96px)] pt-[clamp(80px,12vh,140px)] pb-[clamp(60px,8vh,100px)]"
    >
      <div class="mx-auto flex max-w-[1180px] flex-col gap-10">
        <div class="flex flex-col gap-3">
          <span data-reveal="fade" class="eyebrow text-text-faint">{{ sectionNumber('links') }} · links</span>
          <div data-reveal="line" class="h-px bg-line" />
        </div>
        <div class="flex flex-col">
          <a
            v-for="l in story.links"
            :key="l.url + l.label"
            :href="l.url"
            data-reveal="rise"
            data-magnetic
            class="flex items-baseline justify-between gap-6 rounded-field border-b border-line-soft px-2 py-[26px] text-text no-underline transition-colors duration-250 hover:bg-ink-raised"
          >
            <span class="font-display text-[clamp(1.3rem,1rem+1.2vw,1.9rem)]">{{ l.label }}</span>
            <span class="font-mono text-[0.85rem] tracking-[0.02em] text-text-faint">{{ linkHost(l.url) }}</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="relative z-[2] px-[clamp(24px,6vw,96px)] pt-8 pb-12">
      <div class="mx-auto flex max-w-[1180px] items-center justify-between gap-4">
        <span class="eyebrow text-text-faint">© 2026 {{ story.identity.name.toLowerCase() }}</span>
        <NuxtLink
          to="/"
          class="eyebrow inline-flex items-center gap-2 text-text-faint no-underline transition-colors duration-250 hover:text-text"
        >
          <span class="bg-accent h-2.5 w-2.5 rounded-[3px]" />
          made with vella
        </NuxtLink>
      </div>
    </footer>
  </div>
</template>
