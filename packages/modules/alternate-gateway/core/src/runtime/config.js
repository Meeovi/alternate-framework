export function defineMeeoviConfig() {
    return {
        productProvider: 'directus',
        cartProvider: 'directus',
        contentProvider: 'directus',
        authUrl: '/api/auth',
        searchUrl: '/api/search',
        adapters: {
            commerce: '',
            social: '',
            search: '',
            auth: '',
            chat: '',
            lists: ''
        }
    };
}
export function defineMeeoviTheme(theme) {
    return theme;
}
