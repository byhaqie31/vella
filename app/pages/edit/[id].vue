<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useEditorStore } from '~/stores/editor'

useHead({ title: 'vella — editor' })

const route = useRoute()
const store = useEditorStore()
store.load(String(route.params.id))

const { story, slug, savedState, slugState } = storeToRefs(store)

const pageName = computed(() => story.value.identity.name || 'Untitled page')
const savedLabel = computed(() =>
  savedState.value === 'saving' ? 'saving…' : savedState.value === 'saved' ? 'saved' : '',
)

const SLUG_STATUS = {
  yours: 'this is your current address',
  checking: 'checking…',
  taken: 'taken, try another',
  available: 'available',
  empty: 'pick an address',
} as const
const slugColor = computed(() =>
  slugState.value === 'taken'
    ? 'var(--color-danger)'
    : slugState.value === 'available' || slugState.value === 'yours'
      ? 'var(--color-positive)'
      : 'var(--color-text-faint)',
)

/* collapsible form groups */
const open = reactive({ identity: true, about: true, chapters: true, media: true, links: true })

/* the editor has two surfaces: write the story, then design it */
const tab = ref<'content' | 'design'>('content')

/* a compact read-out of the live design, shown above the preview */
const designSummary = computed(() => {
  const d = story.value.design
  const acc = story.value.accent === 'custom' ? `hue ${d.customHue}°` : story.value.accent
  return [story.value.themeKey, acc, story.value.typeMood, `${d.shape} corners`, `${d.density} rhythm`, `${d.motionLevel} motion`]
})

/* design undo/redo — only while the Design tab is active, so the Content tab's
   inputs keep their native text undo. */
