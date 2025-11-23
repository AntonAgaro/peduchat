export function useMediaStream() {
  const localStream = ref<MediaStream | null>(null);
  const error = ref<string | null>(null);
  const isLoading = ref(false);
  const isAudiOn = ref(true);
  const isVideoOn = ref(true);
  // const videoStatus = computed(() => isVideoOn.value);
  // const audioStatus = computed(() => isAudiOn.value);
  // const getLocalStream = computed(() => localStream.value);
  // Cleanup on unmount
  onUnmounted(() => {
    stopMedia();
  });

  async function startMedia(needVideo = true, needAudio = true) {
    isLoading.value = true;
    error.value = null;

    try {
      const stream = await window.navigator.mediaDevices.getUserMedia({
        video: needVideo
          ? {
              facingMode: 'user',
              width: { ideal: 1280 },
              height: { ideal: 720 },
            }
          : false,
        audio: needAudio
          ? {
              echoCancellation: true,
              noiseSuppression: true,
            }
          : false,
      });

      localStream.value = stream;
      return stream;
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        error.value = 'Camera/microphone permission denied';
      } else if (err.name === 'NotFoundError') {
        error.value = 'No camera or microphone found';
      } else {
        error.value = 'Failed to access media devices';
      }
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function stopMedia() {
    if (!localStream.value) return;

    localStream.value.getTracks().forEach((track) => {
      track.stop();
    });

    localStream.value = null;
  }

  function toggleAudio() {
    const oldValue = isAudiOn.value;
    isAudiOn.value = !oldValue;
    if (!localStream.value) return;
    localStream.value.getAudioTracks().forEach((track) => {
      track.enabled = isAudiOn.value;
    });
  }

  function toggleVideo() {
    const oldValue = isVideoOn.value;
    isVideoOn.value = !oldValue;
    if (!localStream.value) return;
    localStream.value.getVideoTracks().forEach((track) => {
      track.enabled = isVideoOn.value;
    });
  }

  async function switchCamera() {
    if (!localStream.value) return;

    const videoTrack = localStream.value.getVideoTracks()[0];
    if (!videoTrack) return;

    const settings = videoTrack.getSettings();
    const newFacingMode = settings.facingMode === 'user' ? 'environment' : 'user';

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode },
      });

      const newVideoTrack = newStream.getVideoTracks()[0];

      // Replace track in stream
      localStream.value.removeTrack(videoTrack);
      localStream.value.addTrack(newVideoTrack);
      videoTrack.stop();

      return newVideoTrack;
    } catch (err) {
      console.error('Failed to switch camera:', err);
    }
  }

  return {
    error,
    isLoading,
    startMedia,
    toggleAudio,
    toggleVideo,
    switchCamera,
    isVideoOn,
    isAudiOn,
    localStream,
    // videoStatus,
    // audioStatus,
    // getLocalStream,
  };
}
