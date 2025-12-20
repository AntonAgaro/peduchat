// server/routes/_ws.ts
// WebSocket обработчик для видеочата

// Интерфейс пользователя в комнате
import { clearInterval } from 'node:timers';
import type { Peer } from 'crossws';
import { rooms } from '~~/server/state';

const pingInterval = 30000;
const pingTimeout = 60000;

// Проверка мертвых соединений - отрубаем юзера через 60 сек без pong
setInterval(() => {
  const now = Date.now();
  rooms.forEach((room, _) => {
    room.forEach((user, _) => {
      if (user.lastPing && now - user.lastPing > pingTimeout) {
        console.log(`⚠️ ${user.name} timed out (no pong)`);
        user.peer.close();
        handleLeave(user.peer);
      }
    });
  });
}, pingTimeout);

export default defineWebSocketHandler({
  // Вызывается при новом WebSocket подключении
  open(peer) {
    console.log('✅ Connected:', peer.id);
    startPingInterval(peer);
  },

  // Обработка входящих сообщений от клиента
  message(peer, message) {
    const data = JSON.parse(message.text());

    // Маршрутизация сообщений по типам:
    switch (data.type) {
      case 'join': // Присоединение к комнате
        handleJoin(peer, data);
        break;

      case 'offer': // WebRTC offer для установки соединения
        handleOffer(peer, data);
        break;

      case 'answer': // WebRTC answer в ответ на offer
        handleAnswer(peer, data);
        break;

      case 'ice-candidate': // ICE кандидаты для NAT traversal
        handleIceCandidate(peer, data);
        break;
      case 'pong': // ← Обрабатываем pong, чтобы сокет не отваливался на клиенте
        handlePong(peer);
    }
  },

  // Вызывается при разрыве соединения
  close(peer) {
    console.log('❌ Disconnected:', peer.id);
    handleLeave(peer);
  },
});

function startPingInterval(peer: Peer) {
  peer.pingTimer = setInterval(() => {
    try {
      peer.send(JSON.stringify({ type: 'ping' }));
      console.log(`🏓 Ping sent to ${peer.id}`);
    } catch (e) {
      console.error(`❌ Failed to ping ${peer.id}:`, e);
      handleLeave(peer);
    }
  }, pingInterval);
}

function handlePong(peer: any) {
  rooms.forEach((room) => {
    const user = room.get(peer.id);
    if (user) {
      user.lastPing = Date.now();
      console.log(`🏓 Pong received from ${user.name}`);
    }
  });
}

// Обработка присоединения пользователя к комнате
function handleJoin(peer: Peer, data: any) {
  const { roomId, name } = data;

  // Создаем комнату если её еще нет
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Map());
  }

  const room = rooms.get(roomId)!;

  // Проверяем лимит - максимум 2 пользователя в комнате
  if (room.size >= 2) {
    peer.send(
      JSON.stringify({
        type: 'error',
        message: 'Room is full',
      })
    );
    return;
  }

  // Добавляем пользователя в комнату
  room.set(peer.id, { peer, name });
  console.log(`👤 ${name} joined ${roomId}. Total: ${room.size}`);

  // Отправляем всем обновление списка участников
  updateRoom(roomId);

  // Если в комнате 2 человека - запускаем процесс установки WebRTC соединения
  if (room.size === 2) {
    const users = Array.from(room.entries());
    const [userId1, user1] = users[0];
    const [userId2, user2] = users[1];

    // Новому пользователю (user2) - создать offer
    user2.peer.send(
      JSON.stringify({
        type: 'start-call',
        isInitiator: true,
      })
    );

    // Первому пользователю (user1) - ждать offer
    user1.peer.send(
      JSON.stringify({
        type: 'start-call',
        isInitiator: false,
      })
    );

    console.log(`🎬 Starting call between ${user1.name} and ${user2.name}`);
  }
}

// Пересылка WebRTC offer от одного пользователя другому
function handleOffer(peer: Peer, data: any) {
  const { roomId, offer } = data;
  const room = rooms.get(roomId);

  if (room) {
    // Находим второго пользователя и отправляем ему offer
    room.forEach((user, id) => {
      if (id !== peer.id) {
        user.peer.send(
          JSON.stringify({
            type: 'offer',
            offer,
          })
        );
        console.log('📤 Forwarded offer');
      }
    });
  }
}

// Пересылка WebRTC answer от одного пользователя другому
function handleAnswer(peer: any, data: any) {
  const { roomId, answer } = data;
  const room = rooms.get(roomId);

  if (room) {
    // Находим второго пользователя и отправляем ему answer
    room.forEach((user, id) => {
      if (id !== peer.id) {
        user.peer.send(
          JSON.stringify({
            type: 'answer',
            answer,
          })
        );
        console.log('📤 Forwarded answer');
      }
    });
  }
}

// Пересылка ICE кандидатов для установки P2P соединения через NAT
function handleIceCandidate(peer: Peer, data: any) {
  const { roomId, candidate } = data;
  const room = rooms.get(roomId);

  if (room) {
    // Пересылаем ICE кандидат второму пользователю
    room.forEach((user, id) => {
      if (id !== peer.id) {
        user.peer.send(
          JSON.stringify({
            type: 'ice-candidate',
            candidate,
          })
        );
      }
    });
  }
}

// Обработка выхода пользователя из комнаты
function handleLeave(peer: Peer) {
  //Чистим ping-pong интервал юзера
  if (peer.pingTimer) {
    clearInterval(peer.pingTimer);
  }

  rooms.forEach((room, roomId) => {
    if (room.has(peer.id)) {
      const userName = room.get(peer.id)?.name;
      room.delete(peer.id);

      console.log(`👋 ${userName} left ${roomId}. Remaining: ${room.size}`);

      // Если комната опустела - удаляем её
      if (room.size === 0) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} was deleted!`);
      } else {
        // Иначе уведомляем оставшихся участников
        updateRoom(roomId);
      }
    }
  });
}

// Отправка обновления списка участников всем в комнате
function updateRoom(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  // Формируем список участников
  const participants = Array.from(room.entries()).map(([id, user]) => ({
    id,
    name: user.name,
  }));

  const message = JSON.stringify({
    type: 'room-update',
    participants,
  });

  // Рассылаем всем участникам комнаты
  room.forEach((user) => {
    user.peer.send(message);
  });
}
