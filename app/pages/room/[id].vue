<!-- pages/room/[id].vue -->
<template>
  <div class="h-full">
    <!-- Call Screen -->
    <div class="flex flex-col h-full">
      <!-- Header -->
      <!--      <div class="flex items-center justify-between p-4 bg-gray-900">-->
      <!--        <UButton variant="ghost" icon="i-heroicons-arrow-left" @click="leaveCall" />-->

      <!--        <div class="flex flex-col items-center">-->
      <!--          <span class="text-sm text-gray-400">{{ roomId }}</span>-->
      <!--          &lt;!&ndash;         Connection Status &ndash;&gt;-->
      <!--          <div class="flex items-center gap-2 mt-1">-->
      <!--            <div class="w-2 h-2 rounded-full" :class="signaling.isConnected.value ? 'bg-green-500' : 'bg-red-500'" />-->
      <!--            <span class="text-xs text-gray-500">-->
      <!--              {{ signaling.isConnected.value ? 'Connected' : 'Disconnected' }}-->
      <!--            </span>-->
      <!--          </div>-->
      <!--          &lt;!&ndash;         WebRTC Status &ndash;&gt;-->
      <!--          <div v-if="webrtc.connectionState.value !== 'new'" class="flex items-center gap-2 mt-1">-->
      <!--            <div-->
      <!--              class="w-2 h-2 rounded-full"-->
      <!--              :class="{-->
      <!--                'bg-yellow-500': webrtc.connectionState.value === 'connecting',-->
      <!--                'bg-green-500': webrtc.connectionState.value === 'connected',-->
      <!--                'bg-red-500':-->
      <!--                  webrtc.connectionState.value === 'failed' || webrtc.connectionState.value === 'disconnected',-->
      <!--              }"-->
      <!--            />-->
      <!--            <span class="text-xs text-gray-500"> Video: {{ webrtc.connectionState.value }} </span>-->
      <!--          </div>-->
      <!--        </div>-->

      <!--        <UButton variant="ghost" icon="i-heroicons-share" @click="shareRoom" />-->
      <!--      </div>-->

      <!-- Video Area -->
      <div class="flex-1 relative bg-black">
        <!-- Remote Video -->
        <video ref="remoteVideoEl" autoplay playsinline class="w-full h-full object-cover" />

        <!-- Remote Video Placeholder -->
        <div v-if="!hasRemoteVideo" class="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div class="text-center">
            <UIcon name="i-heroicons-user-circle" class="text-8xl text-gray-700 mb-2" />
            <p v-if="hasOtherParticipants" class="text-gray-400">
              {{ otherParticipantName }}
            </p>
          </div>
        </div>

        <!-- Local Video -->
        <div
          class="absolute bottom-2 right-2 w-20 h-30 rounded-lg overflow-hidden bg-gray-800 shadow-lg border-2"
          :class="webrtc.connectionState.value === 'connected' ? 'border-green-500' : 'border-gray-700'"
        >
          <video
            ref="localVideoEl"
            autoplay
            playsinline
            muted
            class="w-full h-full object-cover"
            style="transform: scaleX(-1)"
          />

          <!-- Video Off Overlay -->
          <div v-if="!isVideoOn" class="absolute inset-0 flex items-center justify-center bg-gray-800">
            <UIcon name="i-heroicons-user-circle" class="text-4xl text-gray-600" />
          </div>

          <!-- Muted Indicator -->
          <div v-if="!isAudiOn" class="absolute bottom-1 left-1 bg-red-500 rounded-full p-1">
            <UIcon name="i-heroicons-microphone-slash" class="text-xs text-white" />
          </div>
        </div>

        <!-- Participants List Overlay (Top Left) -->
        <!--        <div class="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 max-w-xs">-->
        <!--          <div class="flex items-center gap-2 mb-2">-->
        <!--            <UIcon name="i-heroicons-users" class="text-gray-400" />-->
        <!--            <span class="text-sm font-medium text-white">-->
        <!--              Participants ({{ signaling.participants.value.length }})-->
        <!--            </span>-->
        <!--          </div>-->

        <!--          <div v-if="signaling.participants.value.length > 0" class="space-y-2">-->
        <!--            <div-->
        <!--              v-for="participant in signaling.participants.value"-->
        <!--              :key="participant.id"-->
        <!--              class="flex items-center gap-2"-->
        <!--            >-->
        <!--              <div class="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">-->
        <!--                <span class="text-primary text-xs font-bold">-->
        <!--                  {{ participant.name.charAt(0).toUpperCase() }}-->
        <!--                </span>-->
        <!--              </div>-->
        <!--              <span class="text-sm text-white truncate">-->
        <!--                {{ participant.name }}-->
        <!--              </span>-->
        <!--              <span v-if="participant.name === userName" class="text-xs text-gray-500 ml-auto"> (You) </span>-->
        <!--            </div>-->
        <!--          </div>-->

        <!--          <div v-else class="text-xs text-gray-500 text-center py-2">No one here yet</div>-->
        <!--        </div>-->

        <!-- Waiting Overlay -->
        <div v-if="!hasOtherParticipants" class="absolute inset-0 flex items-center justify-center bg-gray-900/80">
          <div class="text-center">
            <UIcon name="i-heroicons-user-plus" class="text-5xl mb-4 text-gray-500" />
            <div class="text-gray-400 mb-2">Ждем остальных участников</div>
            <div class="text-gray-500 text-sm mb-4">Поделитесь ссылкой на комнату</div>
            <UButton size="sm" variant="soft" @click="shareRoom">Поделиться</UButton>
          </div>
        </div>

        <!-- Connecting Overlay -->
        <div
          v-if="hasOtherParticipants && webrtc.connectionState.value === 'connecting'"
          class="absolute inset-0 flex items-center justify-center bg-gray-900/80"
        >
          <div class="text-center">
            <UIcon name="i-heroicons-arrow-path" class="text-5xl mb-4 text-primary animate-spin" />
            <p class="text-gray-400">Connecting video...</p>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <footer class="flex items-center justify-center gap-4 p-6 bg-gray-900">
        <UButton
          :color="!isAudiOn ? 'error' : 'neutral'"
          variant="soft"
          size="xl"
          :icon="!isAudiOn ? 'i-mdi-microphone-off' : 'i-heroicons-microphone'"
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

        <UButton
          v-if="useDevice().isMobile.value"
          :color="'neutral'"
          variant="soft"
          size="xl"
          :icon="'i-material-symbols-light:flip-camera-ios-outline'"
          class="rounded-full"
          @click="handleSwitchCamera"
        />
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMediaStream } from '~/features/mediaStream';
import { useSignaling } from '~/features/signaling';
import { useWebRTC } from '~/features/webRtc';
import { useDevice } from '~/shared/ui/composables/useDevice';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const roomId = route.params.id as string;

