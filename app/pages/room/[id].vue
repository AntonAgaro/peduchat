<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between p-4 bg-gray-900">
      <UButton variant="ghost" icon="i-heroicons-arrow-left" to="/" />
      <span class="text-sm text-gray-400">{{ roomId }}</span>
      <UButton variant="ghost" icon="i-heroicons-share" @click="shareRoom" />
    </div>

    <!-- Video Area -->
    <div class="flex-1 relative bg-black">
      <!-- Remote Video (full screen) -->
      <video ref="remoteVideo" autoplay playsinline class="w-full h-full object-cover" />

      <!-- Local Video (small overlay) -->
      <div class="absolute bottom-4 right-4 w-32 h-44 rounded-lg overflow-hidden bg-gray-800 shadow-lg">
        <video ref="localVideo" autoplay playsinline muted class="w-full h-full object-cover" />
      </div>

      <!-- Status Overlay -->
      <div v-if="!isConnected" class="absolute inset-0 flex items-center justify-center bg-gray-900/80">
        <div class="text-center">
          <UIcon name="i-heroicons-user-plus" class="text-5xl mb-4 text-gray-500" />
          <p class="text-gray-400 mb-4">Waiting for someone to join...</p>
          <UButton size="sm" variant="soft" @click="shareRoom"> Share Link </UButton>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <footer class="flex items-center justify-center gap-4 p-6 bg-gray-900">
      <UButton
        :color="isMuted ? 'error' : 'neutral'"
        variant="soft"
        size="xl"
        :icon="isMuted ? 'i-heroicons-speaker-x-mark' : 'i-heroicons-microphone'"
        class="rounded-full"
        @click="toggleMute"
      />

      <UButton color="error" size="xl" icon="i-heroicons-phone-x-mark" class="rounded-full" @click="endCall" />

      <UButton
        :color="isVideoOff ? 'error' : 'neutral'"
        variant="soft"
        size="xl"
        :icon="isVideoOff ? 'i-heroicons-video-camera-slash' : 'i-heroicons-video-camera'"
        class="rounded-full"
        @click="toggleVideo"
      />
    </footer>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const roomId = route.params.id;

// Refs
const localVideo = ref<HTMLVideoElement>();
const remoteVideo = ref<HTMLVideoElement>();

// State
const isMuted = ref(false);
const isVideoOff = ref(false);
const isConnected = ref(false);

onMounted(async () => {
  // const stream = await navigator.mediaDevices.getUserMedia({
  //   video: {
  //     facingMode: 'user',
  //     width: { ideal: 1280 },
  //     height: { ideal: 720 },
  //   },
  //   audio: {
  //     echoCancellation: true,
  //     noiseSuppression: true,
  //   },
  // });
  // console.log(stream);
});

// Actions
function toggleMute() {
  isMuted.value = !isMuted.value;
}

function toggleVideo() {
  isVideoOff.value = !isVideoOff.value;
}

function endCall() {
  router.push('/');
}

async function shareRoom() {
  const url = window.location.href;
  console.log('url: ', url);

  if (window.navigator.share) {
    await window.navigator.share({ title: 'Присоединяйся к звонку: ', url });
  } else {
    await window.navigator.clipboard.writeText(url);
    useToast().add({ title: 'Link copied!', icon: 'i-heroicons-clipboard-document-check' });
  }
}
</script>

<style scoped></style>
