<template>
  <div>
    <h1>PEDUCHAT!</h1>
    <slot />
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Video Chat',
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
    { name: 'theme-color', content: '#0f172a' },
  ],
});
</script>

<style scoped></style>
