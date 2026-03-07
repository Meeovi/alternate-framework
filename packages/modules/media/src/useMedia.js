import { getMediaConfig } from './config';
import { getMediaProvider } from './registry';
import setupAutoAttach from './autoAttach';
export function useMedia() {
    const { mediaProvider } = getMediaConfig();
    const provider = getMediaProvider(mediaProvider);
    return {
        upload: (...args) => {
            if (typeof provider.upload === 'function') {
                return provider.upload(...args);
            }
            throw new Error('Upload not supported by media provider');
        },
        getUrl: (...args) => {
            if (typeof provider.getUrl === 'function') {
                return provider.getUrl(...args);
            }
            throw new Error('getUrl not supported by media provider');
        }
    };
}
// Auto attach media players on the client. The plugin list can be provided in
// `window.MFRAMEWORK_MEDIA_PLUGINS` as an array of plugin names or specs.
if (typeof window !== 'undefined') {
    try {
        const globalPlugins = window.MFRAMEWORK_MEDIA_PLUGINS;
        const globalPluginsMap = window.MFRAMEWORK_MEDIA_PLUGINS_MAP;
        // run after DOMContentLoaded
        const run = () => setupAutoAttach({ plugins: globalPlugins ?? [], pluginsMap: globalPluginsMap });
        if (document.readyState === 'loading') {
            window.addEventListener('DOMContentLoaded', run, { once: true });
        }
        else {
            run();
        }
    }
    catch (e) {
        // ignore
    }
}
export { setupAutoAttach };
