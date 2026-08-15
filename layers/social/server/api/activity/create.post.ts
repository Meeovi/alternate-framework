// layers/social only aliases '#shared' (see nuxt.config.ts) rather than
// using a real Nuxt `extends` layer relationship, so layers/shared's
// server/utils/redis.ts is not auto-imported here — it must be imported
// explicitly. Previously this referenced a bare `redis` identifier that
// was never declared anywhere, throwing ReferenceError on every call.
import { redis } from '#shared/server/utils/redis'

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const authHeader = getRequestHeader(event, 'authorization');
  const config = useRuntimeConfig();

  const { actor, verb, object, target } = body;

  // 1. Write the raw activity to Directus
  const directusActivity = await $fetch<{ data: { id: string; date_created: string } }>(
    `${config.public.directusUrl}/items/feeds`,
    {
      method: 'POST',
      headers: {
        Authorization: authHeader || '',
        'Content-Type': 'application/json',
      },
      body: { actor, verb, object, target },
    }
  );

  const activityId = directusActivity.data.id;
  const timestamp = new Date(directusActivity.data.date_created || Date.now()).getTime();

  // 2. Fetch actor's followers from Directus
  const followersData = await $fetch<{ data: Array<{ follower_id: string }> }>(
    `${config.public.directusUrl}/items/follows`,
    {
      params: {
        'filter[following_id][_eq]': actor,
        fields: 'follower_id',
      },
      headers: { Authorization: authHeader || '' },
    }
  );

  const followers = followersData.data.map((f) => f.follower_id);
  const targets = [actor, ...followers];

  // 3. Build aggregation group key
  const dateBucket = new Date().toISOString().split('T')[0];
  const groupKey = `${verb}:${target || object}:${dateBucket}`;
  const groupDataKey = `group:${groupKey}`;

  // 4. Perform Redis atomic operations
  const pipeline = redis.pipeline();

  pipeline.hsetnx(groupDataKey, 'groupKey', groupKey);
  pipeline.hsetnx(groupDataKey, 'verb', verb);
  pipeline.hsetnx(groupDataKey, 'target', target || object);
  pipeline.hset(groupDataKey, 'updated_at', timestamp);
  pipeline.sadd(`${groupDataKey}:actors`, actor);
  pipeline.sadd(`${groupDataKey}:activities`, activityId);

  pipeline.expire(groupDataKey, 60 * 60 * 24 * 30);
  pipeline.expire(`${groupDataKey}:actors`, 60 * 60 * 24 * 30);
  pipeline.expire(`${groupDataKey}:activities`, 60 * 60 * 24 * 30);

  for (const userId of targets) {
    const timelineKey = `timeline:user:${userId}`;
    pipeline.zadd(timelineKey, timestamp, groupKey);
    pipeline.zremrangebyrank(timelineKey, 0, -1001);
    pipeline.publish(`user:updates:${userId}`, JSON.stringify({ type: 'GROUP_UPDATED', groupKey }));
  }

  await pipeline.exec();

  return { success: true, activityId, groupKey };
});