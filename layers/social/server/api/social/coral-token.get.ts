import { SignJWT } from 'jose'
import { getAuthSession } from '#auth/server/utils/sessions'

// Mints a short-lived SSO JWT for Coral (coralproject/talk) from the
// current layers/auth (better-auth) session, so Coral treats this app's
// existing login as its own — no separate Coral account/password. Coral
// verifies the signature against the shared secret configured in its
// admin panel (Configure > Auth > Single Sign On) and required claims
// per https://docs.coralproject.net/sso: user.id, user.email,
// user.username, signed HS256.
//
// Anonymous visitors get `{ token: null }` rather than a 401 — comments
// should still be viewable (and, per Coral's own "Allow Registration"
// setting, self-registerable) without an app account.
export default defineEventHandler(async (event) => {
  const session = await getAuthSession(event)
  if (!session?.user) {
    return { token: null }
  }

  const { coralSsoSecret: secret, coralKeyId: keyId } = useRuntimeConfig()
  if (!secret) {
    throw createError({ statusCode: 500, statusMessage: 'CORAL_SSO_SECRET is not configured' })
  }

  const user = session.user as { id: string; name?: string; email?: string; image?: string }

  // CORAL_KEY_ID: Coral's admin issues this alongside the secret when SSO
  // keys support rotation (multiple secrets can be active at once) — the
  // JWT's `kid` header tells Coral which secret to verify against. Not
  // documented on docs.coralproject.net/sso as of writing, so this is
  // inferred from the standard JWT `kid` pattern; only sent when set.
  const token = await new SignJWT({
    user: {
      id: user.id,
      email: user.email,
      username: (user.name || user.email || user.id).replace(/\s+/g, '_'),
    },
  })
    .setProtectedHeader(keyId ? { alg: 'HS256', kid: keyId } : { alg: 'HS256' })
    .setJti(crypto.randomUUID())
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(new TextEncoder().encode(secret))

  return { token }
})
