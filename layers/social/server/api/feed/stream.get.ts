import Redis from 'ioredis';
import { requireAuth } from '#auth/server/utils/sessions';

export default defineEventHandler(async (event) => {
  // requireAuth both gates the stream (an anonymous caller must not be able
  // to open an unbounded SSE + Redis subscriber connection) and gives us
  // the real user id. `event.context.auth` was never populated anywhere —
  // it read as undefined, so every subscription was to
  // `user:updates:undefined` and the realtime feed silently delivered
  // nothing. requireAuth sets event.context.user.
  const user = await requireAuth(event);
  const userId = user.id;

  const redisSub = new Redis(process.env.NUXT_REDIS_URL || 'redis://localhost:6379');

  const eventStream = createEventStream(event);

  redisSub.subscribe(`user:updates:${userId}`);
  redisSub.on('message', (_channel, message) => {
    eventStream.push(message);
  });

  eventStream.onClosed(() => {
    redisSub.disconnect();
  });

  return eventStream.send();
});
