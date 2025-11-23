<template>
  <div>
    <NuxtLink :to="`/room/${generateRoomId()}`">
      <UButton>Создать чат</UButton>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
function generateRoomId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const segment = () => Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${segment()}-${segment()}-${segment()}`;
}
</script>

<style scoped></style>
