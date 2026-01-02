<template>
  <div class="h-full flex flex-col justify-center items-center p-2">
    <div class="text-4xl font-bold mb-3 text-white mb-2">PeduChat</div>
    <h1 class="text-center text-white mb-8">Бесплатные видео звонки на двоих без регистрации.</h1>
    <h2 class="text-center mb-6">Создай комнату и отправь ссылку собеседнику:</h2>
    <NuxtLink :to="roomId">
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
        size="xl"
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

const roomId = useState('room-id', () => `/room/${generateRoomId()}`);

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

<style scoped></style>
