// composables/useWebRTC.ts

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }];

interface UseWebRTCOptions {
  onRemoteStream: (stream: MediaStream) => void;
  onIceCandidate: (candidate: RTCIceCandidate) => void;
}

export function useWebRTC(options: UseWebRTCOptions) {
  const peerConnection = ref<RTCPeerConnection | null>(null);
  const connectionState = ref('new');

  function createConnection() {
    console.log('[WebRTC] Creating peer connection');

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    // When we get ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[WebRTC] 🧊 Got ICE candidate');
        options.onIceCandidate(event.candidate);
      }
    };

    // pc.onicecandidateerror = (event) => {
    //   console.error('[ICE] Candidate error:', {
    //     errorCode: event.errorCode,
    //     errorText: event.errorText,
    //     url: event.url,
    //     hostCandidate: event.hostCandidate ?? '',
    //   });
    //
    //   alert(
    //     JSON.stringify({
    //       errorCode: event.errorCode,
    //       errorText: event.errorText,
    //       url: event.url,
    //       hostCandidate: event.hostCandidate ?? '',
    //     })
    //   );
    // };

    // Состояние соединения — ГЛАВНЫЙ индикатор
    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;

      // console.log(`[ICE] State: ${state}`);

      switch (state) {
        case 'connected':
        case 'completed':
          console.log('[ICE] ✅ Connection successful!');
          break;

        case 'failed':
          alert('[ICE] ❌ Connection FAILED');

          break;

        case 'disconnected':
          alert('[ICE] ⚠️ Disconnected (may recover)');
          break;
      }
    };

    // Connection state changes
    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', pc.connectionState);
      connectionState.value = pc.connectionState;
    };

    // When we receive remote track
    pc.ontrack = (event) => {
      console.log('[WebRTC] 📹 Got remote track:', event.track.kind);
      if (event.streams[0]) {
        options.onRemoteStream(event.streams[0]);
      }
    };

    peerConnection.value = pc;
    return pc;
  }

  function addLocalStream(stream: MediaStream) {
    if (!peerConnection.value) return;

    stream.getTracks().forEach((track) => {
      console.log('[WebRTC] Adding local track:', track.kind);
      peerConnection.value!.addTrack(track, stream);
    });
  }

  async function createOffer() {
    if (!peerConnection.value) return null;

    console.log('[WebRTC] Creating offer...');
    const offer = await peerConnection.value.createOffer();
    await peerConnection.value.setLocalDescription(offer);
    console.log('[WebRTC] ✅ Offer created');
    return offer;
  }

  async function createAnswer() {
    if (!peerConnection.value) return null;

    console.log('[WebRTC] Creating answer...');
    const answer = await peerConnection.value.createAnswer();
    await peerConnection.value.setLocalDescription(answer);
    console.log('[WebRTC] ✅ Answer created');
    return answer;
  }

  async function setRemoteDescription(description: RTCSessionDescriptionInit) {
    if (!peerConnection.value) return;

    console.log('[WebRTC] Setting remote description:', description.type);
    await peerConnection.value.setRemoteDescription(description);
  }

  async function addIceCandidate(candidate: RTCIceCandidate) {
    if (!peerConnection.value) return;

    console.log('[WebRTC] Adding ICE candidate');
    await peerConnection.value.addIceCandidate(candidate);
  }

  async function replaceVideoTrack(newTrack: MediaStreamTrack) {
    if (!peerConnection.value) return;

    const senders = peerConnection.value.getSenders();
    const videoSender = senders.find((sender) => sender.track?.kind === 'video');

    if (videoSender) {
      console.log('[WebRTC] Replacing video track');
      await videoSender.replaceTrack(newTrack);
      console.log('[WebRTC] ✅ Video track replaced');
    }
  }

  function close() {
    if (peerConnection.value) {
      peerConnection.value.close();
      peerConnection.value = null;
    }
  }

  onUnmounted(() => {
    close();
  });

  return {
    peerConnection,
    connectionState,
    createConnection,
    addLocalStream,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    replaceVideoTrack,
    close,
  };
}
