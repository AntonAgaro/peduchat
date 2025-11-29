<!-- components/JoinScreen.vue -->
<template>
  <div class="flex flex-col h-screen bg-gray-950">
    <!-- Preview Area -->
    <div class="flex-1 relative">
      <!-- Video Preview -->
      <video
        v-show="!error && localStream"
        ref="previewVideo"
        autoplay
        playsinline
        muted
        class="w-full h-full object-cover"
      />

      <!-- Loading State -->
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-gray-900">
        <UIcon name="i-heroicons-arrow-path" class="text-4xl animate-spin text-gray-500" />
      </div>

      <!--      &lt;!&ndash; Error State &ndash;&gt;-->
      <!--      <div v-else-if="error" class="absolute inset-0 flex items-center justify-center bg-gray-900 p-4">-->
      <!--        <div class="text-center">-->
      <!--          <UIcon name="i-heroicons-video-camera-slash" class="text-5xl mb-4 text-red-500" />-->
      <!--          <p class="text-red-400 mb-4">{{ error }}</p>-->
      <!--          <UButton variant="soft" @click="retry"> Try Again </UButton>-->
      <!--        </div>-->
      <!--      </div>-->

      <!-- Camera Off Placeholder -->
      <div v-else-if="!videoEnabled" class="absolute inset-0 flex items-center justify-center bg-gray-900">
        <UIcon name="i-heroicons-user-circle" class="text-8xl text-gray-700" />
      </div>
    </div>

    <!-- Join Form -->
    <div class="p-6 bg-gray-900 space-y-4">
      <!-- Name Input -->
      <UInput v-model="userName" placeholder="Your name" size="xl" icon="i-heroicons-user" />

      <!-- Media Toggles -->
      <div class="flex justify-center gap-4">
        <UButton
          :color="!audioEnabled ? 'error' : 'neutral'"
          variant="soft"
          size="lg"
          :icon="!audioEnabled ? 'i-heroicons-speaker-x-mark' : 'i-heroicons-microphone'"
          class="rounded-full"
          @click="toggleAudio"
        />

        <UButton
          :color="!videoEnabled ? 'error' : 'neutral'"
          variant="soft"
          size="lg"
          :icon="!videoEnabled ? 'i-heroicons-video-camera-slash' : 'i-heroicons-video-camera'"
          class="rounded-full"
          @click="toggleVideo"
        />

        <UButton
          v-if="videoEnabled"
          color="neutral"
          variant="soft"
          size="lg"
          icon="i-heroicons-arrow-path"
          class="rounded-full"
          @click="flipCamera"
        />
      </div>

      <!-- Join Button -->
      <UButton block size="xl" :disabled="!userName.trim() || isLoading" @click="join"> Join Room </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  isLoading: boolean;
  error: string | null;
  localStream: MediaStream | null;
  toggleAudio: () => void;
  audioEnabled: boolean;
  toggleVideo: () => void;
  videoEnabled: boolean;
  switchCamera: () => Promise<MediaStreamTrack | undefined>;
}>();

const emit = defineEmits<{
  join: [name: string];
}>();

const previewVideo = ref<HTMLVideoElement>();
const userName = ref('');

onMounted(() => {
  console.log(props);
  console.log('FROM JOIN: ', props.localStream);
  // console.log(props.videoEnabled?.value);
  // console.log(props.audioEnabled?.value);
});
// const audioEnabled = ref(true);
// const videoEnabled = ref(true);

// Start media on mount
// onMounted(async () => {
//   await initMedia();
// });
//
// async function initMedia() {
//   try {
//     await startMedia(videoEnabled.value, audioEnabled.value);
//     attachStream();
//   } catch (e) {
//     // Error handled in composable
//   }
// }

function attachStream() {
  if (previewVideo.value && props.localStream) {
    previewVideo.value.srcObject = props.localStream;
  }
}

// Watch for stream changes
watch(
  () => props.localStream,
  () => {
    attachStream();
  }
);

// function toggleAudio() {
//   audioEnabled.value = !audioEnabled.value;
//   props.setAudio(audioEnabled.value);
// }
//
// function toggleVideo() {
//   videoEnabled.value = !videoEnabled.value;
//   props.setVideo(videoEnabled.value);
// }

async function flipCamera() {
  await props.switchCamera();
  // attachStream();
}

// function retry() {
//   initMedia();
// }

function join() {
  console.log('JOIN');
  emit('join', userName.value.trim());
}
</script>