function onKey(e: KeyboardEvent) {
  if (tab.value !== 'design' || !(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'z') return
  e.preventDefault()
  if (e.shiftKey) store.redo()
  else store.undo()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

/* device (responsive) preview toggle */
const device = ref<'desktop' | 'mobile'>('desktop')
const previewWidth = computed(() => (device.value === 'mobile' ? '400px' : '860px'))

const fieldCls =
  'rounded-field border border-line bg-ink-field px-3 py-2.5 font-sans text-[0.92rem] text-text outline-none transition-colors focus:border-[oklch(0.82_0.10_205)] w-full min-w-0'
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden bg-ink font-sans text-text">
    <!-- top bar -->
    <nav class="flex shrink-0 items-center justify-between gap-5 border-b border-line-soft px-[clamp(20px,3vw,32px)] py-3.5">
      <div class="flex items-center gap-4">
        <NuxtLink to="/dashboard" class="flex items-center gap-2.5 text-text no-underline">
          <AppLogo :size="26" />
        </NuxtLink>
        <NuxtLink to="/dashboard" class="text-[1rem] leading-none text-text-faint no-underline transition-colors hover:text-text">←</NuxtLink>
        <span class="text-[0.95rem] font-semibold">{{ pageName }}</span>
        <span
          class="font-mono text-[0.72rem] tracking-[0.06em]"
          :class="savedState === 'saved' ? 'saved-pulse text-positive' : 'text-text-faint'"
        >{{ savedLabel }}</span>
      </div>
      <div class="flex items-center gap-3.5">
        <StatusPill
          :label="story.isPublished ? 'published' : 'draft'"
          :tone="story.isPublished ? 'positive' : 'warning'"
        />
        <button
          class="bg-accent cursor-pointer rounded-full border-none px-[22px] py-[9px] font-sans text-[0.88rem] font-semibold text-ink transition-[filter] hover:brightness-110"
          @click="store.togglePublish()"
        >{{ story.isPublished ? 'Unpublish' : 'Publish' }}</button>
      </div>
    </nav>

    <div class="grid min-h-0 flex-1 grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
      <!-- form column -->
      <aside class="flex min-h-0 flex-col overflow-y-auto border-r border-line-soft">
        <!-- write / design tabs -->
        <div class="sticky top-0 z-10 flex gap-1 border-b border-line-soft bg-ink/92 px-[clamp(20px,2.5vw,32px)] py-2.5 backdrop-blur-md">
          <button
            v-for="t in (['content', 'design'] as const)"
            :key="t"
            class="flex-1 cursor-pointer rounded-field border py-2 text-[0.84rem] font-medium capitalize transition-colors"
            :class="tab === t ? 'border-line bg-ink-card text-text' : 'border-transparent bg-transparent text-text-dim hover:text-text'"
            @click="tab = t"
          >{{ t === 'content' ? 'Write' : 'Design' }}</button>
        </div>

        <div class="flex flex-col gap-8 px-[clamp(20px,2.5vw,32px)] pt-6 pb-16">
        <EditorDesignPanel v-if="tab === 'design'" />
        <template v-else>
        <!-- 01 identity -->
        <section class="flex flex-col gap-3.5 border-t border-line-soft pt-[22px]">
          <button
            class="flex cursor-pointer items-center justify-between border-none bg-transparent p-0 font-mono text-[0.7rem] tracking-[0.16em] text-text-faint transition-colors hover:text-text"
            @click="open.identity = !open.identity"
          ><span>01 · identity</span><span>{{ open.identity ? '–' : '+' }}</span></button>
          <div v-if="open.identity" class="row-in flex flex-col gap-3.5">
            <label class="flex flex-col gap-1.5">
              <span class="text-[0.8rem] text-text-dim">Name</span>
              <input v-model="story.identity.name" :class="fieldCls" @input="store.touch()">
            </label>
            <label class="flex flex-col gap-1.5">
              <span class="text-[0.8rem] text-text-dim">Headline, the big line on your page</span>
              <input v-model="story.identity.headline" :class="fieldCls" @input="store.touch()">
            </label>
            <label class="flex flex-col gap-1.5">
              <span class="text-[0.8rem] text-text-dim">Intro, the paragraph under it</span>
              <textarea v-model="story.identity.intro" rows="2" :class="fieldCls" class="resize-y leading-[1.55]" @input="store.touch()" />
            </label>
            <div class="grid grid-cols-2 gap-3">
              <label class="flex flex-col gap-1.5">
                <span class="text-[0.8rem] text-text-dim">Role</span>
                <input v-model="story.identity.role" :class="fieldCls" @input="store.touch()">
              </label>
              <label class="flex flex-col gap-1.5">
                <span class="text-[0.8rem] text-text-dim">Location</span>
                <input v-model="story.identity.location" :class="fieldCls" @input="store.touch()">
              </label>
            </div>
            <label class="flex flex-col gap-1.5">
              <span class="text-[0.8rem] text-text-dim">Page address</span>
              <div class="flex items-center overflow-hidden rounded-field border border-line bg-ink-field">
                <span class="py-2.5 pl-3 font-mono text-[0.78rem] text-text-faint">vella.page/</span>
                <input
                  :value="slug"
                  class="min-w-0 flex-1 border-none bg-transparent py-2.5 pr-3 pl-0.5 font-mono text-[0.78rem] text-text outline-none"
                  @input="store.setSlug(($event.target as HTMLInputElement).value)"
                >
              </div>
              <span class="font-mono text-[0.7rem]" :style="{ color: slugColor }">{{ SLUG_STATUS[slugState] }}</span>
            </label>
          </div>
        </section>

        <!-- 02 about -->
        <section class="flex flex-col gap-3.5 border-t border-line-soft pt-[22px]">
          <button
            class="flex cursor-pointer items-center justify-between border-none bg-transparent p-0 font-mono text-[0.7rem] tracking-[0.16em] text-text-faint transition-colors hover:text-text"
            @click="open.about = !open.about"
          ><span>02 · about</span><span>{{ open.about ? '–' : '+' }}</span></button>
          <div v-if="open.about" class="row-in flex flex-col gap-3.5">
            <label class="flex flex-col gap-1.5">
              <span class="text-[0.8rem] text-text-dim">Pull quote, the line that sums you up</span>
              <textarea v-model="story.about.quote" rows="3" :class="fieldCls" class="resize-y leading-[1.55]" @input="store.touch()" />
            </label>
            <label class="flex flex-col gap-1.5">
              <span class="text-[0.8rem] text-text-dim">The longer story</span>
              <textarea v-model="story.about.body" rows="5" :class="fieldCls" class="resize-y leading-[1.55]" @input="store.touch()" />
            </label>
          </div>
        </section>

        <!-- 03 chapters -->
        <section class="flex flex-col gap-3.5 border-t border-line-soft pt-[22px]">
          <button
            class="flex cursor-pointer items-center justify-between border-none bg-transparent p-0 font-mono text-[0.7rem] tracking-[0.16em] text-text-faint transition-colors hover:text-text"
            @click="open.chapters = !open.chapters"
          ><span>03 · chapters</span><span>{{ open.chapters ? '–' : '+' }}</span></button>
          <template v-if="open.chapters">
            <div
              v-for="(ch, i) in story.chapters"
              :key="i"
              class="row-in flex flex-col gap-2.5 rounded-xl border border-line-soft bg-ink-raised p-3.5"
            >
              <div class="grid grid-cols-[110px_minmax(0,1fr)_28px] items-center gap-2">
                <input
                  v-model="ch.period"
                  placeholder="period"
                  :class="fieldCls"
                  class="rounded-[7px] px-2.5 py-2 font-mono text-[0.78rem]"
                  @input="store.touch()"
                >
                <input
                  v-model="ch.title"
                  placeholder="chapter title"
                  :class="fieldCls"
                  class="rounded-[7px] px-2.5 py-2 text-[0.88rem]"
                  @input="store.touch()"
                >
                <button
                  title="remove chapter"
                  class="h-7 w-7 cursor-pointer rounded-[7px] border border-line bg-transparent text-[0.9rem] leading-none text-text-faint transition-colors hover:border-danger/50 hover:text-danger"
                  @click="store.removeChapter(i)"
                >×</button>
              </div>
              <textarea
                v-model="ch.body"
                rows="3"
                placeholder="what happened"
                :class="fieldCls"
                class="resize-y rounded-[7px] px-2.5 py-2 text-[0.86rem] leading-[1.5]"
                @input="store.touch()"
              />
            </div>
            <button
              class="cursor-pointer rounded-field border border-dashed border-line bg-transparent py-2.5 font-sans text-[0.86rem] text-text-dim transition-colors hover:border-text-faint hover:text-text"
              @click="store.addChapter()"
            >+ add a chapter</button>
          </template>
        </section>

        <!-- 04 media -->
        <section class="flex flex-col gap-3.5 border-t border-line-soft pt-[22px]">
          <button
            class="flex cursor-pointer items-center justify-between border-none bg-transparent p-0 font-mono text-[0.7rem] tracking-[0.16em] text-text-faint transition-colors hover:text-text"
            @click="open.media = !open.media"
          ><span>04 · media</span><span>{{ open.media ? '–' : '+' }}</span></button>
          <div v-if="open.media" class="row-in flex flex-col gap-3">
            <button
              class="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-dashed border-line bg-transparent py-[22px] font-sans text-text-dim transition-colors hover:border-text-faint hover:text-text"
              @click="store.addMedia()"
            >
              <span class="text-[0.88rem] font-medium">drop images here, or browse</span>
              <span class="font-mono text-[0.68rem] tracking-[0.08em] text-text-faint">resized on your device before upload</span>
            </button>
            <div class="grid gap-2.5" style="grid-template-columns: repeat(auto-fill, minmax(84px, 1fr))">
              <div
                v-for="(m, i) in story.gallery"
                :key="m.slot + i"
                class="row-in relative aspect-square overflow-hidden rounded-field border border-line"
                style="background: repeating-linear-gradient(45deg, oklch(0.225 0.018 265) 0 8px, oklch(0.255 0.018 265) 8px 16px)"
              >
                <span class="absolute bottom-1.5 left-[7px] font-mono text-[0.6rem] tracking-[0.06em] text-text-dim">{{ m.slot }}</span>
                <button
                  title="remove image"
                  class="absolute top-[5px] right-[5px] h-5 w-5 cursor-pointer rounded-md border-none bg-[oklch(0.168_0.018_265/0.8)] text-[0.75rem] leading-none text-text-dim transition-colors hover:text-danger"
                  @click="store.removeMedia(i)"
                >×</button>
              </div>
            </div>
          </div>
        </section>

        <!-- 05 links -->
        <section class="flex flex-col gap-3.5 border-t border-line-soft pt-[22px]">
          <button
            class="flex cursor-pointer items-center justify-between border-none bg-transparent p-0 font-mono text-[0.7rem] tracking-[0.16em] text-text-faint transition-colors hover:text-text"
            @click="open.links = !open.links"
          ><span>05 · links</span><span>{{ open.links ? '–' : '+' }}</span></button>
          <template v-if="open.links">
            <div
              v-for="(l, i) in story.links"
              :key="i"
              class="row-in grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_28px] items-center gap-2"
            >
              <input
                v-model="l.label"
                placeholder="label"
                :class="fieldCls"
                class="rounded-[7px] px-2.5 py-2 text-[0.86rem]"
                @input="store.touch()"
              >
              <input
                v-model="l.url"
                placeholder="https://"
                :class="fieldCls"
                class="rounded-[7px] px-2.5 py-2 font-mono text-[0.76rem]"
                @input="store.touch()"
              >
              <button
                title="remove link"
                class="h-7 w-7 cursor-pointer rounded-[7px] border border-line bg-transparent text-[0.9rem] leading-none text-text-faint transition-colors hover:border-danger/50 hover:text-danger"
                @click="store.removeLink(i)"
              >×</button>
            </div>
            <button
              class="cursor-pointer rounded-field border border-dashed border-line bg-transparent py-2.5 font-sans text-[0.86rem] text-text-dim transition-colors hover:border-text-faint hover:text-text"
              @click="store.addLink()"
            >+ add a link</button>
          </template>
        </section>
        </template>
        </div>
      </aside>

      <!-- live preview -->
      <section class="overflow-y-auto bg-ink-deep p-[clamp(20px,3vw,40px)]">
        <div class="mx-auto flex flex-col gap-3.5 transition-[max-width] duration-[350ms] ease-out" :style="{ maxWidth: previewWidth }">
          <div class="flex items-center justify-between gap-3">
            <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">live preview</span>
            <div class="flex items-center gap-1.5">
              <button
                v-for="d in (['desktop', 'mobile'] as const)"
                :key="d"
                class="cursor-pointer rounded-full border px-3 py-[5px] font-mono text-[0.66rem] tracking-[0.08em] text-text transition-colors"
                :style="{
                  borderColor: device === d ? 'var(--color-text-faint)' : 'var(--color-line)',
                  background: device === d ? 'var(--color-ink-card)' : 'transparent',
                }"
                @click="device = d"
              >{{ d }}</button>
            </div>
            <NuxtLink
              :to="`/${slug || store.pageId}`"
              class="font-mono text-[0.7rem] tracking-[0.1em] text-text-faint no-underline transition-colors hover:text-text"
            >open full page →</NuxtLink>
          </div>
          <div class="flex flex-wrap items-center gap-1.5">
            <span
              v-for="(chip, i) in designSummary"
              :key="i"
              class="rounded-full border border-line-soft bg-ink-raised px-2.5 py-1 font-mono text-[0.62rem] tracking-[0.04em] text-text-dim"
            >{{ chip }}</span>
          </div>
          <EditorPreview />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
@keyframes row-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.row-in {
  animation: row-in 0.25s ease-out;
}
@keyframes saved-pulse {
  0% {
    opacity: 0.2;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.7;
  }
}
.saved-pulse {
  animation: saved-pulse 0.6s ease-out;
}
</style>
