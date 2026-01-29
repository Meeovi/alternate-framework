// packages/meeovi-media/src/config.ts
let config = {
    mediaProvider: 'directus',
    baseUrl: '',
    cdnUrl: ''
};
export function setMediaConfig(newConfig) {
    config = { ...config, ...newConfig };
}
export function getMediaConfig() {
    return config;
}