// Refs
const localVideoEl = ref<HTMLVideoElement>();
const remoteVideoEl = ref<HTMLVideoElement>();

// State
const hasJoined = ref(false);
const userName = ref('User' + Math.floor(Math.random() * 1000));
const hasRemoteVideo = ref(false);

// Media Stream
const { error, isLoading, startMedia, toggleAudio, toggleVideo, localStream, isVideoOn, isAudiOn, switchCamera } =
  useMediaStream();

// Signaling
const signaling = useSignaling();

// WebRTC
const webrtc = useWebRTC({
  onRemoteStream: (stream) => {
    console.log('🎉 Got remote video stream!');
    if (remoteVideoEl.value) {
      remoteVideoEl.value.srcObject = stream;
      hasRemoteVideo.value = true;

      // toast.add({
      //   title: 'Video connected!',
      //   description: 'You can now see each other',
      //   color: 'success',
      //   icon: 'i-heroicons-video-camera',
      // });
    }

    // Check for video tracks
    stream.getVideoTracks().forEach((track) => {
      track.onended = () => {
        hasRemoteVideo.value = false;
      };
    });
  },
  onIceCandidate: (candidate) => {
    signaling.sendIceCandidate(roomId, candidate);
  },
});

// Computed
const hasOtherParticipants = computed(() => {
  return signaling.participants.value.length > 1;
});

