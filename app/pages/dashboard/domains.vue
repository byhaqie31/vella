<script setup lang="ts">
definePageMeta({ layout: 'studio' })
useHead({ title: 'Vella — domains' })

const { user } = useAuth()
const { publicUrl, domains, addDomain, verifyDomain, removeDomain } = useSite()
const router = useRouter()

const isPro = computed(() => user.value.plan === 'pro')
const input = ref('')

function add() {
  if (!input.value.trim()) return
  addDomain(input.value)
  input.value = ''
}
</script>

<template>
  <div class="mx-auto flex max-w-[760px] flex-col gap-6">
    <header class="dash-rise flex flex-col gap-1.5">
      <h1 class="m-0 text-[clamp(1.55rem,1.2rem+1.6vw,2.1rem)] font-bold tracking-[-0.02em]">Domains</h1>
      <p class="m-0 text-[0.96rem] text-text-dim">Your free address is always on. Add a custom domain on Pro.</p>
    </header>

    <!-- free address -->
    <section class="dash-rise flex flex-col gap-3 rounded-card border border-line-soft bg-ink-raised p-6" style="animation-delay: 60ms">
      <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">Free address</span>
      <div class="flex items-center justify-between gap-3">
        <span class="font-mono text-[0.95rem]">{{ publicUrl }}</span>
        <StatusPill label="Always on" tone="positive" />
      </div>
    </section>

    <!-- custom domains -->
    <section class="dash-rise flex flex-col gap-4" style="animation-delay: 110ms">
      <span class="font-mono text-[0.7rem] tracking-[0.16em] text-text-faint">Custom domains</span>

      <div v-if="!isPro" class="flex flex-col gap-4 rounded-card border border-brand/30 bg-ink-raised p-6">
        <div class="flex items-start gap-3">
          <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-bg text-brand"><DashboardIcon name="lock" :size="18" /></span>
          <div class="flex flex-col gap-1">
            <span class="text-[0.98rem] font-semibold">Custom domains are a Pro feature</span>
            <span class="text-[0.88rem] leading-[1.55] text-text-dim">Point your own domain like yourname.com at your site, with automatic SSL.</span>
          </div>
        </div>
        <button
          type="button"
          class="inline-flex cursor-pointer items-center justify-center gap-2 self-start rounded-full bg-brand px-5 py-2.5 text-[0.88rem] font-semibold text-ink transition-[filter] hover:brightness-110"
          @click="router.push('/dashboard/billing')"
        >
          <DashboardIcon name="sparkles" :size="16" /> Upgrade to Pro
        </button>
      </div>

      <template v-else>
        <form class="flex gap-2.5" @submit.prevent="add">
          <input
            v-model="input"
            placeholder="yourname.com"
            class="min-w-0 flex-1 rounded-field border border-line bg-ink-field px-3.5 py-2.5 font-mono text-[0.85rem] text-text outline-none transition-colors focus:border-brand"
          >
          <button
            type="submit"
            class="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-field bg-brand px-4 py-2.5 text-[0.86rem] font-semibold text-ink transition-[filter] hover:brightness-110"
          >
            <DashboardIcon name="plus" :size="15" /> Add
          </button>
        </form>

        <div v-if="domains.length" class="overflow-hidden rounded-card border border-line-soft">
          <DashboardDomainRow
            v-for="d in domains"
            :key="d.id"
            :domain="d"
            @verify="verifyDomain(d.id)"
            @remove="removeDomain(d.id)"
          />
        </div>
        <p v-else class="m-0 rounded-card border border-dashed border-line bg-ink-raised px-5 py-6 text-center text-[0.88rem] text-text-faint">
          No custom domains yet. Add one above.
        </p>

        <p v-if="domains.some((d) => d.status === 'pending')" class="m-0 rounded-field border border-line-soft bg-ink-raised px-4 py-3 font-mono text-[0.74rem] leading-[1.6] text-text-faint">
          Add a CNAME record pointing to <span class="text-text-dim">cname.vella.site</span>, then hit Verify. DNS can take up to an hour.
        </p>
      </template>
    </section>
  </div>
</template>
