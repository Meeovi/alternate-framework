let config = {
    provider: 'memory',
    baseUrl: '',
    apiKey: ''
};
export function setSocialConfig(newConfig) {
    config = { ...config, ...newConfig };
}
export function getSocialConfig() {
    return config;
}
