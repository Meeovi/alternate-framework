import Redis from 'ioredis';

const redis = new Redis(process.env.NUXT_REDIS_URL || 'redis://localhost:6379');

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const userId = event.context.auth?.user?.id;
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;

  const start = (page - 1) * limit;
  const stop = start + limit - 1;
  const timelineKey = `timeline:user:${userId}`;

  // 1. Fetch grouped keys sorted by latest activity time
  const groupKeys = await redis.zrevrange(timelineKey, start, stop);
  if (!groupKeys.length) return { data: [] };

  // 2. Multi-get group metadata and actors from Redis
  const pipeline = redis.pipeline();
  for (const key of groupKeys) {
    pipeline.hgetall(`group:${key}`);
    pipeline.smembers(`group:${key}:actors`);
  }
  const results = await pipeline.exec();

  const groups = [];
  const allActorIds = new Set<string>();

  for (let i = 0; i < groupKeys.length; i++) {
    const meta = results[i * 2][1] as Record<string, string>;
    const actorIds = results[i * 2 + 1][1] as string[];

    if (meta && meta.groupKey) {
      actorIds.forEach((id) => allActorIds.add(id));
      groups.push({
        groupKey: meta.groupKey,
        verb: meta.verb,
        target: meta.target,
        updated_at: Number(meta.updated_at),
        actorIds: actorIds.slice(0, 3), // Top 3 recent actors
        actorCount: actorIds.length,
      });
    }
  }

  // 3. Batch fetch actor user profiles from Directus in 1 query
  const config = useRuntimeConfig();
  const actorsData = await $fetch<{ data: any[] }>(`${config.public.directusUrl}/users`, {
    params: {
      'filter[id][_in]': Array.from(allActorIds).join(','),
      fields: 'id,first_name,last_name,avatar',
    },
    headers: { Authorization: `Bearer ${event.context.auth?.token}` },
  });

  const actorMap = new Map(actorsData.data.map((u) => [u.id, u]));

  // 4. Assemble final GetStream-style clustered payload
  const payload = groups.map((g) => ({
    group: g.groupKey,
    verb: g.verb,
    target: g.target,
    updated_at: new Date(g.updated_at).toISOString(),
    actor_count: g.actorCount,
    actors: g.actorIds.map((id) => actorMap.get(id)).filter(Boolean),
  }));

  return { data: payload };
});