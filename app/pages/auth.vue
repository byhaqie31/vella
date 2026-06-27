<script setup lang="ts">
// Sign-in split into /login and /signup; keep the old route working.
await navigateTo('/login', { redirectCode: 308 })
</script>

<template>
  <span />
</template>
