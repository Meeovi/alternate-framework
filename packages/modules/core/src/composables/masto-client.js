import { ref, shallowRef } from 'vue';
function getNuxtMasto() {
    try {
        // Prefer runtime-provided composable if available; avoid referencing
        // auto-imported symbols directly so tsc in other packages doesn't error.
        const maybeUseNuxt = globalThis.useNuxtApp;
        if (typeof maybeUseNuxt === 'function') {
            const nuxt = maybeUseNuxt();
            return nuxt?.$masto ?? globalThis.$masto;
        }
        return globalThis.$masto;
    }
    catch {
        return undefined;
    }
}
export function useMastoClient() {
    const remote = getNuxtMasto();
    if (remote) {
        // remote is expected to expose { client: Ref, streamingClient }
        const cli = remote.client ?? remote;
        const clientRef = cli && (cli.value !== undefined || cli._isRef) ? cli : ref(cli);
        const isReady = ref(Boolean(clientRef?.value));
        const v1 = new Proxy({}, {
            get(_t, prop) {
                const c = clientRef.value;
                return c?.v1?.[prop] ?? c?.[prop];
            },
        });
        return { client: clientRef, isReady, v1 };
    }
    // Fallback: provide a safe no-op client surface
    const client = shallowRef(null);
    const isReady = ref(false);
    const v1 = {};
    return { client, isReady, v1 };
}
export function useMasto() {
    const remote = getNuxtMasto();
    if (remote) {
        return { client: remote.client ?? ref(null), streamingClient: remote.streamingClient };
    }
    return { client: shallowRef(null), streamingClient: undefined };
}
export async function mastoLogin(baseUrl, token) {
    // Integrate with Nuxt app masto if possible — otherwise noop
    const remote = getNuxtMasto();
    if (remote && typeof remote.login === 'function') {
        return remote.login({ baseUrl, token });
    }
    // no-op fallback
    return Promise.resolve();
}
