// Shared environment helper for all layers — checks KEY then falls back to NUXT_PUBLIC_KEY
export function getEnv(key, fallback) {
    if (!key)
        return fallback;
    const direct = process.env[key];
    if (direct !== undefined)
        return direct;
    const publicKey = `NUXT_PUBLIC_${key}`;
    if (process.env[publicKey] !== undefined)
        return process.env[publicKey];
    return fallback;
}
export function getEnvBool(key, fallback = false) {
    const v = getEnv(key);
    if (v === undefined)
        return fallback;
    const low = String(v).toLowerCase();
    return ['1', 'true', 'yes', 'on'].includes(low);
}
export default { getEnv, getEnvBool };
