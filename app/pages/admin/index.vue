<script setup lang="ts">
useHead({ title: 'vella — admin' })

type View = 'overview' | 'users' | 'pages' | 'moderation' | 'payments'
const view = ref<View>('overview')

const VIEWS: Record<View, { title: string; sub: string }> = {
  overview: { title: 'This week', sub: 'June 5 to 11, 2026' },
  users: { title: 'Users', sub: 'Search, inspect, act. Opening user content requires a reason.' },
  pages: { title: 'Pages', sub: 'Everything published, newest first.' },
  moderation: { title: 'Moderation', sub: 'Reported and auto-flagged pages. Take down keeps data, public route returns 410.' },
  payments: { title: 'Payments', sub: 'Webhook rows are the source of truth. Settlement reconciles payouts against them.' },
}
const navKeys = Object.keys(VIEWS) as View[]

/* ---- overview: metrics count up on mount ---- */
const statProgress = ref(0)
let raf = 0
onMounted(() => {
  const start = performance.now()
  const tick = (t: number) => {
    const p = Math.min(1, (t - start) / 900)
    statProgress.value = 1 - Math.pow(1 - p, 3)
    if (p < 1) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
})
onBeforeUnmount(() => cancelAnimationFrame(raf))

const cnt = (n: number) => Math.round(n * statProgress.value).toLocaleString()
const metrics = computed(() => [
  { label: 'users', value: cnt(2841), delta: '+118 this week', positive: true },
  { label: 'published pages', value: cnt(903), delta: '+41 this week', positive: true },
  { label: 'pro users', value: cnt(167), delta: '5.9% conversion', positive: true },
  { label: 'mrr equivalent', value: `RM${cnt(2643)}`, delta: 'active pro value / months', positive: false },
  { label: 'views 30d', value: `${cnt(482)}k`, delta: '+11% vs prior', positive: true },
])

const activity = [
  { when: '2m', text: 'page published · vella.page/sofia-reads' },
  { when: '18m', text: 'pro payment paid · RM190 · dan.weir@gmail.com' },
  { when: '1h', text: 'report received · vella.page/cheapwatches4u · spam' },
  { when: '3h', text: 'user signed up · mei.tan@outlook.com' },
  { when: '5h', text: 'page taken down · vella.page/freecrypto · operator amir, reason: scam links' },
]

/* ---- users ---- */
interface AdminUser {
  id: number
  name: string
  email: string
  plan: 'free' | 'pro'
  pages: number
  joined: string
  views: string
  payments: string
}
const usersData: AdminUser[] = [
  { id: 1, name: 'Alia Rahman', email: 'alia@huruf.studio', plan: 'free', pages: 2, joined: 'jan 2026', views: '1.4k', payments: 'RM19 lifetime' },
  { id: 2, name: 'Daniel Weir', email: 'dan.weir@gmail.com', plan: 'pro', pages: 1, joined: 'feb 2026', views: '3.2k', payments: 'RM190 lifetime' },
  { id: 3, name: 'Sofia Lim', email: 'sofia.l@proton.me', plan: 'pro', pages: 1, joined: 'mar 2026', views: '8.9k', payments: 'RM209 lifetime' },
  { id: 4, name: 'Mei Tan', email: 'mei.tan@outlook.com', plan: 'free', pages: 1, joined: 'jun 2026', views: '210', payments: '—' },
]
const userQuery = ref('')
const users = computed(() =>
  usersData.filter(
    (u) => !userQuery.value || `${u.name}${u.email}`.toLowerCase().includes(userQuery.value.toLowerCase()),
  ),
)

/* user drawer — opening user content is reason-gated and audit-logged */
const drawerUser = ref<AdminUser | null>(null)
const reasonText = ref('')
const contentOpened = ref(false)
function openDrawer(u: AdminUser) {
  drawerUser.value = u
  reasonText.value = ''
  contentOpened.value = false
}
const drawerFacts = computed(() =>
  drawerUser.value
    ? [
        { k: 'plan', v: drawerUser.value.plan },
        { k: 'pages', v: String(drawerUser.value.pages) },
        { k: 'views 30d', v: drawerUser.value.views },
        { k: 'payments', v: drawerUser.value.payments },
        { k: 'joined', v: drawerUser.value.joined },
      ]
    : [],
)

/* ---- pages ---- */
type PageStatus = 'published' | 'draft' | 'taken down'
const pagesData: { slug: string; owner: string; theme: string; status: PageStatus }[] = [
  { slug: 'vella.page/sofia-reads', owner: 'sofia.l@proton.me', theme: 'editorial', status: 'published' },
  { slug: 'vella.page/alia', owner: 'alia@huruf.studio', theme: 'editorial', status: 'published' },
  { slug: 'vella.page/daniel-w', owner: 'dan.weir@gmail.com', theme: 'minimal', status: 'published' },
  { slug: 'vella.page/cheapwatches4u', owner: 'promo1192@mailbox.cc', theme: 'editorial', status: 'published' },
  { slug: 'vella.page/freecrypto', owner: 'winbig@tutamail.com', theme: 'editorial', status: 'taken down' },
  { slug: 'vella.page/huruf', owner: 'alia@huruf.studio', theme: 'minimal', status: 'draft' },
]
const pageFilter = ref<'all' | PageStatus>('all')
const pageFilters = ['all', 'published', 'draft', 'taken down'] as const
const pageRows = computed(() =>
  pagesData.filter((r) => pageFilter.value === 'all' || r.status === pageFilter.value),
)
const STATUS_TONE: Record<PageStatus, 'positive' | 'warning' | 'danger'> = {
  published: 'positive',
  draft: 'warning',
  'taken down': 'danger',
}

/* ---- moderation queue: take down / restore ---- */
interface QueueItem {
  id: number
  slug: string
  reason: string
  meta: string
  status: 'published' | 'taken down'
}
const queue = ref<QueueItem[]>([
  { id: 1, slug: 'vella.page/cheapwatches4u', reason: 'reported · spam, 4 reports', meta: 'promo1192@mailbox.cc · first published jun 8', status: 'published' },
  { id: 2, slug: 'vella.page/freecrypto', reason: 'auto-flagged · scam link patterns', meta: 'winbig@tutamail.com · first published jun 10', status: 'taken down' },
  { id: 3, slug: 'vella.page/mei-illustrates', reason: 'reported · copyright claim, 1 report', meta: 'mei.tan@outlook.com · first published may 30', status: 'published' },
])
function dismiss(id: number) {
  queue.value = queue.value.filter((q) => q.id !== id)
}
function act(id: number) {
  queue.value = queue.value.map((q) =>
    q.id === id ? { ...q, status: q.status === 'taken down' ? 'published' : 'taken down' } : q,
  )
}

/* ---- payments & settlement ---- */
const reconciled = ref(false)
type PayStatus = 'paid' | 'failed' | 'refunded'
const paymentRows: { id: string; user: string; amount: string; status: PayStatus; batch: string }[] = [
  { id: 'bz_8841a2', user: 'sofia.l@proton.me', amount: 'RM190', status: 'paid', batch: 'jun 9' },
  { id: 'bz_8839f0', user: 'dan.weir@gmail.com', amount: 'RM190', status: 'paid', batch: 'jun 9' },
  { id: 'bz_8835c7', user: 'mei.tan@outlook.com', amount: 'RM19', status: 'failed', batch: '—' },
  { id: 'bz_8812d4', user: 'sofia.l@proton.me', amount: 'RM19', status: 'refunded', batch: 'jun 2' },
]
const PAY_TONE: Record<PayStatus, 'positive' | 'warning' | 'danger'> = {
  paid: 'positive',
  failed: 'danger',
  refunded: 'warning',
}
</script>

<template>
  <div class="flex min-h-screen bg-ink font-sans text-text">
    <!-- admin sidebar -->
    <aside class="sticky top-0 flex h-screen w-[216px] shrink-0 flex-col border-r border-line-soft px-3.5 py-5">
      <div class="flex items-center gap-[11px] px-2.5 pt-1 pb-3">
        <AppLogo :size="28" wordmark />
      </div>
      <span class="mx-2.5 mb-4 self-start rounded-full border border-warning/35 px-2.5 py-[3px] font-mono text-[0.64rem] tracking-[0.1em] text-warning">
        admin · production
      </span>
      <nav class="flex flex-col gap-1">
        <button
          v-for="k in navKeys"
          :key="k"
          class="flex cursor-pointer items-center gap-2.5 rounded-field border-none px-3 py-[9px] text-left font-sans text-[0.92rem] transition-colors"
          :class="view === k ? 'bg-ink-card font-medium text-text' : 'bg-transparent text-text-dim hover:bg-ink-raised hover:text-text'"
          @click="view = k; drawerUser = null"
        >{{ k }}</button>
      </nav>
      <div class="mt-auto flex flex-col gap-0.5 border-t border-line-soft px-2.5 pt-2.5 pb-1">
        <span class="text-[0.82rem] font-medium">operator</span>
        <span class="font-mono text-[0.66rem] text-text-faint">cloudflare access · role admin</span>
      </div>
    </aside>

    <main class="min-w-0 flex-1 px-[clamp(24px,4vw,56px)] pt-[clamp(32px,6vh,56px)] pb-20">
      <div class="flex max-w-[980px] flex-col gap-8">
        <header class="flex flex-col gap-2">
          <h1 class="m-0 font-display text-[clamp(1.9rem,1.4rem+2vw,2.8rem)] font-normal leading-[1.05] tracking-[-0.01em]">
            {{ VIEWS[view].title }}
          </h1>
          <p class="m-0 text-[0.95rem] text-text-dim">{{ VIEWS[view].sub }}</p>
        </header>

        <!-- overview -->
        <div v-if="view === 'overview'" class="fade-in flex flex-col gap-8">
          <section class="grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))">
            <div
              v-for="m in metrics"
              :key="m.label"
              class="flex flex-col gap-2 rounded-card border border-line-soft bg-ink-raised px-[22px] py-5"
            >
              <span class="font-mono text-[0.68rem] tracking-[0.14em] text-text-faint">{{ m.label }}</span>
              <span class="font-display text-[2.2rem] leading-none font-normal">{{ m.value }}</span>
              <span class="font-mono text-[0.74rem]" :class="m.positive ? 'text-positive' : 'text-text-faint'">{{ m.delta }}</span>
            </div>
          </section>
          <section class="flex flex-col gap-3.5">
            <h2 class="m-0 font-display text-[1.4rem] font-medium">Recent activity</h2>
            <div class="overflow-hidden rounded-card border border-line-soft">
              <div
                v-for="a in activity"
                :key="a.text"
                class="flex items-baseline gap-3.5 border-b border-line-soft/60 bg-ink-raised/40 px-5 py-[13px]"
              >
                <span class="w-16 shrink-0 font-mono text-[0.72rem] text-text-faint">{{ a.when }}</span>
                <span class="text-[0.9rem] text-text-dim">{{ a.text }}</span>
              </div>
            </div>
          </section>
        </div>

        <!-- users -->
        <div v-else-if="view === 'users'" class="fade-in flex flex-col gap-4">
          <input
            v-model="userQuery"
            placeholder="search email or name"
            class="w-[min(360px,100%)] rounded-field border border-line bg-ink-field px-3.5 py-2.5 font-mono text-[0.8rem] text-text outline-none transition-colors focus:border-[oklch(0.82_0.10_205)]"
          >
          <div class="overflow-hidden rounded-card border border-line-soft">
            <div class="grid grid-cols-[minmax(180px,1.6fr)_90px_70px_110px_90px] gap-3.5 border-b border-line-soft bg-ink-raised px-5 py-[11px]">
              <span v-for="h in ['user', 'plan', 'pages', 'joined', '']" :key="h" class="font-mono text-[0.66rem] tracking-[0.14em] text-text-faint">{{ h }}</span>
            </div>
            <div
              v-for="u in users"
              :key="u.id"
              class="grid grid-cols-[minmax(180px,1.6fr)_90px_70px_110px_90px] items-center gap-3.5 border-b border-line-soft/60 px-5 py-[13px] transition-colors hover:bg-ink-raised/50"
            >
              <div class="flex min-w-0 flex-col gap-0.5">
                <span class="text-[0.9rem] font-medium">{{ u.name }}</span>
                <span class="truncate font-mono text-[0.72rem] text-text-faint">{{ u.email }}</span>
              </div>
              <span class="justify-self-start">
                <StatusPill :label="u.plan" :tone="u.plan === 'pro' ? 'accent' : 'neutral'" />
              </span>
              <span class="font-mono text-[0.8rem] text-text-dim">{{ u.pages }}</span>
              <span class="font-mono text-[0.76rem] text-text-faint">{{ u.joined }}</span>
              <button
                class="cursor-pointer rounded-full border border-line bg-transparent px-3.5 py-1.5 font-sans text-[0.8rem] font-medium text-text transition-colors hover:border-text-faint"
                @click="openDrawer(u)"
              >Open</button>
            </div>
          </div>
        </div>

        <!-- pages -->
        <div v-else-if="view === 'pages'" class="fade-in flex flex-col gap-4">
          <div class="flex gap-2">
            <button
              v-for="f in pageFilters"
              :key="f"
              class="cursor-pointer rounded-full border px-4 py-1.5 font-mono text-[0.72rem] tracking-[0.06em] text-text transition-colors"
              :style="{
                borderColor: pageFilter === f ? 'var(--color-text-faint)' : 'var(--color-line)',
                background: pageFilter === f ? 'var(--color-ink-card)' : 'transparent',
              }"
              @click="pageFilter = f"
            >{{ f }}</button>
          </div>
          <div class="overflow-hidden rounded-card border border-line-soft">
            <div
              v-for="r in pageRows"
              :key="r.slug"
              class="grid grid-cols-[minmax(170px,1.4fr)_minmax(150px,1.2fr)_100px_110px] items-center gap-3.5 border-b border-line-soft/60 px-5 py-[13px] transition-colors hover:bg-ink-raised/50"
            >
              <span class="font-mono text-[0.82rem]">{{ r.slug }}</span>
              <span class="truncate text-[0.86rem] text-text-dim">{{ r.owner }}</span>
              <span class="font-mono text-[0.76rem] text-text-faint">{{ r.theme }}</span>
              <span class="justify-self-start"><StatusPill :label="r.status" :tone="STATUS_TONE[r.status]" /></span>
            </div>
          </div>
        </div>

        <!-- moderation -->
        <div v-else-if="view === 'moderation'" class="fade-in flex flex-col gap-3.5">
          <div
            v-for="q in queue"
            :key="q.id"
            class="flex flex-wrap items-center gap-[18px] rounded-card border bg-ink-raised px-[22px] py-[18px]"
            :style="{ borderColor: q.status === 'taken down' ? 'var(--color-line-soft)' : 'oklch(0.72 0.16 25 / 0.25)' }"
          >
            <div class="flex min-w-[200px] flex-1 flex-col gap-1">
              <span class="font-mono text-[0.84rem]">{{ q.slug }}</span>
              <span class="text-[0.84rem] text-text-dim">{{ q.reason }}</span>
              <span class="font-mono text-[0.7rem] text-text-faint">{{ q.meta }}</span>
            </div>
            <StatusPill
              :label="q.status"
              :tone="q.status === 'taken down' ? 'danger' : 'positive'"
            />
            <div class="flex gap-2">
              <NuxtLink
                to="/alia"
                class="rounded-full border border-line px-4 py-[7px] text-[0.8rem] font-medium text-text no-underline transition-colors hover:border-text-faint"
              >Review</NuxtLink>
              <button
                v-if="q.status !== 'taken down'"
                class="cursor-pointer rounded-full border border-line bg-transparent px-4 py-[7px] font-sans text-[0.8rem] text-text-dim transition-colors hover:border-text-faint"
                @click="dismiss(q.id)"
              >Dismiss</button>
              <button
                class="cursor-pointer rounded-full border bg-transparent px-4 py-[7px] font-sans text-[0.8rem] font-medium transition-[filter] hover:brightness-125"
                :class="q.status === 'taken down' ? 'border-line text-text' : 'border-danger/50 text-danger'"
                @click="act(q.id)"
              >{{ q.status === 'taken down' ? 'Restore' : 'Take down' }}</button>
            </div>
          </div>
          <p class="m-0 font-mono text-[0.72rem] text-text-faint">
            take down keeps all data and returns a neutral 410 on the public route. every action lands in the audit log with operator and reason.
          </p>
        </div>

        <!-- payments -->
        <div v-else-if="view === 'payments'" class="fade-in flex flex-col gap-6">
          <div
            class="flex flex-col gap-3.5 rounded-card border bg-ink-raised px-6 py-[22px]"
            :style="{ borderColor: reconciled ? 'var(--color-line-soft)' : 'oklch(0.84 0.13 80 / 0.35)' }"
          >
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div class="flex flex-col gap-[3px]">
                <span class="text-[0.95rem] font-medium">Billplz payout · jun 9</span>
                <span class="font-mono text-[0.74rem] text-text-faint">
                  expected RM1,253.00 · received RM1,234.00 · diff <span class="text-danger">−RM19.00</span>
                </span>
              </div>
              <button
                class="cursor-pointer rounded-full border border-line bg-transparent px-[18px] py-2 font-sans text-[0.82rem] font-medium transition-colors hover:border-text-faint"
                :class="reconciled ? 'text-positive' : 'text-text'"
                @click="reconciled = true"
              >{{ reconciled ? 'Reconciled' : 'Mark reconciled' }}</button>
            </div>
          </div>
          <div class="overflow-hidden rounded-card border border-line-soft">
            <div class="grid grid-cols-[120px_minmax(160px,1.4fr)_80px_90px_110px] gap-3.5 border-b border-line-soft bg-ink-raised px-5 py-[11px]">
              <span v-for="h in ['billplz id', 'user', 'amount', 'status', 'payout batch']" :key="h" class="font-mono text-[0.66rem] tracking-[0.14em] text-text-faint">{{ h }}</span>
            </div>
            <div
              v-for="p in paymentRows"
              :key="p.id"
              class="grid grid-cols-[120px_minmax(160px,1.4fr)_80px_90px_110px] items-center gap-3.5 border-b border-line-soft/60 px-5 py-[13px] transition-colors hover:bg-ink-raised/50"
            >
              <span class="font-mono text-[0.76rem] text-text-dim">{{ p.id }}</span>
              <span class="truncate text-[0.86rem] text-text-dim">{{ p.user }}</span>
              <span class="font-mono text-[0.8rem]">{{ p.amount }}</span>
              <span class="justify-self-start"><StatusPill :label="p.status" :tone="PAY_TONE[p.status]" /></span>
              <span class="font-mono text-[0.74rem] text-text-faint">{{ p.batch }}</span>
            </div>
          </div>
          <p class="m-0 font-mono text-[0.72rem] text-text-faint">
            refunds: mark refunded here, adjust pro_until, execute the transfer in the billplz dashboard. no money moves from this screen.
          </p>
        </div>
      </div>
    </main>

    <!-- user drawer -->
    <Teleport to="body">
      <div
        v-if="drawerUser"
        class="fade-in fixed inset-0 z-[60] bg-[oklch(0.1_0.018_265/0.6)]"
        @click="drawerUser = null"
      >
        <div
          class="drawer-in absolute inset-y-0 right-0 flex w-[min(380px,92vw)] flex-col gap-[22px] overflow-y-auto border-l border-line bg-ink-raised px-[26px] py-7 font-sans text-text"
          @click.stop
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex flex-col gap-[3px]">
              <span class="font-display text-[1.3rem] font-medium">{{ drawerUser.name }}</span>
              <span class="font-mono text-[0.74rem] text-text-faint">{{ drawerUser.email }}</span>
            </div>
            <button
              class="h-[26px] w-[26px] cursor-pointer rounded-[7px] border border-line bg-transparent text-[0.85rem] leading-none text-text-dim"
              @click="drawerUser = null"
            >×</button>
          </div>
          <div class="flex flex-col gap-2 border-t border-line-soft pt-4">
            <div v-for="f in drawerFacts" :key="f.k" class="flex justify-between gap-3">
              <span class="font-mono text-[0.72rem] text-text-faint">{{ f.k }}</span>
              <span class="font-mono text-[0.76rem] text-text">{{ f.v }}</span>
            </div>
          </div>
          <div class="flex flex-col gap-2.5 border-t border-line-soft pt-4">
            <span class="font-mono text-[0.68rem] tracking-[0.14em] text-text-faint">view user content</span>
            <span class="text-[0.82rem] leading-[1.5] text-text-dim">
              Opening a user's pages requires a logged reason. This is operator tooling, not browsing.
            </span>
            <input
              v-model="reasonText"
              placeholder="reason, e.g. report #182"
              class="rounded-field border border-line bg-ink-field px-3 py-[9px] font-mono text-[0.76rem] text-text outline-none transition-colors focus:border-[oklch(0.82_0.10_205)]"
            >
            <button
              :disabled="!reasonText.trim()"
              class="rounded-field border border-line bg-transparent py-[9px] font-sans text-[0.84rem] font-medium transition-colors"
              :class="reasonText.trim() ? 'cursor-pointer text-text hover:border-text-faint' : 'cursor-not-allowed text-text-faint'"
              @click="reasonText.trim() && (contentOpened = true)"
            >Open pages, log reason</button>
            <span v-if="contentOpened" class="font-mono text-[0.7rem] text-positive">
              logged to audit · operator, reason, timestamp
            </span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.fade-in {
  animation: fade-in 0.2s ease-out;
}
@keyframes drawer-in {
  from {
    transform: translateX(24px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
.drawer-in {
  animation: drawer-in 0.15s ease-out;
}
</style>
