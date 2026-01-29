import { getMediaConfig } from './config';
import { getMediaProvider } from './registry';
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
