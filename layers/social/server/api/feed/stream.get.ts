import Redis from 'ioredis';

export default defineEventHandler(async (event) => {
  const userId = event.context.auth?.user?.id;
  const redisSub = new Redis(process.env.NUXT_REDIS_URL || 'redis://localhost:6379');

  const eventStream = createEventStream(event);

  redisSub.subscribe(`user:updates:${userId}`);
  redisSub.on('message', (channel, message) => {
    eventStream.push(message);
  });

  eventStream.onClosed(() => {
    redisSub.disconnect();
  });

  return eventStream.send();
});