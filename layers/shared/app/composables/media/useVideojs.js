import { useNuxtApp } from '#imports';
/**
 * Composable wrapper for the shared `videojs` Nuxt plugin.
 * Provides access to the provided `videojs` instance and registration helpers.
 */
export default function useVideojs() {
    const nuxtApp = useNuxtApp();
    // Provided by layers/shared-app/app/plugins/videojs.client.js
    const videojs = nuxtApp.$videojs || null;
    const registerVideojsPlugin = nuxtApp.$registerVideojsPlugin || ((name, plugin) => { });
    const registerVideojsPlugins = nuxtApp.$registerVideojsPlugins || ((defs) => { });
    function createPlayer(el, options, ready) {
        if (!videojs) {
            // fallback: try to import dynamically (client-side only)
            // but avoid bundling here; return null instead
            return null;
        }
        try {
            return videojs(el, options, ready);
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.warn('[useVideojs] createPlayer failed', e);
            return null;
        }
    }
    function disposePlayer(player) {
        try {
            player && typeof player.dispose === 'function' && player.dispose();
        }
        catch (e) {
            // ignore
        }
    }
    return {
        videojs,
        registerVideojsPlugin,
        registerVideojsPlugins,
        createPlayer,
        disposePlayer,
    };
}
