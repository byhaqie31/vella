<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useEditorStore } from '~/stores/editor'
import { ACCENTS, ATMOSPHERES, hueToPair, type Look, LOOKS, resolveAccent, THEMES, TYPE_MOODS } from '~/themes/registry'
import type {
  AccentPreset,
  Atmosphere,
  Density,
  HeadlineAccent,
  MotionLevel,
  Shape,
  TypeMood,
  TypeScale,
} from '~/types/story'

const store = useEditorStore()
const { story, canUndo, canRedo } = storeToRefs(store)

/* The whole panel is tinted by the user's own accent — selected controls glow
   in the colour they picked, so the surface feels authored, not generic. */
const themeDark = computed(() => THEMES[story.value.themeKey].dark)
const accent = computed(() => resolveAccent(story.value.themeKey, story.value))
const sel = computed(() => accent.value[0])
const tint = (c: string, a: number) => c.replace(/\)\s*$/, ` / ${a})`)
const fillCss = computed(() => `linear-gradient(120deg, ${accent.value[0]}, ${accent.value[1]})`)
const textGradCss = computed(() => `linear-gradient(105deg, ${accent.value[0]}, ${accent.value[1]})`)

const accentPresets = Object.keys(ACCENTS) as AccentPreset[]
const presetPair = (k: AccentPreset) => (themeDark.value ? ACCENTS[k].onDark : ACCENTS[k].onLight)
const hueTrackCss = `linear-gradient(90deg, ${Array.from({ length: 13 }, (_, i) => `oklch(0.78 0.135 ${i * 30})`).join(', ')})`

/* option tables — the full allowed range of each control, nothing finer */
const moods: { v: TypeMood; label: string }[] = [
  { v: 'serif', label: 'Serif' },
  { v: 'sans', label: 'Sans' },
  { v: 'mono-accent', label: 'Mono' },
]
const scales: { v: TypeScale; label: string; size: string }[] = [
  { v: 'compact', label: 'Compact', size: '0.9rem' },
  { v: 'balanced', label: 'Balanced', size: '1.1rem' },
  { v: 'generous', label: 'Generous', size: '1.32rem' },
]
const headlines: { v: HeadlineAccent; label: string }[] = [
  { v: 'gradient', label: 'Gradient' },
  { v: 'solid', label: 'Solid' },
  { v: 'underline', label: 'Underline' },
  { v: 'plain', label: 'None' },
]
const densities: { v: Density; label: string; gap: string }[] = [
  { v: 'snug', label: 'Snug', gap: '3px' },
  { v: 'balanced', label: 'Balanced', gap: '5px' },
  { v: 'airy', label: 'Airy', gap: '8px' },
]
const shapes: { v: Shape; label: string; r: string }[] = [
  { v: 'sharp', label: 'Sharp', r: '2px' },
  { v: 'soft', label: 'Soft', r: '7px' },
  { v: 'round', label: 'Round', r: '13px' },
]
const motions: { v: MotionLevel; label: string }[] = [
  { v: 'calm', label: 'Calm' },
  { v: 'balanced', label: 'Balanced' },
  { v: 'expressive', label: 'Expressive' },
]
const atmosKeys = Object.keys(ATMOSPHERES) as Atmosphere[]

const sectionName: Record<string, string> = {
  about: 'About',
  chapters: 'Chapters',
  gallery: 'Gallery',
  links: 'Links',
}

/* a look's mini preview gradient, resolved against its own theme surface */
function lookPair(look: Look): [string, string] {
  const dark = THEMES[look.themeKey].dark
  if (look.accent === 'custom') return hueToPair(look.customHue ?? 265, dark)
  return dark ? ACCENTS[look.accent].onDark : ACCENTS[look.accent].onLight
}
function lookActive(look: Look): boolean {
  const d = story.value.design
  return (
    story.value.themeKey === look.themeKey &&
    story.value.accent === look.accent &&
    story.value.typeMood === look.typeMood &&
    d.atmosphere === look.design.atmosphere &&
    d.shape === look.design.shape &&
    d.headlineAccent === look.design.headlineAccent
  )
}
</script>

