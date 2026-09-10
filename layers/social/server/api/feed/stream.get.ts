import Redis from 'ioredis';
import { requireAuth } from '#auth/server/utils/sessions';
import { REDIS_URL } from '#shared/server/utils/redis';

export default defineEventHandler(async (event) => {
  // requireAuth both gates the stream (an anonymous caller must not be able
  // to open an unbounded SSE + Redis subscriber connection) and gives us
  // the real user id. `event.context.auth` was never populated anywhere —
  // it read as undefined, so every subscription was to
  // `user:updates:undefined` and the realtime feed silently delivered
  // nothing. requireAuth sets event.context.user.
  const user = await requireAuth(event);
  const userId = user.id;

  // A dedicated connection: a subscriber can't also run normal commands,
  // so this can't share the pooled `redis` client. Bounded reconnects +
  // an 'error' listener so a Redis blip degrades this one stream instead
  // of throwing an unhandled 'error' event that kills the process.
  const redisSub = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    connectTimeout: 10_000,
    retryStrategy: (times: number) => Math.min(times * 200, 2000),
  });
  redisSub.on('error', (err: Error) => {
    console.error('[feed/stream] redis subscriber error:', err?.message || err);
  });

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
