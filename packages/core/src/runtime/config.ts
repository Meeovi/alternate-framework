export function defineMeeoviConfig() {
  return {
    productProvider: 'directus',
    cartProvider: 'directus',
    contentProvider: 'directus',
    authUrl: '/api/auth',
    searchUrl: '/api/search'
  }
}