declare module 'better-auth' {
  export const auth: any
  export const Auth: any
  export default auth
}

declare module 'better-auth/nuxt' {
  export function toWebRequest(req: any): any
}

declare module 'better-auth/client/plugins' {
  export const adminClient: any
  export const inferAdditionalFields: any
}

declare module 'better-auth/plugins' {
  export const genericOAuth: any
  export const auth0: any
  export const gumroad: any
  export const hubspot: any
  export const keycloak: any
  export const line: any
  export const microsoftEntraId: any
  export const okta: any
  export const slack: any
  export const patreon: any
  export const withMcpAuth: any
  export const organization: any
  export const phoneNumber: any
}
