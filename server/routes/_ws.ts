// server/routes/_ws.ts

interface RoomUser {
  peer: any;
  name: string;
}

const rooms = new Map<string, Map<string, RoomUser>>();

export default defineWebSocketHandler({
  open(peer) {
    console.log('✅ Connected:', peer.id);
  },

  message(peer, message) {
    const data = JSON.parse(message.text());

    switch (data.type) {
      case 'join':
        handleJoin(peer, data);
        break;

      case 'offer':
        handleOffer(peer, data);
        break;

      case 'answer':
        handleAnswer(peer, data);
        break;

      case 'ice-candidate':
        handleIceCandidate(peer, data);
        break;
    }
  },

  close(peer) {
    console.log('❌ Disconnected:', peer.id);
    handleLeave(peer);
  },
});

function handleJoin(peer: any, data: any) {
  const { roomId, name } = data;

  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Map());
  }

  const room = rooms.get(roomId)!;

  // Check if room is full (max 2 users)
  if (room.size >= 2) {
    peer.send(
      JSON.stringify({
        type: 'error',
        message: 'Room is full',
      })
    );
    return;
  }

  room.set(peer.id, { peer, name });
  console.log(`👤 ${name} joined ${roomId}. Total: ${room.size}`);

  updateRoom(roomId);

  // If there are 2 people, tell them to start WebRTC connection
  if (room.size === 2) {
    const users = Array.from(room.entries());
    const [userId1, user1] = users[0];
    const [userId2, user2] = users[1];

    // Tell user2 (new joiner) to create offer
    user2.peer.send(
      JSON.stringify({
        type: 'start-call',
        isInitiator: true,
      })
    );

    // Tell user1 (existing) to wait for offer
    user1.peer.send(
      JSON.stringify({
        type: 'start-call',
        isInitiator: false,
      })
    );

    console.log(`🎬 Starting call between ${user1.name} and ${user2.name}`);
  }
}

function handleOffer(peer: any, data: any) {
  const { roomId, offer } = data;
  const room = rooms.get(roomId);

  if (room) {
    // Forward offer to the other peer
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

function handleAnswer(peer: any, data: any) {
  const { roomId, answer } = data;
  const room = rooms.get(roomId);

  if (room) {
    // Forward answer to the other peer
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

function handleIceCandidate(peer: any, data: any) {
  const { roomId, candidate } = data;
  const room = rooms.get(roomId);

  if (room) {
    // Forward ICE candidate to the other peer
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

function handleLeave(peer: any) {
  rooms.forEach((room, roomId) => {
    if (room.has(peer.id)) {
      const userName = room.get(peer.id)?.name;
      room.delete(peer.id);

      console.log(`👋 ${userName} left ${roomId}. Remaining: ${room.size}`);

      if (room.size === 0) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} was deleted!`);
      } else {
        updateRoom(roomId);
      }
    }
  });
}

function updateRoom(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  const participants = Array.from(room.entries()).map(([id, user]) => ({
    id,
    name: user.name,
  }));

  const message = JSON.stringify({
    type: 'room-update',
    participants,
  });

  room.forEach((user) => {
    user.peer.send(message);
  });
}
