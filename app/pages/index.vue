<template>
  <div class="h-full flex flex-col justify-center items-center">
    <div class="text-4xl font-bold mb-3 text-white mb-8">PeduChat</div>
    <h1 class="text-center mb-2">Бесплатные видео звонки без регистрации.</h1>
    <h2 class="text-center mb-4">Создайте комнату и отправьте ссылку собеседнику.</h2>
    <NuxtLink :to="`/room/${generateRoomId()}`">
      <button
        class="cursor-pointer btn-cta px-8 py-4 rounded-2xl text-lg font-semibold flex items-center gap-3 min-w-[220px] justify-center text-white hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200"
        :style="{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          boxShadow: '0 0 20px #667EEA80',
        }"
      >
        Начать звонок
      </button>
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

<style scoped>
.btn-cta {
  position: relative;
  overflow: hidden;
  animation: cta-glow 2s ease-in-out infinite;
}

.btn-cta::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: cta-shimmer 2.5s infinite;
}

@keyframes cta-glow {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
  }
  50% {
    box-shadow:
      0 0 35px rgba(102, 126, 234, 0.8),
      0 0 50px rgba(118, 75, 162, 0.3);
  }
}

@keyframes cta-shimmer {
  0% {
    left: -100%;
  }
  50%,
  100% {
    left: 100%;
  }
}
</style>