<template>
  <div class="flex flex-col gap-7">
    <!-- toolbar -->
    <div class="flex items-center justify-between">
      <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">design</span>
      <div class="flex items-center gap-1">
        <button
          title="Undo (⌘Z)"
          :disabled="!canUndo"
          class="grid h-7 w-7 place-items-center rounded-[7px] border border-line bg-transparent text-text-dim transition-colors enabled:hover:border-text-faint enabled:hover:text-text disabled:opacity-35"
          @click="store.undo()"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-1" /></svg>
        </button>
        <button
          title="Redo (⇧⌘Z)"
          :disabled="!canRedo"
          class="grid h-7 w-7 place-items-center rounded-[7px] border border-line bg-transparent text-text-dim transition-colors enabled:hover:border-text-faint enabled:hover:text-text disabled:opacity-35"
          @click="store.redo()"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 14 5-5-5-5" /><path d="M20 9H9a5 5 0 0 0 0 10h1" /></svg>
        </button>
        <button
          title="Reset design"
          class="ml-1 rounded-[7px] border border-line bg-transparent px-2.5 py-[5px] font-mono text-[0.66rem] tracking-[0.08em] text-text-dim transition-colors hover:border-text-faint hover:text-text"
          @click="store.resetDesign()"
        >reset</button>
      </div>
    </div>

    <!-- looks -->
    <section class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">looks</span>
        <button
          class="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-[5px] font-mono text-[0.66rem] tracking-[0.08em] text-text-dim transition-colors hover:border-text-faint hover:text-text"
          @click="store.shuffle()"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5" /><path d="M4 20 21 3" /><path d="M21 16v5h-5" /><path d="m15 15 6 6" /><path d="M4 4l5 5" /></svg>
          shuffle
        </button>
      </div>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="look in LOOKS"
          :key="look.key"
          :title="look.hint"
          class="group flex cursor-pointer flex-col gap-1.5 rounded-xl border p-1.5 text-left transition-colors"
          :style="{
            borderColor: lookActive(look) ? sel : 'var(--color-line)',
            background: lookActive(look) ? tint(sel, 0.08) : 'var(--color-ink-raised)',
          }"
          @click="store.applyLook(look)"
        >
          <span
            class="relative grid h-12 place-items-center overflow-hidden rounded-[7px]"
            :style="{ background: THEMES[look.themeKey].dark ? 'var(--color-ink)' : 'var(--color-paper)' }"
          >
            <span
              class="absolute -bottom-2 -left-1 h-7 w-7 rounded-full blur-[6px]"
              :style="{ background: lookPair(look)[0], opacity: look.design.atmosphere === 'clean' ? 0 : 0.7 }"
            />
            <span
              class="relative text-[0.92rem] leading-none"
              :style="{
                fontFamily: TYPE_MOODS[look.typeMood].font,
                color: THEMES[look.themeKey].dark ? 'var(--color-text)' : 'var(--color-paper-ink)',
              }"
            >A<em class="not-italic" :style="{ color: lookPair(look)[0] }">a</em></span>
          </span>
          <span class="truncate px-0.5 text-[0.72rem] font-medium text-text-dim transition-colors group-hover:text-text">{{ look.label }}</span>
        </button>
      </div>
    </section>

    <!-- theme -->
    <section class="flex flex-col gap-3 border-t border-line-soft pt-6">
      <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">theme</span>
      <div class="grid grid-cols-2 gap-2.5">
        <button
          v-for="(t, k) in THEMES"
          :key="k"
          class="flex cursor-pointer flex-col gap-2 rounded-xl border bg-ink-raised p-3 text-left transition-colors"
          :style="{ borderColor: story.themeKey === k ? sel : 'var(--color-line)' }"
          @click="store.setTheme(k)"
        >
          <span
            class="relative block h-11 overflow-hidden rounded-[7px]"
            :style="{ background: t.dark ? 'var(--color-ink)' : 'var(--color-paper)' }"
          >
            <span
              class="absolute top-[9px] left-2.5 text-[0.95rem] tracking-[-0.02em]"
              :style="{
                fontFamily: TYPE_MOODS[t.defaultMood].font,
                color: t.dark ? 'var(--color-text)' : 'var(--color-paper-ink)',
              }"
            >Aa</span>
            <span class="absolute bottom-2 left-2.5 right-2.5 h-px" :style="{ background: t.dark ? 'var(--color-line)' : 'var(--color-paper-line)' }" />
          </span>
          <span class="text-[0.84rem] font-medium text-text">{{ t.label }}</span>
        </button>
      </div>
    </section>

    <!-- accent -->
    <section class="flex flex-col gap-3 border-t border-line-soft pt-6">
      <div class="flex items-center justify-between">
        <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">accent</span>
        <span v-if="story.accent === 'custom'" class="font-mono text-[0.66rem] text-text-faint">{{ story.design.customHue }}°</span>
      </div>
      <div class="flex items-center gap-2.5">
        <button
          v-for="k in accentPresets"
          :key="k"
          :title="k"
          class="h-9 w-9 cursor-pointer rounded-full border-2 p-0 transition-transform hover:scale-105"
          :style="{
            background: `linear-gradient(120deg, ${presetPair(k)[0]}, ${presetPair(k)[1]})`,
            borderColor: story.accent === k ? 'var(--color-text)' : 'transparent',
          }"
          @click="store.setAccent(k)"
        />
        <button
          title="custom hue"
          class="grid h-9 w-9 cursor-pointer place-items-center rounded-full border-2 p-0 transition-transform hover:scale-105"
          style="background: conic-gradient(from 0deg, oklch(0.78 0.135 0), oklch(0.78 0.135 90), oklch(0.78 0.135 180), oklch(0.78 0.135 270), oklch(0.78 0.135 360))"
          :style="{ borderColor: story.accent === 'custom' ? 'var(--color-text)' : 'transparent' }"
          @click="store.setAccent('custom')"
        >
          <span class="h-3 w-3 rounded-full bg-ink/80" />
        </button>
      </div>
      <div v-if="story.accent === 'custom'" class="custom-row flex flex-col gap-2.5 pt-1">
        <input
          type="range"
          min="0"
          max="359"
          :value="story.design.customHue"
          class="hue-slider"
          :style="{ background: hueTrackCss }"
          @pointerdown="store.snapshot()"
          @input="store.setHue(+($event.target as HTMLInputElement).value)"
        >
        <div class="flex items-center gap-2.5">
          <span class="h-7 flex-1 rounded-full" :style="{ background: fillCss }" />
          <span class="font-mono text-[0.66rem] text-text-faint">any hue · always tasteful</span>
        </div>
      </div>
    </section>

    <!-- type -->
    <section class="flex flex-col gap-3.5 border-t border-line-soft pt-6">
      <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">type</span>
      <div class="flex gap-2">
        <button
          v-for="m in moods"
          :key="m.v"
          class="flex-1 cursor-pointer rounded-field border py-2 text-[0.84rem] font-medium transition-colors"
          :style="{
            fontFamily: TYPE_MOODS[m.v].font,
            background: story.typeMood === m.v ? tint(sel, 0.12) : 'transparent',
            borderColor: story.typeMood === m.v ? sel : 'var(--color-line)',
            color: story.typeMood === m.v ? 'var(--color-text)' : 'var(--color-text-dim)',
          }"
          @click="store.setMood(m.v)"
        >{{ m.label }}</button>
      </div>
      <!-- scale -->
      <div class="flex items-stretch gap-2">
        <button
          v-for="s in scales"
          :key="s.v"
          class="flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-field border py-2 transition-colors"
          :style="{
            background: story.design.typeScale === s.v ? tint(sel, 0.12) : 'transparent',
            borderColor: story.design.typeScale === s.v ? sel : 'var(--color-line)',
          }"
          @click="store.setTypeScale(s.v)"
        >
          <span class="leading-none text-text" :style="{ fontSize: s.size, fontFamily: 'var(--font-display)' }">A</span>
          <span class="text-[0.7rem] text-text-dim">{{ s.label }}</span>
        </button>
      </div>
      <!-- headline accent treatment -->
      <div class="grid grid-cols-4 gap-2">
        <button
          v-for="h in headlines"
          :key="h.v"
          :title="`Headline accent: ${h.label}`"
          class="flex cursor-pointer flex-col items-center gap-1 rounded-field border py-2 transition-colors"
          :style="{
            background: story.design.headlineAccent === h.v ? tint(sel, 0.12) : 'transparent',
            borderColor: story.design.headlineAccent === h.v ? sel : 'var(--color-line)',
          }"
          @click="store.setHeadlineAccent(h.v)"
        >
          <span
            class="text-[1rem] leading-none"
            :style="
              h.v === 'gradient'
                ? { background: textGradCss, '-webkit-background-clip': 'text', backgroundClip: 'text', color: 'transparent' }
                : h.v === 'solid'
                  ? { color: sel }
                  : h.v === 'underline'
                    ? { color: 'var(--color-text)', borderBottom: `2px solid ${sel}`, paddingBottom: '1px' }
                    : { color: 'var(--color-text-faint)' }
            "
          >Aa</span>
          <span class="text-[0.64rem] text-text-dim">{{ h.label }}</span>
        </button>
      </div>
    </section>

    <!-- atmosphere -->
    <section class="flex flex-col gap-3 border-t border-line-soft pt-6">
      <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">atmosphere</span>
      <div class="grid grid-cols-2 gap-2.5">
        <button
          v-for="a in atmosKeys"
          :key="a"
          class="flex cursor-pointer flex-col gap-2 rounded-xl border p-2 text-left transition-colors"
          :style="{
            borderColor: story.design.atmosphere === a ? sel : 'var(--color-line)',
            background: story.design.atmosphere === a ? tint(sel, 0.08) : 'var(--color-ink-raised)',
          }"
          @click="store.setAtmosphere(a)"
        >
          <span class="relative block h-10 overflow-hidden rounded-[7px] bg-ink">
            <template v-if="a === 'glow'">
              <span class="absolute -left-2 -top-2 h-9 w-9 rounded-full blur-[7px]" :style="{ background: accent[0], opacity: 0.6 }" />
              <span class="absolute -right-3 bottom-0 h-9 w-9 rounded-full blur-[7px]" :style="{ background: accent[1], opacity: 0.5 }" />
            </template>
            <span v-else-if="a === 'grain'" class="atmos-grain absolute inset-0" />
            <span v-else-if="a === 'vignette'" class="absolute inset-0" style="box-shadow: inset 0 0 18px 6px oklch(0 0 0 / 0.7)" />
          </span>
          <div class="flex flex-col">
            <span class="text-[0.78rem] font-medium text-text">{{ ATMOSPHERES[a].label }}</span>
            <span class="text-[0.66rem] leading-tight text-text-faint">{{ ATMOSPHERES[a].hint }}</span>
          </div>
        </button>
      </div>
    </section>

    <!-- rhythm: density + shape -->
    <section class="flex flex-col gap-3.5 border-t border-line-soft pt-6">
      <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">rhythm</span>
      <div class="flex items-stretch gap-2">
        <button
          v-for="den in densities"
          :key="den.v"
          class="flex flex-1 cursor-pointer flex-col items-center gap-1.5 rounded-field border py-2.5 transition-colors"
          :style="{
            background: story.design.density === den.v ? tint(sel, 0.12) : 'transparent',
            borderColor: story.design.density === den.v ? sel : 'var(--color-line)',
          }"
          @click="store.setDensity(den.v)"
        >
          <span class="flex flex-col items-stretch" :style="{ gap: den.gap, width: '22px' }">
            <span class="h-px bg-text-dim" /><span class="h-px bg-text-dim" /><span class="h-px bg-text-dim" />
          </span>
          <span class="text-[0.7rem] text-text-dim">{{ den.label }}</span>
        </button>
      </div>
      <div class="flex items-stretch gap-2">
        <button
          v-for="sh in shapes"
          :key="sh.v"
          class="flex flex-1 cursor-pointer flex-col items-center gap-1.5 rounded-field border py-2.5 transition-colors"
          :style="{
            background: story.design.shape === sh.v ? tint(sel, 0.12) : 'transparent',
            borderColor: story.design.shape === sh.v ? sel : 'var(--color-line)',
          }"
          @click="store.setShape(sh.v)"
        >
          <span class="h-4 w-6 border-2 border-text-dim border-b-0 border-r-0" :style="{ borderTopLeftRadius: sh.r }" />
          <span class="text-[0.7rem] text-text-dim">{{ sh.label }}</span>
        </button>
      </div>
    </section>

    <!-- motion -->
    <section class="flex flex-col gap-3 border-t border-line-soft pt-6">
      <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">motion</span>
      <div class="flex gap-2">
        <button
          v-for="mo in motions"
          :key="mo.v"
          class="flex-1 cursor-pointer rounded-field border py-2 text-[0.82rem] font-medium transition-colors"
          :style="{
            background: story.design.motionLevel === mo.v ? tint(sel, 0.12) : 'transparent',
            borderColor: story.design.motionLevel === mo.v ? sel : 'var(--color-line)',
            color: story.design.motionLevel === mo.v ? 'var(--color-text)' : 'var(--color-text-dim)',
          }"
          @click="store.setMotionLevel(mo.v)"
        >{{ mo.label }}</button>
      </div>
    </section>

    <!-- sections -->
    <section class="flex flex-col gap-3 border-t border-line-soft pt-6">
      <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">sections · order &amp; visibility</span>
      <div class="flex items-center gap-2.5 rounded-field border border-line-soft bg-ink-raised px-3 py-2 opacity-60">
        <span class="font-mono text-[0.66rem] tracking-[0.08em] text-text-faint">00</span>
        <span class="text-[0.86rem] font-medium text-text-dim">Identity</span>
        <span class="ml-auto font-mono text-[0.62rem] text-text-faint">always first</span>
      </div>
      <ul class="flex flex-col gap-2">
        <li
          v-for="(s, i) in story.design.sections"
          :key="s.id"
          class="flex items-center gap-2.5 rounded-field border border-line bg-ink-raised px-3 py-2 transition-opacity"
          :class="{ 'opacity-45': !s.visible }"
        >
          <span class="font-mono text-[0.66rem] tracking-[0.08em] text-text-faint">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="text-[0.86rem] font-medium text-text">{{ sectionName[s.id] }}</span>
          <div class="ml-auto flex items-center gap-1">
            <button
              :disabled="i === 0"
              title="move up"
              class="grid h-6 w-6 place-items-center rounded-[6px] text-text-faint transition-colors enabled:hover:bg-ink-field enabled:hover:text-text disabled:opacity-25"
              @click="store.moveSection(s.id, -1)"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6" /></svg>
            </button>
            <button
              :disabled="i === story.design.sections.length - 1"
              title="move down"
              class="grid h-6 w-6 place-items-center rounded-[6px] text-text-faint transition-colors enabled:hover:bg-ink-field enabled:hover:text-text disabled:opacity-25"
              @click="store.moveSection(s.id, 1)"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            </button>
            <button
              :title="s.visible ? 'hide section' : 'show section'"
              class="grid h-6 w-6 place-items-center rounded-[6px] transition-colors hover:bg-ink-field"
              :style="{ color: s.visible ? sel : 'var(--color-text-faint)' }"
              @click="store.toggleSection(s.id)"
            >
              <svg v-if="s.visible" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.9 4.2A9.1 9.1 0 0 1 12 4c6.5 0 10 7 10 7a13 13 0 0 1-2 2.8" /><path d="M6.6 6.6A13 13 0 0 0 2 11s3.5 7 10 7a9 9 0 0 0 4.4-1.1" /><path d="m2 2 20 20" /></svg>
            </button>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.custom-row {
  animation: fade-down 0.25s ease-out;
}
@keyframes fade-down {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* fine analog texture for the grain atmosphere swatch */
.atmos-grain {
  background-image: radial-gradient(oklch(1 0 0 / 0.09) 0.5px, transparent 0.5px);
  background-size: 3px 3px;
}

/* hue slider — track is the live OKLCH spectrum, thumb is a clean white ring */
.hue-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 14px;
  width: 100%;
  border-radius: 999px;
  outline: none;
  cursor: pointer;
  border: 1px solid var(--color-line);
}
.hue-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 999px;
  background: var(--color-text);
  border: 3px solid var(--color-ink);
  box-shadow: 0 1px 6px oklch(0 0 0 / 0.5);
  cursor: grab;
}
.hue-slider::-webkit-slider-thumb:active { cursor: grabbing; }
.hue-slider::-moz-range-thumb {
  height: 18px;
  width: 18px;
  border-radius: 999px;
  background: var(--color-text);
  border: 3px solid var(--color-ink);
  cursor: grab;
}
</style>
