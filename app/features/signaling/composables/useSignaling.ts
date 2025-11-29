// composables/useSignaling.ts

type MessageHandler = (data: any) => void;

export function useSignaling() {
  const ws = ref<WebSocket | null>(null);
  const isConnected = ref(false);
  const participants = ref<Array<{ id: string; name: string }>>([]);
  const handlers = new Map<string, MessageHandler[]>();

  async function connect() {
    return new Promise<void>((resolve, reject) => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const url = `${protocol}//${window.location.host}/_ws`;

      console.log('🔌 Connecting to:', url);
      ws.value = new WebSocket(url);

      ws.value.onopen = () => {
        console.log('✅ Connected');
        isConnected.value = true;
        resolve();
      };

      ws.value.onerror = (error) => {
        console.error('❌ Error:', error);
        reject(error);
      };

      ws.value.onclose = () => {
        console.log('🔴 Disconnected');
        isConnected.value = false;
      };

      ws.value.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('📨 Received:', data.type);

        // Update participants
        if (data.type === 'room-update') {
          participants.value = data.participants;
        }

        // Call handlers
        const typeHandlers = handlers.get(data.type);
        if (typeHandlers) {
          typeHandlers.forEach((handler) => handler(data));
        }
      };
    });
  }

  function send(data: any) {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(data));
    }
  }

  function on(type: string, handler: MessageHandler) {
    if (!handlers.has(type)) {
      handlers.set(type, []);
    }
    handlers.get(type)!.push(handler);
  }

  function disconnect() {
    ws.value?.close();
    ws.value = null;
    handlers.clear();
  }

  // Convenience methods
  function joinRoom(roomId: string, name: string) {
    send({ type: 'join', roomId, name });
  }

  function sendOffer(roomId: string, offer: RTCSessionDescriptionInit) {
    send({ type: 'offer', roomId, offer });
  }

  function sendAnswer(roomId: string, answer: RTCSessionDescriptionInit) {
    send({ type: 'answer', roomId, answer });
  }

  function sendIceCandidate(roomId: string, candidate: RTCIceCandidate) {
    send({ type: 'ice-candidate', roomId, candidate });
  }

  onUnmounted(() => {
    disconnect();
  });

  return {
    isConnected,
    participants,
    connect,
    disconnect,
    on,
    joinRoom,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
  };
}
