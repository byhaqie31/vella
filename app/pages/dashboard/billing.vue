<script setup lang="ts">
definePageMeta({ layout: 'studio' })
useHead({ title: 'Vella — billing' })

const { user, setPlan } = useAuth()
const { domains } = useSite()

interface Payment {
  what: string
  when: string
  amount: string
  status: 'paid' | 'failed' | 'refunded'
}

const proUntil = ref<string | null>(null)
const showUpgrade = ref(false)
const duration = ref<1 | 12>(12)
const payments = usePersistentState<Payment[]>('vella:payments', () => [])

const isPro = computed(() => user.value.plan === 'pro')

const features = computed(() => [
  { text: 'Your site, every standard template, full motion', locked: false },
  { text: 'Custom domain with automatic SSL', locked: !isPro.value },
  { text: 'Premium templates as they land', locked: !isPro.value },
  { text: 'Multiple pages', locked: !isPro.value },
  { text: 'No made-with-vella badge', locked: !isPro.value },
])

const durations = [
  { label: '12 months', price: 'RM190', months: 12 as const },
  { label: '1 month', price: 'RM19', months: 1 as const },
]
const payLabel = computed(() => `Pay RM${duration.value === 12 ? '190' : '19'} with FPX`)
const STATUS_TONE = { paid: 'positive', failed: 'danger', refunded: 'warning' } as const

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-MY', { month: 'short', day: 'numeric', year: 'numeric' })
}

function pay() {
  const months = duration.value
  const until = new Date()
  until.setMonth(until.getMonth() + months)
  proUntil.value = fmtDate(until)
  setPlan('pro')
  showUpgrade.value = false
  payments.value = [
    {
      what: `pro · ${months} ${months > 1 ? 'months' : 'month'}`,
      when: fmtDate(new Date()),
      amount: months === 12 ? 'RM190' : 'RM19',
      status: 'paid',
    },
    ...payments.value,
  ]
}
</script>

