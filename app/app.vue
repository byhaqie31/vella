<script setup lang="ts">
// import.meta.dev is a compile-time constant, so the FAB is tree-shaken out of
// production builds entirely.
const showDevFab = import.meta.dev
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <DevFab v-if="showDevFab" />
</template>
