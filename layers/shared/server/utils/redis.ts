import Redis from 'ioredis';

const config = useRuntimeConfig();

export const redis = new Redis(config.redisUrl || 'redis://localhost:6379');