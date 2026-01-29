let config = {
    authProvider: 'better-auth',
    authUrl: '',
    sessionCookieName: 'session',
    baseUrl: undefined
};
export function setAuthConfig(newConfig) {
    config = { ...config, ...newConfig };
}
export function getAuthConfig() {
    return config;
}