<template>
  <div class="mx-auto flex max-w-[720px] flex-col gap-7">
    <header class="dash-rise flex flex-col gap-1.5">
      <h1 class="m-0 text-[clamp(1.55rem,1.2rem+1.6vw,2.1rem)] font-bold tracking-[-0.02em]">Billing</h1>
      <p class="m-0 text-[0.96rem] text-text-dim">Pay once, runs for the duration. No auto-renew, no surprises.</p>
    </header>

    <!-- plan -->
    <section class="dash-rise flex flex-col gap-4" style="animation-delay: 60ms">
      <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">Your plan</span>
      <div class="flex flex-col gap-[18px] rounded-card border bg-ink-raised px-7 py-[26px]" :class="isPro ? 'border-brand/40' : 'border-line-soft'">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-col gap-1">
            <span class="text-2xl font-bold">{{ isPro ? 'Pro' : 'Free' }}</span>
            <span class="font-mono text-[0.78rem]" :class="isPro ? 'text-brand' : 'text-text-faint'">
              {{ isPro ? (proUntil ? `Pro until ${proUntil}` : 'Pro is active') : 'Your site is live with a small vella badge' }}
            </span>
          </div>
          <button
            type="button"
            class="cursor-pointer rounded-full px-6 py-[11px] text-[0.91rem] font-semibold transition-[filter] hover:brightness-110"
            :class="isPro ? 'border border-line bg-transparent text-text' : 'bg-brand text-ink'"
            @click="showUpgrade = true"
          >{{ isPro ? 'Extend Pro' : 'Upgrade to Pro' }}</button>
        </div>
        <div class="flex flex-col gap-[9px] border-t border-line-soft pt-4">
          <div v-for="f in features" :key="f.text" class="flex items-baseline gap-2.5">
            <span class="h-[5px] w-[5px] shrink-0 -translate-y-0.5 rounded-full" :style="{ background: f.locked ? 'var(--color-line)' : 'var(--color-brand)' }" />
            <span class="text-[0.92rem] leading-[1.5] text-text-dim">{{ f.text }}</span>
            <span v-if="f.locked" class="ml-auto"><DashboardProBadge /></span>
          </div>
        </div>
      </div>
    </section>

    <!-- usage -->
    <section class="dash-rise flex flex-col gap-4" style="animation-delay: 110ms">
      <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">Usage</span>
      <div class="flex flex-col gap-5 rounded-card border border-line-soft bg-ink-raised px-7 py-6">
        <DashboardUsageMeter label="Pages" :used="1" :limit="isPro ? null : 1" />
        <DashboardUsageMeter label="Custom domains" :used="domains.length" :limit="isPro ? null : 0" />
        <div class="flex items-center justify-between text-[0.85rem]">
          <span class="text-text-dim">Monthly views</span>
          <span class="font-mono text-[0.78rem] text-text-faint">Unlimited</span>
        </div>
      </div>
    </section>

    <!-- payment history -->
    <section class="dash-rise flex flex-col gap-4" style="animation-delay: 160ms">
      <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">Payment history</span>
      <div v-if="payments.length" class="overflow-hidden rounded-card border border-line-soft">
        <div class="grid grid-cols-[minmax(120px,1.2fr)_minmax(90px,1fr)_90px_90px] gap-3.5 border-b border-line-soft bg-ink-raised px-5 py-[11px]">
          <span v-for="h in ['What', 'When', 'Amount', 'Status']" :key="h" class="font-mono text-[0.66rem] tracking-[0.14em] text-text-faint">{{ h }}</span>
        </div>
        <div
          v-for="(p, i) in payments"
          :key="i"
          class="grid grid-cols-[minmax(120px,1.2fr)_minmax(90px,1fr)_90px_90px] items-center gap-3.5 border-b border-line-soft/60 px-5 py-[13px] last:border-b-0"
        >
          <span class="text-[0.88rem]">{{ p.what }}</span>
          <span class="font-mono text-[0.76rem] text-text-faint">{{ p.when }}</span>
          <span class="font-mono text-[0.8rem]">{{ p.amount }}</span>
          <span class="justify-self-start"><StatusPill :label="p.status" :tone="STATUS_TONE[p.status]" /></span>
        </div>
      </div>
      <p v-else class="m-0 rounded-card border border-dashed border-line bg-ink-raised px-5 py-6 text-center text-[0.88rem] text-text-faint">
        No payments yet. The free plan has nothing to pay.
      </p>
      <p class="m-0 font-mono text-[0.72rem] text-text-faint">Payments go through billplz fpx. Refunds are handled by support within 7 days.</p>
    </section>

    <!-- upgrade modal -->
    <Teleport to="body">
      <div
        v-if="showUpgrade"
        class="dash-fade fixed inset-0 z-[60] grid place-items-center bg-[oklch(0.1_0.018_265/0.7)] p-6 backdrop-blur-[4px]"
        @click="showUpgrade = false"
      >
        <div
          class="dash-modal flex w-[min(420px,100%)] flex-col gap-5 rounded-card border border-line bg-ink-raised p-7 font-sans text-text shadow-[0_30px_80px_-30px_oklch(0_0_0/0.7)]"
          @click.stop
        >
          <div class="flex flex-col gap-1.5">
            <h2 class="m-0 text-xl font-bold">Go Pro</h2>
            <p class="m-0 text-[0.9rem] leading-[1.55] text-text-dim">One payment, no subscription. Pro switches off quietly when it ends, your site stays up.</p>
          </div>
          <div class="flex flex-col gap-2.5">
            <button
              v-for="d in durations"
              :key="d.months"
              type="button"
              class="flex cursor-pointer items-baseline justify-between gap-3 rounded-xl border bg-ink-field px-[18px] py-[15px] text-left transition-colors"
              :class="duration === d.months ? 'border-brand' : 'border-line'"
              @click="duration = d.months"
            >
              <span class="text-[0.95rem] font-medium text-text">{{ d.label }}</span>
              <span class="font-mono text-[0.85rem] text-text-dim">{{ d.price }}</span>
            </button>
          </div>
          <button
            type="button"
            class="cursor-pointer rounded-full bg-brand py-[13px] text-[0.95rem] font-semibold text-ink transition-[filter] hover:brightness-110"
            @click="pay"
          >{{ payLabel }}</button>
          <button
            type="button"
            class="cursor-pointer border-none bg-transparent font-mono text-[0.72rem] tracking-[0.1em] text-text-faint transition-colors hover:text-text"
            @click="showUpgrade = false"
          >Not now</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
@keyframes dash-modal {
  from { opacity: 0; transform: translateY(10px) scale(0.985); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.dash-modal { animation: dash-modal 0.25s ease-out; }
@keyframes dash-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
.dash-fade { animation: dash-fade 0.2s ease-out; }
</style>
