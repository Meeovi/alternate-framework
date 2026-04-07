import { shallowRef } from 'vue';
// Runtime-safe streaming composable. Layers can import from @mframework/core
// and will get a safe fallback when no streaming client is available.
export function useStreaming() {
    const maybeGlobal = globalThis.useStreamingClient || globalThis.streamingClient;
    if (typeof maybeGlobal === 'function') {
        try {
            const res = maybeGlobal();
            return { streamingClient: res.streamingClient ?? res.client ?? shallowRef(null), connect: res.connect ?? (async () => null), disconnect: res.disconnect ?? (() => { }) };
        }
        catch (e) {
            // fallthrough to fallback
        }
    }
    // Fallback surface: no-op streaming client
    const streamingClient = shallowRef(null);
    async function connect(_opts) {
        return null;
    }
    function disconnect() {
        /* noop */
    }
    return { streamingClient, connect, disconnect };
}
export default useStreaming;
