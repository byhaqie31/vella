<script setup lang="ts">
// Account was renamed to Settings; keep the old route working.
await navigateTo('/dashboard/settings', { redirectCode: 308 })
</script>

<template>
  <span />
</template>
