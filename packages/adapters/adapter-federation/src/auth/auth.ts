import { PasswordSession } from '@atproto/lex-password-session'

export type AtprotoCredentials = {
  service: string
  identifier: string
  password: string
}

export async function loginAtproto(credentials: AtprotoCredentials): Promise<PasswordSession> {
  return PasswordSession.login(credentials)
}

export function getAtprotoCredentialsFromEnv(): AtprotoCredentials | null {
  const service = process.env.ATPROTO_SERVICE || 'https://bsky.social'
  const identifier = process.env.ATPROTO_IDENTIFIER
  const password = process.env.ATPROTO_APP_PASSWORD

  if (!identifier || !password) {
    return null
  }

  return { service, identifier, password }
}
