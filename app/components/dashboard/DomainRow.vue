<script setup lang="ts">
import type { PortalDomain } from '~/data/portal'

defineProps<{ domain: PortalDomain }>()
defineEmits<{ verify: []; remove: [] }>()

const TONE = { verified: 'positive', pending: 'warning', error: 'danger' } as const
const LABEL = { verified: 'Verified', pending: 'Pending DNS', error: 'Error' } as const
</script>

<template>
  <div class="flex items-center justify-between gap-4 border-b border-line-soft/60 bg-ink-raised px-5 py-4 last:border-b-0">
    <div class="flex min-w-0 flex-col gap-1.5">
      <span class="truncate font-mono text-[0.9rem]">{{ domain.domain }}</span>
      <StatusPill :label="LABEL[domain.status]" :tone="TONE[domain.status]" />
    </div>
    <div class="flex items-center gap-2">
      <button
        v-if="domain.status !== 'verified'"
        type="button"
        class="inline-flex cursor-pointer items-center gap-1.5 rounded-field border border-line px-3 py-1.5 text-[0.8rem] text-text-dim transition-colors hover:border-text-faint hover:text-text"
        @click="$emit('verify')"
      >
        <DashboardIcon name="refresh" :size="14" /> Verify
      </button>
      <button
        type="button"
        aria-label="Remove domain"
        class="grid h-8 w-8 cursor-pointer place-items-center rounded-field border border-line text-text-faint transition-colors hover:border-danger/50 hover:text-danger"
        @click="$emit('remove')"
      >
        <DashboardIcon name="trash" :size="15" />
      </button>
    </div>
  </div>
</template>