const otherParticipantName = computed(() => {
  const other = signaling.participants.value.find((p) => p.name !== userName.value);
  return other?.name || 'Guest';
});

// Setup
onMounted(async () => {
  // 1. Start camera/microphone
  await startMedia();
  console.log('Local stream:', localStream.value);

  if (localVideoEl.value && localStream.value) {
    localVideoEl.value.srcObject = localStream.value;
  }

  // 2. Connect to WebSocket
  try {
    await signaling.connect();
    console.log('✅ Connected to signaling server');

    // 3. Setup WebRTC handlers
    setupWebRTCHandlers();

    // 4. Join room
    signaling.joinRoom(roomId, userName.value);
    hasJoined.value = true;

    // toast.add({
    //   title: 'Connected',
    //   description: `Joined room as ${userName.value}`,
    //   icon: 'i-heroicons-check-circle',
    // });
  } catch (error) {
    console.error('❌ Failed to connect:', error);
    toast.add({
      title: 'Connection failed',
      description: 'Could not connect to server',
      color: 'error',
    });
  }
});

async function handleSwitchCamera() {
  await switchCamera();
}

function setupWebRTCHandlers() {
  // When server tells us to start the call
  signaling.on('start-call', async (data) => {
    console.log('🎬 Starting call, isInitiator:', data.isInitiator);

    // Create peer connection
    webrtc.createConnection();

    // Add our local stream
    if (localStream.value) {
      webrtc.addLocalStream(localStream.value);
    }

    // If we're the initiator, create and send offer
    if (data.isInitiator) {
      try {
        const offer = await webrtc.createOffer();
        if (offer) {
          signaling.sendOffer(roomId, offer);
        }
      } catch (err) {
        console.error('Failed to create offer:', err);
        toast.add({
          title: 'Connection error',
          description: 'Failed to initiate video call',
          color: 'error',
        });
      }
    }
  });

  // When we receive an offer
  signaling.on('offer', async (data) => {
    console.log('📨 Received offer');
    try {
      await webrtc.setRemoteDescription(data.offer);

      const answer = await webrtc.createAnswer();
      if (answer) {
        signaling.sendAnswer(roomId, answer);
      }
    } catch (err) {
      console.error('Failed to handle offer:', err);
    }
  });

  // When we receive an answer
  signaling.on('answer', async (data) => {
    console.log('📨 Received answer');
    try {
      await webrtc.setRemoteDescription(data.answer);
    } catch (err) {
      console.error('Failed to handle answer:', err);
    }
  });

  // When we receive ICE candidate
  signaling.on('ice-candidate', async (data) => {
    console.log('🧊 Received ICE candidate');
    try {
      await webrtc.addIceCandidate(data.candidate);
    } catch (err) {
      console.error('Failed to add ICE candidate:', err);
    }
  });

  // When room updates (someone leaves)
  signaling.on('room-update', (data) => {
    if (data.participants.length < 1) {
      // Other person left
      hasRemoteVideo.value = false;
      if (remoteVideoEl.value) {
        remoteVideoEl.value.srcObject = null;
      }
      webrtc.close();

      toast.add({
        title: 'Participant left',
        description: 'Waiting for someone to join...',
        color: 'info',
      });
    }
  });
}

function leaveCall() {
  // Disconnect signaling
  signaling.disconnect();

  // Close WebRTC
  webrtc.close();

  // Stop media
  if (localStream.value) {
    localStream.value.getTracks().forEach((track) => track.stop());
  }

  router.push('/');
}

async function shareRoom() {
  const url = window.location.href;

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Join my video call',
        text: `${userName.value} is inviting you to a video call`,
        url,
      });
    } catch (err) {
      // User cancelled
    }
  } else {
    await navigator.clipboard.writeText(url);
    // toast.add({
    //   title: 'Link copied!',
    //   description: 'Share this link to invite others',
    //   icon: 'i-heroicons-clipboard-document-check',
    // });
  }
}

// Cleanup
onUnmounted(() => {
  signaling.disconnect();
  webrtc.close();
  if (localStream.value) {
    localStream.value.getTracks().forEach((track) => track.stop());
  }
});
</script>
