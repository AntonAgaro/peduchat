import type { Peer } from 'crossws';

interface RoomUser {
  peer: Peer; // WebSocket соединение пользователя
  name: string; // Имя пользователя
  lastPing: number; // Опрос, чтобы сокет не отваливался на клиенте
}

// Хранилище всех комнат: roomId -> Map(userId -> RoomUser)
// Каждая комната содержит до 2 пользователей для 1-на-1 видеочата
export const rooms = new Map<string, Map<string, RoomUser>>();
