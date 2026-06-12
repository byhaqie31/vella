<script setup lang="ts">
definePageMeta({ layout: 'studio' })
useHead({ title: 'vella — billing' })

interface Payment {
  what: string
  when: string
  amount: string
  status: 'paid' | 'failed' | 'refunded'
}

const plan = ref<'free' | 'pro'>('free')
const proUntil = ref<string | null>(null)
const showUpgrade = ref(false)
const duration = ref<1 | 12>(12)
const payments = ref<Payment[]>([{ what: 'pro · 1 month', when: 'sep 12, 2025', amount: 'RM19', status: 'paid' }])

const isPro = computed(() => plan.value === 'pro')

const proFeatures = computed(() => [
  { text: 'One page, every standard theme, full motion', active: true, locked: false },
  { text: 'Custom domain', active: isPro.value, locked: !isPro.value },
  { text: 'Premium themes as they land', active: isPro.value, locked: !isPro.value },
  { text: 'No made-with-vella badge', active: isPro.value, locked: !isPro.value },
])

const durations = [
  { label: '12 months', price: 'RM190', months: 12 as const },
  { label: '1 month', price: 'RM19', months: 1 as const },
]
const payLabel = computed(() => `Pay RM${duration.value === 12 ? '190' : '19'} with FPX`)

const STATUS_TONE = { paid: 'positive', failed: 'danger', refunded: 'warning' } as const

function pay() {
  const months = duration.value
  const now = new Date()
  const until = new Date(now.setMonth(now.getMonth() + months))
  proUntil.value = until
    .toLocaleDateString('en-MY', { month: 'short', day: 'numeric', year: 'numeric' })
    .toLowerCase()
  plan.value = 'pro'
  showUpgrade.value = false
  payments.value = [
    {
      what: `pro · ${months} ${months > 1 ? 'months' : 'month'}`,
      when: new Date()
        .toLocaleDateString('en-MY', { month: 'short', day: 'numeric', year: 'numeric' })
        .toLowerCase(),
      amount: months === 12 ? 'RM190' : 'RM19',
      status: 'paid',
    },
    ...payments.value,
  ]
}
</script>

