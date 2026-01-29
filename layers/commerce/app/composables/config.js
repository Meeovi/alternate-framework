let config = {
    productProvider: 'directus',
    cartProvider: 'directus',
    categoryProvider: 'directus'
};
export function setCommerceConfig(newConfig) {
    config = { ...config, ...newConfig };
}
export function getCommerceConfig() {
    return config;
}
