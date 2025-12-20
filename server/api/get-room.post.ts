import { rooms } from '~~/server/state';
import { ROOM_ID_REGEX, ROOM_URL_REGEX } from '#shared/constants';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const roomCredentials = body.roomCredentials ?? '';

  const roomId = extractRoomId(roomCredentials);

  const isRoomExist = rooms.get(roomId ?? '');

  if (!isRoomExist) {
    return {
      status: 'error',
      message: 'Такой комнаты нет!',
    };
  }

  return { status: 'success', roomId };
});

export function extractRoomId(value: string): string | null {
  const input = value.trim();

  // 1. Чистый roomId
  if (ROOM_ID_REGEX.test(input)) {
    return input;
  }

  // 2. URL с roomId
  const match = input.match(ROOM_URL_REGEX);
  if (match) {
    return match[1];
  }

  return null;
}
