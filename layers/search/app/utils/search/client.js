import { getEnv } from '../env';
export function getIndexName() {
    return (process.env.NUXT_PUBLIC_SEARCH_INDEX ||
        process.env.SEARCH_INDEX ||
        'default');
}
function buildHostFromParts() {
    const explicit = getEnv('SEARCHKIT_HOST');
    if (explicit)
        return explicit;
    // Allow composing host from protocol/hostname/port path
    const protocol = (getEnv('SEARCHKIT_PROTOCOL') || 'http').replace(/:\/\//, '');
    const hostname = getEnv('SEARCHKIT_HOSTNAME');
    const port = getEnv('SEARCHKIT_PORT');
    if (!hostname)
        return null;
    return `${protocol}://${hostname}${port ? `:${port}` : ''}`;
}
export function getSearchClient() {
    const host = buildHostFromParts();
    if (!host) {
        throw new Error('Searchkit host not configured via SEARCHKIT_HOST, SEARCHKIT_HOSTNAME, or NUXT_PUBLIC_SEARCHKIT_HOST');
    }
    // Optionally pass an API key if configured
    const apiKey = getEnv('SEARCHKIT_API_KEY');
    // Defer importing heavy searchkit/instantsearch client until runtime.
    // Consumers can replace this implementation with a provider-specific client.
    // Here we attempt to use @searchkit/instantsearch-client if available.
    // If not present, let the import fail so the plugin can fallback.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const createClient = require('@searchkit/instantsearch-client');
    if (!createClient) {
        throw new Error('@searchkit/instantsearch-client is not installed');
    }
    // Create a minimal client. The factory API may vary; adapt to your Searchkit config.
    try {
        const opts = { host };
        if (apiKey)
            opts.apiKey = apiKey;
        return createClient(opts);
    }
    catch (e) {
        // rethrow with context
        throw new Error('Failed to create Searchkit client: ' + (e?.message || e));
    }
}
