import { createHmac } from 'crypto';
export default defineEventHandler(() => {
  const turnSecret = process.env.TURN_SECRET ?? '';
  const turnDomain = process.env.TURN_DOMAIN ?? '';

  const ttl = 3600; // 1 hour
  const expireAt = Math.floor(Date.now() / 1000) + ttl;

  // Username = timestamp:randomId
  const username = `${expireAt}:${crypto.randomUUID()}`;

  // Password = HMAC-SHA1(username, secret) в base64
  const hmac = createHmac('sha1', turnSecret);
  hmac.update(username);
  const password = hmac.digest('base64');

  return {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      {
        urls: [`turn:${turnDomain}:3478`, `turn:${turnDomain}:3478?transport=tcp`, `turns:${turnDomain}:5349`],
        username,
        credential: password,
      },
    ],
    // Сообщаем клиенту когда истекает (для обновления)
    expiresAt: expireAt * 1000,
  };
});
