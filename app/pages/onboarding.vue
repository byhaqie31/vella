<script setup lang="ts">
/** Onboarding — a 60-second interview that writes the first draft.
 *  Three steps of bounded context, a staged "crafting" moment (mocked, like
 *  autosave), then a reveal: an auto-picked Look plus an auto-drafted story,
 *  with one-tap alternates. Engine lives in app/data/onboarding.ts;
 *  rationale in docs/ONBOARDING.md. */
import type { StoryLink } from '~/types/story'
import {
  CRAFTING_LINES,
  FIELDS,
  GOALS,
  VIBES,
  generateDraft,
  rankLooks,
  suggestHandle,
  type FieldKey,
  type GoalKey,
  type OnboardingContext,
  type OnboardingDraft,
  type VibeKey,
} from '~/data/onboarding'
import { splitHeadline } from '~/themes/registry'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Vella — get started' })

const { user } = useAuth()
const { site, setHandle, setTitle, applyTemplate, touch } = useSite()
const { templates, isLocked } = useTemplates()

/* ── Interview state ───────────────────────────────────────────────────── */

const step = ref(0)
const STEP_COUNT = 3

const name = ref(user.value.name === 'there' ? '' : user.value.name)
const location = ref('')
const handle = ref(site.value.handle || '')
const handleEdited = ref(!!site.value.handle)
watch(name, (n) => {
  if (!handleEdited.value) handle.value = suggestHandle(n)
})

const field = ref<FieldKey | null>(null)
const role = ref('')
const vibe = ref<VibeKey | null>(null)
const roleSuggestions = computed(
  () => FIELDS.find((f) => f.key === field.value)?.roles ?? [],
)

const goal = ref<GoalKey | null>(null)
const available = ref(true)
const linkRows = ref<{ label: string; placeholder: string; url: string }[]>([
  { label: 'website', placeholder: 'https://yoursite.com', url: '' },
  { label: 'linkedin', placeholder: 'https://linkedin.com/in/you', url: '' },
  { label: 'github', placeholder: 'https://github.com/you', url: '' },
  { label: 'instagram', placeholder: 'https://instagram.com/you', url: '' },
])

const canNext = computed(() => {
  if (step.value === 0) return !!name.value.trim()
  if (step.value === 1) return !!field.value && !!vibe.value
  if (step.value === 2) return !!goal.value
  return false
})

/* ── Crafting + reveal ─────────────────────────────────────────────────── */

const crafting = ref(false)
const revealed = ref(false)
const craftLine = ref('')
const draft = ref<OnboardingDraft | null>(null)
const ranked = ref<string[]>([])
const lookIdx = ref(0)
const seed = ref(0)
let timers: ReturnType<typeof setTimeout>[] = []
onUnmounted(() => timers.forEach(clearTimeout))

function context(): OnboardingContext {
  const links: StoryLink[] = linkRows.value
    .filter((l) => l.url.trim())
    .map((l) => ({ label: l.label, url: l.url.trim() }))
  return {
    name: name.value,
    role: role.value,
    location: location.value,
    field: field.value ?? 'other',
    vibe: vibe.value ?? 'bold',
    goal: goal.value ?? 'showcase',
    available: available.value,
    links,
  }
}

function next() {
  if (!canNext.value) return
  if (step.value < STEP_COUNT - 1) {
    step.value++
    return
  }
  craft()
}

function craft() {
  step.value = STEP_COUNT
  crafting.value = true
  revealed.value = false
  timers.forEach(clearTimeout)
  timers = CRAFTING_LINES.map((line, i) =>
    setTimeout(() => (craftLine.value = line), i * 520),
  )
  timers.push(
    setTimeout(() => {
      const ctx = context()
      const unlocked = templates.filter((t) => !isLocked(t)).map((t) => t.key)
      ranked.value = rankLooks(ctx, unlocked)
      lookIdx.value = 0
      seed.value = 0
      draft.value = generateDraft(ctx, 0)
      crafting.value = false
      revealed.value = true
    }, CRAFTING_LINES.length * 520 + 400),
  )
}

