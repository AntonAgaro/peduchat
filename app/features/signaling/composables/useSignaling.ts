// composables/useSignaling.ts
// Композабл для управления WebSocket соединением и сигнализацией WebRTC

// Тип функции-обработчика для входящих сообщений
type MessageHandler = (data: any) => void;

export function useSignaling() {
  // WebSocket соединение
  const ws = ref<WebSocket | null>(null);

  // Флаг состояния подключения
  const isConnected = ref(false);

  // Список участников в текущей комнате
  const participants = ref<Array<{ id: string; name: string }>>([]);

  // Хранилище обработчиков сообщений по типам (type -> [handlers])
  const handlers = new Map<string, MessageHandler[]>();

  // Установка WebSocket соединения с сервером
  async function connect() {
    return new Promise<void>((resolve, reject) => {
      // Определяем протокол (ws или wss) в зависимости от текущего протокола страницы
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const url = `${protocol}//${window.location.host}/_ws`;

      console.log('🔌 Connecting to:', url);
      ws.value = new WebSocket(url);

      // Успешное подключение
      ws.value.onopen = () => {
        console.log('✅ Connected');
        isConnected.value = true;
        resolve();
      };

      // Ошибка подключения
      ws.value.onerror = (error) => {
        console.error('❌ Error:', error);
        reject(error);
      };

      // Закрытие соединения
      ws.value.onclose = () => {
        console.log('🔴 Disconnected');
        isConnected.value = false;
      };

      // Обработка входящих сообщений
      ws.value.onmessage = (event) => {
        const data = JSON.parse(event.data);

        // Обработка ping
        if (data.type === 'ping') {
          console.log('🏓 Ping received, sending pong');
          send({ type: 'pong' });
          return;
        }
        console.log('📨 Received:', data.type);

        // Обновляем список участников при получении room-update
        if (data.type === 'room-update') {
          participants.value = data.participants;
        }

        // Вызываем все зарегистрированные обработчики для данного типа сообщения
        const typeHandlers = handlers.get(data.type);
        if (typeHandlers) {
          typeHandlers.forEach((handler) => handler(data));
        }
      };
    });
  }

  // Отправка сообщения на сервер
  function send(data: any) {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(data));
    }
  }

  // Регистрация обработчика для определенного типа сообщений
  function on(type: string, handler: MessageHandler) {
    if (!handlers.has(type)) {
      handlers.set(type, []);
    }
    handlers.get(type)!.push(handler);
  }

  // Закрытие соединения и очистка обработчиков
  function disconnect() {
    ws.value?.close();
    ws.value = null;
    handlers.clear();
  }

  // Вспомогательные методы для отправки специфичных сообщений

  // Присоединение к комнате
  function joinRoom(roomId: string, name: string) {
    send({ type: 'join', roomId, name });
  }

  // Отправка WebRTC offer (инициатор звонка)
  function sendOffer(roomId: string, offer: RTCSessionDescriptionInit) {
    send({ type: 'offer', roomId, offer });
  }

  // Отправка WebRTC answer (принимающий звонок)
  function sendAnswer(roomId: string, answer: RTCSessionDescriptionInit) {
    send({ type: 'answer', roomId, answer });
  }

  // Отправка ICE кандидата для установки P2P соединения
  function sendIceCandidate(roomId: string, candidate: RTCIceCandidate) {
    send({ type: 'ice-candidate', roomId, candidate });
  }

  // Автоматическая очистка при размонтировании компонента
  onUnmounted(() => {
    disconnect();
  });

  // Возвращаем публичный API композабла
  return {
    isConnected, // Реактивный флаг подключения
    participants, // Реактивный список участников комнаты
    connect, // Установить WebSocket соединение
    disconnect, // Закрыть соединение
    on, // Подписаться на сообщения определенного типа
    joinRoom, // Присоединиться к комнате
    sendOffer, // Отправить WebRTC offer
    sendAnswer, // Отправить WebRTC answer
    sendIceCandidate, // Отправить ICE кандидат
  };
}
