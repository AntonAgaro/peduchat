<template>
  <div class="h-full flex flex-col justify-center items-center p-2">
    <div class="text-4xl font-bold mb-3 text-white mb-2">PeduChat</div>
    <h1 class="text-center text-white mb-8">Бесплатные видео звонки на двоих без регистрации.</h1>
    <h2 class="text-center mb-6">Создай комнату и отправь ссылку собеседнику:</h2>
    <NuxtLink :to="`/room/${generateRoomId()}`">
      <button
        class="mb-8 cursor-pointer btn-cta px-8 py-4 rounded-2xl text-lg font-semibold flex items-center gap-3 min-w-[220px] justify-center text-white hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200"
        :style="{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          boxShadow: '0 0 20px #667EEA80',
        }"
      >
        Начать звонок
      </button>
    </NuxtLink>
    <div class="mb-4">или присоединяйся:</div>
    <UForm class="flex flex-col items-center" :validate="validate" :state="formState" @submit="proceedToRoom">
      <UInput
        v-model="formState.roomCredentials"
        class="mb-4"
        :disabled="isLoading"
        size="xl"
        placeholder="Ссылка или id комнаты"
      />

      <span v-if="error" class="text-red-500 text-sm mb-2">{{ error }}</span>

      <UButton
        type="submit"
        :disabled="!formState.roomCredentials"
        :loading="isLoading"
        color="error"
        :class="{
          'cursor-pointer': formState.roomCredentials && !isLoading,
        }"
      >
        {{ isLoading ? 'Подключение...' : 'Подключиться' }}
      </UButton>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import type { FormError } from '@nuxt/ui';
import { ROOM_ID_REGEX, ROOM_URL_REGEX } from '~~/shared/constants';

useHead({
  title: 'PeduChat - бесплатный видеочат без регистрации',
  meta: [
    {
      name: 'description',
      content: 'Общайтесь по видео бесплатно. Без регистрации. Работает в браузере.',
    },
  ],
});

const formState = reactive({
  roomCredentials: '',
});
type Schema = typeof formState;

const isLoading = ref(false);
const error = ref('');
function generateRoomId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const segment = () => Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${segment()}-${segment()}-${segment()}`;
}

function validate(state: Partial<Schema>): FormError[] {
  error.value = '';
  const errors = [];
  if (
    !state.roomCredentials ||
    (!ROOM_ID_REGEX.test(state.roomCredentials) && !ROOM_URL_REGEX.test(state.roomCredentials))
  ) {
    error.value = 'Некорректный формат данных о комнате';
    errors.push({ name: 'roomCredentials', message: 'Некорректный формат данных о комнате' });
  }
  return errors;
}

async function proceedToRoom() {
  try {
    isLoading.value = true;
    error.value = '';

    const res = await $fetch<{ status: string; message?: string; roomId?: string }>('/api/get-room', {
      method: 'POST',
      body: {
        roomCredentials: formState.roomCredentials,
      },
    })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        isLoading.value = false;
      });

    if (res?.status === 'error') {
      error.value = res.message ?? '';
      return;
    }

    if (res?.roomId) {
      await navigateTo(`/room/${res.roomId}`);
      return;
    }
  } catch (e) {
    isLoading.value = false;
    console.log(e);
  }
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
