<template>
  <div>
    <h1 style="background: linear-gradient(135deg, #6366f1, #ec4899); background-clip: text">PeduChat</h1>
    <h2>People Duo Connect</h2>
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
