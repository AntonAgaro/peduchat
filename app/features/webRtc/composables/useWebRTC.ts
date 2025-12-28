// composables/useWebRTC.ts

interface ICEConfig {
  iceServers: RTCIceServer[];
  expiresAt?: number;
}

interface UseWebRTCOptions {
  onRemoteStream: (stream: MediaStream) => void;
  onIceCandidate: (candidate: RTCIceCandidate) => void;
  onNeedReconnect?: () => void; // Вызывается когда нужен ICE restart с TURN
}

// Базовый конфиг — только STUN
const StunOnlyConfig: ICEConfig = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }],
};

export function useWebRTC(options: UseWebRTCOptions) {
  const peerConnection = ref<RTCPeerConnection | null>(null);
  const connectionState = ref('new');
  const iceConnectionState = ref<RTCIceConnectionState>('new');

  // TURN fallback state
  const useTurn = ref(true);
  const turnCredentials = ref<ICEConfig | null>(null);
  const connectionAttempt = ref(0);
  const maxAttemptsBeforeTurn = 1;

  async function getIceConfig(): Promise<RTCConfiguration> {
    if (useTurn.value) {
      turnCredentials.value = await $fetch<ICEConfig>('/api/get-turn-credentials');
      return {
        iceServers: turnCredentials.value.iceServers,
        iceCandidatePoolSize: 10,
      };
    }

    return {
      iceServers: StunOnlyConfig.iceServers,
      iceCandidatePoolSize: 10,
    };
  }

  async function createConnection() {
    console.log('[WebRTC] Creating peer connection', {
      attempt: connectionAttempt.value + 1,
      useTurn: useTurn.value,
    });

    const config = await getIceConfig();

    console.log('[WebRTC] ICE servers:', config.iceServers?.length, {
      hasTurn: config.iceServers?.some((s) =>
        Array.isArray(s.urls) ? s.urls.some((u) => u.startsWith('turn')) : s.urls?.startsWith('turn')
      ),
    });

    const pc = new RTCPeerConnection(config);

    // When we get ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const type = event.candidate.type || 'unknown';
        console.log(`[WebRTC] 🧊 ICE candidate: ${type}`);
        options.onIceCandidate(event.candidate);
      }
    };

    // Состояние соединения
    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      iceConnectionState.value = state;
      console.log(`[WebRTC] ICE state: ${state}`);

      // console.log(`[ICE] State: ${state}`);

      switch (state) {
        case 'connected':
        case 'completed':
          console.log('[ICE] ✅ Connection successful!');
          connectionAttempt.value = 0; // Сбрасываем счётчик
          break;

        case 'failed':
          // alert('[ICE] ❌ Connection FAILED');
          handleConnectionFailed();

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

  function handleConnectionFailed() {
    connectionAttempt.value++;
    console.error(`[WebRTC] ❌ Connection failed (attempt ${connectionAttempt.value})`);

    if (!useTurn.value && connectionAttempt.value <= maxAttemptsBeforeTurn) {
      // Пробуем с TURN
      console.log('[WebRTC] 🔄 Enabling TURN fallback...');
      useTurn.value = true;

      // Уведомляем о необходимости переподключения
      if (options.onNeedReconnect) {
        options.onNeedReconnect();
      } else {
        // Если callback не передан — показываем alert
        alert(
          '⚠️ Прямое соединение не удалось.\n\n' + 'Переподключение через TURN сервер...\n' + 'Пожалуйста, подождите.'
        );
      }
    } else {
      // Даже с TURN не работает
      alert(
        '❌ Не удалось установить соединение.\n\n' +
          'Попробуйте:\n' +
          '• Обновить страницу\n' +
          '• Переключиться на другую сеть\n' +
          '• Отключить VPN'
      );
    }
  }

  /**
   * Пересоздаёт соединение с TURN
   */
  async function reconnectWithTurn() {
    console.log('[WebRTC] Reconnecting with TURN...');

    // Закрываем старое соединение
    if (peerConnection.value) {
      peerConnection.value.close();
      peerConnection.value = null;
    }

    // Включаем TURN
    useTurn.value = true;

    // Создаём новое соединение
    return await createConnection();
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

  /**
   * Полный сброс состояния (для нового звонка)
   */
  function reset() {
    close();
    useTurn.value = false;
    connectionAttempt.value = 0;
    turnCredentials.value = null;
    connectionState.value = 'new';
    iceConnectionState.value = 'new';
  }

  onUnmounted(() => {
    close();
  });

  return {
    // State
    peerConnection,
    connectionState,
    iceConnectionState,
    useTurn: readonly(useTurn),

    // Methods
    createConnection,
    reconnectWithTurn,
    addLocalStream,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    replaceVideoTrack,
    close,
    reset,
  };
}
