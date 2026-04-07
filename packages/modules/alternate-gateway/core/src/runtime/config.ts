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
  }
}

export function defineMeeoviTheme(theme: any) {
  return theme
}

export type MeeoviConfig = ReturnType<typeof defineMeeoviConfig>
export type MeeoviTheme = ReturnType<typeof defineMeeoviTheme>