<template>
  <div class="flex max-w-[720px] flex-col gap-9">
    <header class="flex flex-col gap-2">
      <h1 class="m-0 font-display text-[clamp(1.9rem,1.4rem+2vw,2.8rem)] font-normal leading-[1.05] tracking-[-0.01em]">Billing</h1>
      <p class="m-0 text-[0.95rem] text-text-dim">Pay once, runs for the duration. No auto-renew, no surprises.</p>
    </header>

    <!-- your plan -->
    <section class="flex flex-col gap-4">
      <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">your plan</span>
      <div
        class="flex flex-col gap-[18px] rounded-card border bg-ink-raised px-7 py-[26px]"
        :style="{ borderColor: isPro ? 'oklch(0.82 0.10 205 / 0.4)' : 'var(--color-line-soft)' }"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-col gap-1">
            <span class="font-display text-2xl font-medium">{{ isPro ? 'Pro' : 'Free' }}</span>
            <span
              class="font-mono text-[0.78rem]"
              :class="isPro ? 'text-positive' : 'text-text-faint'"
            >{{ isPro ? `pro until ${proUntil}` : 'your page is live with a small vella badge' }}</span>
          </div>
          <button
            v-if="!isPro"
            class="bg-accent cursor-pointer rounded-full border-none px-6 py-[11px] font-sans text-[0.91rem] font-semibold text-ink transition-[filter] hover:brightness-110"
            @click="showUpgrade = true"
          >Upgrade to pro</button>
          <button
            v-else
            class="cursor-pointer rounded-full border border-line bg-transparent px-6 py-[11px] font-sans text-[0.91rem] font-medium text-text transition-colors hover:border-text-faint"
            @click="showUpgrade = true"
          >Extend pro</button>
        </div>
        <div class="flex flex-col gap-[9px] border-t border-line-soft pt-4">
          <div v-for="f in proFeatures" :key="f.text" class="flex items-baseline gap-2.5">
            <span
              class="h-[5px] w-[5px] shrink-0 -translate-y-0.5 rounded-full"
              :style="{ background: f.locked ? 'var(--color-line)' : f.active && f.text !== proFeatures[0]!.text ? 'oklch(0.82 0.10 205)' : 'var(--color-text-faint)' }"
            />
            <span class="text-[0.92rem] leading-[1.5] text-text-dim">{{ f.text }}</span>
            <span
              v-if="f.locked"
              class="ml-auto rounded-full border border-line px-[9px] py-0.5 font-mono text-[0.66rem] tracking-[0.08em] text-text-faint"
            >pro</span>
          </div>
        </div>
      </div>
    </section>

    <!-- payment history -->
    <section class="flex flex-col gap-4">
      <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">payment history</span>
      <div class="overflow-hidden rounded-card border border-line-soft">
        <div class="grid grid-cols-[minmax(120px,1.2fr)_minmax(90px,1fr)_90px_90px] gap-3.5 border-b border-line-soft bg-ink-raised px-5 py-[11px]">
          <span v-for="h in ['what', 'when', 'amount', 'status']" :key="h" class="font-mono text-[0.66rem] tracking-[0.14em] text-text-faint">{{ h }}</span>
        </div>
        <div
          v-for="(p, i) in payments"
          :key="i"
          class="grid grid-cols-[minmax(120px,1.2fr)_minmax(90px,1fr)_90px_90px] items-center gap-3.5 border-b border-line-soft/60 px-5 py-[13px]"
        >
          <span class="text-[0.88rem]">{{ p.what }}</span>
          <span class="font-mono text-[0.76rem] text-text-faint">{{ p.when }}</span>
          <span class="font-mono text-[0.8rem]">{{ p.amount }}</span>
          <span class="justify-self-start"><StatusPill :label="p.status" :tone="STATUS_TONE[p.status]" /></span>
        </div>
      </div>
      <p class="m-0 font-mono text-[0.72rem] text-text-faint">payments go through billplz fpx. refunds are handled by support within 7 days.</p>
    </section>

    <!-- upgrade modal -->
    <Teleport to="body">
      <div
        v-if="showUpgrade"
        class="fade-in fixed inset-0 z-[60] grid place-items-center bg-[oklch(0.1_0.018_265/0.7)] p-6 backdrop-blur-[4px]"
        @click="showUpgrade = false"
      >
        <div
          class="modal-in flex w-[min(420px,100%)] flex-col gap-5 rounded-card border border-line bg-ink-raised p-7 font-sans text-text shadow-[0_30px_80px_-30px_oklch(0_0_0/0.7)]"
          @click.stop
        >
          <div class="flex flex-col gap-1.5">
            <h2 class="m-0 font-display text-2xl font-normal">Go pro</h2>
            <p class="m-0 text-[0.9rem] leading-[1.55] text-text-dim">
              One payment, no subscription. Pro switches off quietly when it ends, your page stays up.
            </p>
          </div>
          <div class="flex flex-col gap-2.5">
            <button
              v-for="d in durations"
              :key="d.months"
              class="flex cursor-pointer items-baseline justify-between gap-3 rounded-xl border bg-ink-field px-[18px] py-[15px] text-left font-sans transition-colors"
              :style="{ borderColor: duration === d.months ? 'oklch(0.82 0.10 205)' : 'var(--color-line)' }"
              @click="duration = d.months"
            >
              <span class="text-[0.95rem] font-medium text-text">{{ d.label }}</span>
              <span class="font-mono text-[0.85rem] text-text-dim">{{ d.price }}</span>
            </button>
          </div>
          <button
            class="bg-accent cursor-pointer rounded-full border-none py-[13px] font-sans text-[0.95rem] font-semibold text-ink transition-[filter] hover:brightness-110"
            @click="pay"
          >{{ payLabel }}</button>
          <button
            class="cursor-pointer border-none bg-transparent font-mono text-[0.72rem] tracking-[0.1em] text-text-faint transition-colors hover:text-text"
            @click="showUpgrade = false"
          >not now</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
@keyframes modal-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.modal-in {
  animation: modal-in 0.25s ease-out;
}
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
</style>