const lookKey = computed(() => ranked.value[lookIdx.value] ?? 'editorial-night')
const look = computed(() => templates.find((t) => t.key === lookKey.value) ?? templates[0]!)
const headlineParts = computed(() =>
  splitHeadline(draft.value?.identity.headline ?? ''),
)
const accentStyle = computed(() => ({
  backgroundImage: `linear-gradient(105deg, ${look.value.accent[0]}, ${look.value.accent[1]})`,
}))

function tryAnotherLook() {
  const pool = Math.min(3, ranked.value.length)
  if (pool > 1) lookIdx.value = (lookIdx.value + 1) % pool
}

function redraft() {
  seed.value = (seed.value + 1) % 4
  draft.value = generateDraft(context(), seed.value)
}

function finish() {
  const d = draft.value
  if (!d) return
  setHandle(handle.value || suggestHandle(name.value) || 'me')
  applyTemplate(lookKey.value)
  const story = site.value.story
  story.identity = d.identity
  story.about = d.about
  story.chapters = d.chapters
  story.gallery = d.gallery
  // Always replace, even with an empty list — leftover sample links would make
  // the page someone else's. Themes hide the links section when it is empty.
  story.links = d.links
  setTitle(d.title)
  touch()
  return navigateTo('/dashboard')
}
</script>

