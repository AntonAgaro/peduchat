<!-- pages/room/[id].vue -->
<template>
  <div class="h-screen">
    <!-- Join Screen -->
    <!--    <JoinScreen-->
    <!--      v-if="!hasJoined"-->
    <!--      :error="error"-->
    <!--      :isLoading="isLoading"-->
    <!--      :localStream="getLocalStream"-->
    <!--      :switchCamera="switchCamera"-->
    <!--      :videoEnabled="videoStatus"-->
    <!--      :audioEnabled="audioStatus"-->
    <!--      :toggleAudio="toggleAudio"-->
    <!--      :toggleVideo="toggleVideo"-->
    <!--      @join="handleJoin"-->
    <!--    />-->

    <!-- Call Screen -->
    <div class="flex flex-col h-full">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 bg-gray-900">
        <UButton variant="ghost" icon="i-heroicons-arrow-left" @click="leaveCall" />
        <span class="text-sm text-gray-400">{{ roomId }}</span>
        <UButton variant="ghost" icon="i-heroicons-share" @click="shareRoom" />
      </div>

      <!-- Video Area -->
      <div class="flex-1 relative bg-black">
        <!-- Remote Video -->
        <video ref="remoteVideoEl" autoplay playsinline class="w-full h-full object-cover" />

        <!-- Local Video -->
        <div
          class="absolute bottom-4 right-4 w-28 h-40 rounded-lg overflow-hidden bg-gray-800 shadow-lg border-2 border-gray-700"
        >
          <video ref="localVideoEl" autoplay playsinline muted class="w-full h-full object-cover" />

          <!-- Video Off Overlay -->
          <div v-if="!isVideoOn" class="absolute inset-0 flex items-center justify-center bg-gray-800">
            <UIcon name="i-heroicons-user-circle" class="text-4xl text-gray-600" />
          </div>
        </div>

        <!-- Waiting Overlay -->
        <div v-if="!isConnected" class="absolute inset-0 flex items-center justify-center bg-gray-900/80">
          <div class="text-center">
            <UIcon name="i-heroicons-user-plus" class="text-5xl mb-4 text-gray-500" />
            <p class="text-gray-400 mb-2">Waiting for someone to join...</p>
            <p class="text-gray-500 text-sm mb-4">Share the link to invite</p>
            <UButton size="sm" variant="soft" @click="shareRoom"> Share Link </UButton>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <footer class="flex items-center justify-center gap-4 p-6 bg-gray-900">
        <UButton
          :color="!isAudiOn ? 'error' : 'neutral'"
          variant="soft"
          size="xl"
          :icon="!isAudiOn ? 'i-heroicons-speaker-x-mark' : 'i-heroicons-microphone'"
          class="rounded-full"
          @click="toggleAudio"
        />

        <UButton color="error" size="xl" icon="i-heroicons-phone-x-mark" class="rounded-full" @click="leaveCall" />

        <UButton
          :color="!isVideoOn ? 'error' : 'neutral'"
          variant="soft"
          size="xl"
          :icon="!isVideoOn ? 'i-heroicons-video-camera-slash' : 'i-heroicons-video-camera'"
          class="rounded-full"
          @click="toggleVideo"
        />
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import JoinScreen from '~/components/videoChat/JoinScreen.vue';
import { useMediaStream } from '~/composables/useMediaStream';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const roomId = route.params.id as string;

// Refs
const localVideoEl = ref<HTMLVideoElement>();
const remoteVideoEl = ref<HTMLVideoElement>();

// State
const hasJoined = ref(false);
const isConnected = ref(false);
const userName = ref('');

const {
  error,
  isLoading,
  startMedia,
  toggleAudio,
  toggleVideo,
  localStream,
  isVideoOn,
  isAudiOn,
  switchCamera,
  // videoStatus,
  // audioStatus,
  // getLocalStream,
} = useMediaStream();

onMounted(async () => {
  await startMedia();
  console.log(localStream.value);
  console.log(localStream);
  if (localVideoEl.value && localStream.value) {
    localVideoEl.value.srcObject = localStream.value;
  }
});

function handleJoin(name: string) {
  userName.value = name;
  hasJoined.value = true;

  if (localVideoEl.value && localStream.value) {
    localVideoEl.value.srcObject = localStream.value;
  }
}

function leaveCall() {
  // Stop all tracks
  // if (localStream.value) {
  //   localStream.value.getTracks().forEach((track) => track.stop());
  // }
  router.push('/');
}

async function shareRoom() {
  const url = window.location.href;

  if (navigator.share) {
    await navigator.share({ title: 'Join my video call', url });
  } else {
    await navigator.clipboard.writeText(url);
    toast.add({ title: 'Link copied!', icon: 'i-heroicons-clipboard-document-check' });
  }
}
</script>
