<template>
  <button
    :style="{ background: 'var(--ui-primary)' }"
    class="btn-sparkle px-4 py-2 rounded-2xl text-sm font-semibold flex items-center gap-3 justify-center text-white hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200"
    @click="handleInstallClick"
  >
    <!-- Искры -->
    <span class="sparkle sparkle-1">✦</span>
    <span class="sparkle sparkle-2">✦</span>
    <span class="sparkle sparkle-3">✦</span>
    <span class="sparkle sparkle-4">✦</span>

    <!-- Контент кнопки -->
    <span class="btn-content"> Установить<br />приложение </span>
  </button>

  <UModal v-model="showInstructionsModal">
    <p>{{ instructions }}</p>
  </UModal>
</template>

<script setup lang="ts">
import { usePwaInstall } from '~/features/pwa/composables/usePwaInstall';
const { canInstall, isInstalled, canInstallNatively, install, getInstructions, context } = usePwaInstall();
const showInstructionsModal = ref(false);
const instructions = ref('');

async function handleInstallClick() {
  const result = await install();

  if (result.showInstructions) {
    instructions.value = getInstructions();
    showInstructionsModal.value = true;
  }
}
// const { isIOS } = usePwaInstall();

const { $pwa } = useNuxtApp();

onMounted(() => {
  console.log('IsInstalled: ', $pwa?.isPWAInstalled);
});
</script>

<style scoped>
/* Sparkle Button Animation */
.btn-sparkle {
  position: relative;
  overflow: visible;
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
}

.btn-sparkle .btn-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-sparkle .sparkle {
  position: absolute;
  font-size: 14px;
  color: gold;
  opacity: 0;
  pointer-events: none;
  animation: sparkle 2s ease-in-out infinite;
}

.btn-sparkle .sparkle-1 {
  top: -8px;
  left: 10%;
  animation-delay: 0s;
}

.btn-sparkle .sparkle-2 {
  top: -6px;
  right: 15%;
  animation-delay: 0.5s;
}

.btn-sparkle .sparkle-3 {
  bottom: -8px;
  left: 20%;
  animation-delay: 1s;
}

.btn-sparkle .sparkle-4 {
  bottom: -6px;
  right: 10%;
  animation-delay: 1.5s;
}

.btn-sparkle:disabled .sparkle {
  animation: none;
  opacity: 0;
}

@keyframes sparkle {
  0%,
  100% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1) rotate(180deg);
  }
}
</style>
