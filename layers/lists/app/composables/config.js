let config = {
    provider: 'directus'
};
export function setListsConfig(newConfig) {
    config = { ...config, ...newConfig };
}
export function getListsConfig() {
    return config;
}
