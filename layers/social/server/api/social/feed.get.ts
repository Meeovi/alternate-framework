import { inArray } from 'drizzle-orm'
import { requireAuth } from '#auth/server/utils/sessions'
import { db } from '#auth/server/utils/drizzle'
import { users } from '#auth/server/database/migrations/schema'
import { redis } from '#shared/server/utils/redis'

export default defineEventHandler(async (event) => {
  // requireAuth sets event.context.user — event.context.auth was never
  // populated anywhere in this app (better-auth doesn't use that key), so
  // userId/token below were always undefined regardless of who was signed
  // in, and the actor-profile fetch always sent "Bearer undefined".
  const user = await requireAuth(event)
  if (!user.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const userId = user.id
  const query = getQuery(event);
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
  if (!results) return { data: [] };

  const groups = [];
  const allActorIds = new Set<string>();

  for (let i = 0; i < groupKeys.length; i++) {
    const meta = results[i * 2]?.[1] as Record<string, string> | undefined;
    const actorIds = (results[i * 2 + 1]?.[1] as string[] | undefined) || [];

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

  // 3. Batch fetch actor profiles — actors here are better-auth users
  // (Supabase-side uuids), not Directus's own directus_users, so this
  // reads the real auth DB directly rather than Directus's /users endpoint
  // (which was always querying the wrong user system and always came back
  // empty for real actor ids).
  const actorRows = allActorIds.size
    ? await db
        .select({ id: users.id, name: users.name, username: users.username })
        .from(users)
        .where(inArray(users.id, Array.from(allActorIds)))
    : []

  const actorMap = new Map(actorRows.map((u) => [u.id, u]));

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
