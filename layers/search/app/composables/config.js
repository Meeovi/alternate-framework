let config = {
    searchProvider: 'searchkit',
    searchUrl: '',
    apiKey: ''
};
export function setSearchConfig(newConfig) {
    config = { ...config, ...newConfig };
}
export function getSearchConfig() {
    return config;
}