<template>
  <div class="grid min-h-screen place-items-center p-6">
    <div class="dash-rise flex w-[min(680px,100%)] flex-col gap-7 py-10">
      <!-- header -->
      <div class="flex flex-col items-center gap-3 text-center">
        <AppLogo :size="34" />
        <template v-if="step < STEP_COUNT">
          <span class="font-mono text-[0.68rem] tracking-[0.18em] text-text-faint">Step {{ step + 1 }} of {{ STEP_COUNT }}</span>
          <h1 class="m-0 text-[1.7rem] font-bold tracking-[-0.01em]">
            {{ step === 0 ? `Welcome, ${user.name}` : step === 1 ? 'What do you make?' : 'What should this page do?' }}
          </h1>
          <p class="m-0 text-[0.95rem] text-text-dim">
            {{ step === 0
              ? 'A few answers and we will draft your page for you.'
              : step === 1
                ? 'This shapes your words and picks your look.'
                : 'One goal, and the page will be written around it.' }}
          </p>
        </template>
      </div>

      <!-- step 1 · who you are -->
      <div v-if="step === 0" class="flex flex-col gap-5">
        <label class="flex flex-col gap-2">
          <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">Your name</span>
          <input
            v-model="name"
            placeholder="Your name"
            class="rounded-field border border-line bg-ink-field px-3.5 py-3 text-[0.95rem] text-text outline-none focus:border-brand"
          >
        </label>
        <label class="flex flex-col gap-2">
          <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">Where you're based <span class="opacity-60">(optional)</span></span>
          <input
            v-model="location"
            placeholder="kuala lumpur"
            class="rounded-field border border-line bg-ink-field px-3.5 py-3 text-[0.95rem] text-text outline-none focus:border-brand"
          >
        </label>
        <div class="flex flex-col gap-2">
          <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">Your address</span>
          <div class="flex items-center overflow-hidden rounded-field border border-line bg-ink-field focus-within:border-brand">
            <input
              v-model="handle"
              placeholder="yourname"
              class="min-w-0 flex-1 border-none bg-transparent py-3 pr-1 pl-3.5 font-mono text-[0.95rem] text-text outline-none"
              @input="handleEdited = !!handle.trim()"
            >
            <span class="py-3 pr-3.5 font-mono text-[0.9rem] text-text-faint">.vella.site</span>
          </div>
        </div>
      </div>

      <!-- step 2 · your craft -->
      <div v-else-if="step === 1" class="flex flex-col gap-6">
        <div class="flex flex-col gap-3">
          <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">Your field</span>
          <div class="grid gap-2.5" style="grid-template-columns: repeat(auto-fill, minmax(190px, 1fr))">
            <button
              v-for="f in FIELDS"
              :key="f.key"
              type="button"
              class="flex cursor-pointer flex-col gap-0.5 rounded-field border px-3.5 py-3 text-left transition-colors"
              :class="field === f.key ? 'border-brand bg-brand-bg/40' : 'border-line-soft bg-ink-field hover:border-line'"
              @click="field = f.key"
            >
              <span class="text-[0.88rem] font-medium">{{ f.label }}</span>
              <span class="font-mono text-[0.66rem] tracking-[0.08em] text-text-faint">{{ f.hint }}</span>
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">What you call yourself</span>
          <input
            v-model="role"
            placeholder="e.g. product designer"
            class="rounded-field border border-line bg-ink-field px-3.5 py-3 text-[0.95rem] text-text outline-none focus:border-brand"
          >
          <div v-if="roleSuggestions.length" class="flex flex-wrap gap-1.5">
            <button
              v-for="r in roleSuggestions"
              :key="r"
              type="button"
              class="cursor-pointer rounded-full border border-line-soft px-3 py-1 font-mono text-[0.7rem] text-text-dim transition-colors hover:border-line hover:text-text"
              @click="role = r"
            >{{ r }}</button>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">The vibe you want</span>
          <div class="grid gap-2.5" style="grid-template-columns: repeat(auto-fill, minmax(190px, 1fr))">
            <button
              v-for="v in VIBES"
              :key="v.key"
              type="button"
              class="flex cursor-pointer flex-col gap-0.5 rounded-field border px-3.5 py-3 text-left transition-colors"
              :class="vibe === v.key ? 'border-brand bg-brand-bg/40' : 'border-line-soft bg-ink-field hover:border-line'"
              @click="vibe = v.key"
            >
              <span class="text-[0.88rem] font-medium">{{ v.label }}</span>
              <span class="font-mono text-[0.66rem] tracking-[0.08em] text-text-faint">{{ v.hint }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- step 3 · your intent -->
      <div v-else-if="step === 2" class="flex flex-col gap-6">
        <div class="flex flex-col gap-3">
          <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">This page should…</span>
          <div class="grid gap-2.5" style="grid-template-columns: repeat(auto-fill, minmax(190px, 1fr))">
            <button
              v-for="g in GOALS"
              :key="g.key"
              type="button"
              class="flex cursor-pointer flex-col gap-0.5 rounded-field border px-3.5 py-3 text-left transition-colors"
              :class="goal === g.key ? 'border-brand bg-brand-bg/40' : 'border-line-soft bg-ink-field hover:border-line'"
              @click="goal = g.key"
            >
              <span class="text-[0.88rem] font-medium">{{ g.label }}</span>
              <span class="font-mono text-[0.66rem] tracking-[0.08em] text-text-faint">{{ g.hint }}</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          class="flex cursor-pointer items-center justify-between rounded-field border px-3.5 py-3 text-left transition-colors"
          :class="available ? 'border-brand bg-brand-bg/40' : 'border-line-soft bg-ink-field hover:border-line'"
          @click="available = !available"
        >
          <span class="flex flex-col gap-0.5">
            <span class="text-[0.88rem] font-medium">Show that you're available</span>
            <span class="font-mono text-[0.66rem] tracking-[0.08em] text-text-faint">adds a highlighted availability line</span>
          </span>
          <span
            class="grid h-5 w-5 place-items-center rounded-full border"
            :class="available ? 'border-brand bg-brand text-ink' : 'border-line'"
          ><DashboardIcon v-if="available" name="check" :size="12" /></span>
        </button>

        <div class="flex flex-col gap-2">
          <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">Links <span class="opacity-60">(optional)</span></span>
          <div class="grid gap-2" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))">
            <div
              v-for="l in linkRows"
              :key="l.label"
              class="flex items-center overflow-hidden rounded-field border border-line-soft bg-ink-field focus-within:border-brand"
            >
              <span class="w-[88px] shrink-0 py-2.5 pl-3.5 font-mono text-[0.72rem] text-text-faint">{{ l.label }}</span>
              <input
                v-model="l.url"
                :placeholder="l.placeholder"
                class="min-w-0 flex-1 border-none bg-transparent py-2.5 pr-3 text-[0.85rem] text-text outline-none"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- step 4 · crafting / reveal -->
      <div v-else class="flex flex-col gap-6">
        <div v-if="crafting" class="flex flex-col items-center gap-4 py-16 text-center">
          <span class="relative grid h-10 w-10 place-items-center">
            <span class="absolute inset-0 animate-ping rounded-full bg-brand opacity-20" />
            <span class="h-3 w-3 rounded-full bg-brand" />
          </span>
          <p class="m-0 font-mono text-[0.8rem] tracking-[0.1em] text-text-dim">{{ craftLine }}</p>
        </div>

        <template v-else-if="revealed && draft">
          <div class="flex flex-col items-center gap-2 text-center">
            <h1 class="m-0 text-[1.7rem] font-bold tracking-[-0.01em]">Your first draft is ready</h1>
            <p class="m-0 text-[0.95rem] text-text-dim">Written from your answers. Every word and every choice stays editable.</p>
          </div>

          <!-- drafted page preview -->
          <div
            class="flex flex-col gap-5 rounded-card border border-line p-7"
            :style="{ background: look.dark ? 'var(--color-ink-deep)' : 'var(--color-paper)', color: look.dark ? 'var(--color-text)' : 'var(--color-paper-ink)' }"
          >
            <div class="flex items-center justify-between gap-3">
              <span class="font-mono text-[0.68rem] tracking-[0.16em] opacity-60">{{ handle || 'you' }}.vella.site</span>
              <span v-if="draft.identity.availability" class="rounded-full border border-current px-2.5 py-0.5 font-mono text-[0.64rem] tracking-[0.08em] opacity-80">{{ draft.identity.availability }}</span>
            </div>
            <h2 class="m-0 text-[1.9rem] leading-[1.15] font-bold tracking-[-0.02em]">
              {{ headlineParts.head }}
              <span v-if="headlineParts.accent" class="bg-clip-text text-transparent" :style="accentStyle">{{ headlineParts.accent }}</span>
            </h2>
            <p class="m-0 text-[0.95rem] leading-relaxed opacity-80">{{ draft.identity.intro }}</p>
            <p class="m-0 border-l-2 pl-4 text-[1.02rem] italic opacity-90" :style="{ borderColor: look.accent[0] }">
              “{{ draft.about.quote }}”
            </p>
            <div class="flex flex-wrap gap-x-4 gap-y-1">
              <span v-for="m in draft.identity.meta" :key="m" class="font-mono text-[0.68rem] tracking-[0.1em] opacity-55">{{ m }}</span>
            </div>
          </div>

          <!-- the picked look -->
          <div class="flex items-center justify-between gap-3 rounded-field border border-line-soft bg-ink-field px-4 py-3">
            <div class="flex items-center gap-3">
              <span class="h-8 w-8 rounded-full" :style="{ background: `linear-gradient(105deg, ${look.accent[0]}, ${look.accent[1]})` }" />
              <div class="flex flex-col">
                <span class="text-[0.88rem] font-medium">{{ look.name }}</span>
                <span class="font-mono text-[0.66rem] tracking-[0.08em] text-text-faint">{{ look.tagline }}</span>
              </div>
            </div>
            <button
              v-if="ranked.length > 1"
              type="button"
              class="cursor-pointer rounded-full border border-line px-4 py-1.5 text-[0.8rem] text-text-dim transition-colors hover:border-brand hover:text-text"
              @click="tryAnotherLook"
            >Try another look</button>
          </div>

          <div class="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              class="cursor-pointer rounded-full border border-line px-5 py-2.5 text-[0.85rem] text-text-dim transition-colors hover:border-brand hover:text-text"
              @click="redraft"
            >Redraft the words</button>
            <button
              type="button"
              class="cursor-pointer rounded-full bg-brand px-8 py-3 text-[0.95rem] font-semibold text-ink transition-[filter] hover:brightness-110"
              @click="finish"
            >Use this page</button>
          </div>
        </template>
      </div>

      <!-- footer nav -->
      <div v-if="step < STEP_COUNT" class="flex items-center justify-between">
        <button
          v-if="step > 0"
          type="button"
          class="cursor-pointer rounded-full px-4 py-2 text-[0.85rem] text-text-faint transition-colors hover:text-text"
          @click="step--"
        >← Back</button>
        <span v-else />
        <button
          type="button"
          class="rounded-full bg-brand px-8 py-3 text-[0.95rem] font-semibold text-ink transition-[filter]"
          :class="canNext ? 'cursor-pointer hover:brightness-110' : 'cursor-not-allowed opacity-40'"
          :disabled="!canNext"
          @click="next"
        >{{ step === STEP_COUNT - 1 ? 'Draft my page' : 'Continue' }}</button>
      </div>
    </div>
  </div>
</template>
