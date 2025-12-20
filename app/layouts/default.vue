<template>
  <main class="main">
    <AppHeader />
    <div class="main-content">
      <slot />
    </div>
    <AppFooter />
  </main>
</template>

<script setup lang="ts">
import AppFooter from '~/features/footer/components/AppFooter.vue';
import AppHeader from '~/features/header/components/AppHeader.vue';

useHead({
  title: 'PeduChat',
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
    { name: 'theme-color', content: '#0f172a' },
  ],
});
</script>

<style scoped></style>
