export interface MFrameworkBaseContext {
  headers: Record<string, string | string[] | undefined>
  cookies: Record<string, string | undefined>
}

export interface MFrameworkContext extends MFrameworkBaseContext {
  user?: any
  [key: string]: any
}
