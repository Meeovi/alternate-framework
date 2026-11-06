// packages/plugins/CMS-Content/meeovi-atproto/auth/plugin.ts
//
// A real better-auth plugin ("atproto") adding three endpoints, all backed
// by a PDS (this deployment's hosted `sky.meeovicms.com` by default):
//
//   POST /sign-in/atproto  — log in with an existing atproto identifier +
//                            app password; finds-or-creates the matching
//                            local `users` row and issues a session.
//   POST /sign-up/atproto  — create a BRAND NEW account on the PDS itself
//                            (com.atproto.server.createAccount) with a
//                            chosen handle + password, then the same
//                            find-or-create-user + issue-session flow.
//   POST /link/atproto     — for an ALREADY signed-in user: attach an
//                            atproto identity to their existing local
//                            account without creating a new user or
//                            swapping their session (unlike the two
//                            endpoints above, which always end in a fresh
//                            session for whichever local user the atproto
//                            identity resolves to).
//
// All three: find-or-create/update the local `users` row (keyed on the
// atprotoDid/atprotoHandle columns) and, if `onSessionEstablished` is
// configured, persist the resumable atproto session (accessJwt/
// refreshJwt) so the host app can post/like/follow as this user later —
// see layers/social/server/utils/atproto.ts.
//
// Follows the same internalAdapter/setSessionCookie pattern better-auth's
// own credential-less plugins use (magic-link, email-otp, username), and
// the same sessionMiddleware pattern its account-linking endpoints use
// (e.g. two-factor's /two-factor/enable) — see
// node_modules/better-auth/dist/plugins/{magic-link,two-factor}/index.mjs.
//
// Wire this into the app's betterAuth() instance's `plugins` array (see
// layers/auth/shared/utils/plugins.ts) — it does nothing on its own.
import { APIError, createAuthEndpoint, getSessionFromCtx, sessionMiddleware } from 'better-auth/api'
import { setSessionCookie } from 'better-auth/cookies'
import * as z from 'zod'
import { Agent } from '@atproto/api'
import { AtprotoClient, getAtprotoServiceUrl } from '../runtime/client'
import { OAUTH_SCOPE, atprotoOAuthClient } from '../runtime/oauth'
import type { AtpSessionData } from '@atproto/api'
import type { BetterAuthPlugin } from 'better-auth'

export interface AtprotoProfileSummary {
  did: string
  handle: string
  displayName?: string
  avatar?: string
}

export interface AtprotoAuthOptions {
  /** PDS/AppView these endpoints talk to when a request doesn't supply its
   *  own `service`. Defaults to this deployment's hosted PDS
   *  (DEFAULT_ATPROTO_SERVICE / ATPROTO_SERVICE env var). */
  service?: string
  /** Reject /sign-in/atproto and /sign-up/atproto for any atproto identity
   *  with no existing local account, instead of creating one. Defaults to
   *  false (sign-up on first login/link, same default every other
   *  better-auth credential-less plugin uses). /link/atproto is unaffected
   *  — it never creates a local user, only updates the current one. */
  disableSignUp?: boolean
  /** Extra fields to set on a brand-new local user, beyond
   *  name/email/atprotoDid/atprotoHandle. */
  getNewUserFields?: (profile: AtprotoProfileSummary) => Record<string, unknown> | Promise<Record<string, unknown>>
  /**
   * Called after every successful sign-in/sign-up/link with the
   * freshly-authenticated AtpSessionData (accessJwt/refreshJwt/did/
   * handle) — this plugin only ever holds that session for the duration
   * of the request, so a host app that wants users to be able to
   * post/like/follow etc. as themselves later needs to persist it
   * somewhere itself (e.g. layers/auth's `atproto_sessions` table) and
   * pass this callback to do so. Optional — omit it if this deployment
   * only ever needs identity-linking, not later posting on the user's
   * behalf.
   */
  onSessionEstablished?: (params: { userId: string, session: AtpSessionData, service: string }) => void | Promise<void>
  /**
   * Called after a sign-in or link through Bluesky OAuth (/sign-in/atproto/oauth).
   * The OAuth session itself (DPoP-bound tokens) stays in the OAuth session
   * store (runtime/oauth.ts); this lets the host app note that the member
   * acts on Bluesky through it (layers/auth: an atproto_sessions row with
   * service "oauth").
   */
  onOAuthSessionEstablished?: (params: { userId: string, did: string, handle: string }) => void | Promise<void>
}

/** Where to send the member after OAuth: a path on this site only. */
const safeReturnPath = (value: unknown, fallback = '/') =>
  typeof value === 'string' && /^\/(?!\/)[^\s\\]*$/.test(value) ? value : fallback

const signInAtprotoOAuthBody = z.object({
  handle: z.string().min(3).max(253).meta({ description: 'Bluesky handle (alice.bsky.social), DID, or a PDS URL' }),
  callbackURL: z.string().optional().meta({ description: 'Path on this site to return to afterwards' }),
  link: z.boolean().optional().meta({ description: 'Attach the Bluesky account to the signed-in member instead of signing in' }),
})

/** Resolves a display profile for an atproto session. Tolerant of
 *  getProfile failing (a brand-new account's profile view may not be
 *  indexed by the AppView yet — confirmed live against
 *  sky.meeovicms.com — falls back to bare did/handle rather than failing
 *  the whole sign-in/sign-up over it). */
async function resolveProfile(client: AtprotoClient, session: AtpSessionData): Promise<AtprotoProfileSummary> {
  const fullProfile = await client.getProfile(session.did).catch(() => null)
  return {
    did: session.did,
    handle: session.handle,
    displayName: fullProfile?.displayName,
    avatar: fullProfile?.avatar,
  }
}

async function findOrCreateLocalUser(
  ctx: any,
  profile: AtprotoProfileSummary,
  options: AtprotoAuthOptions,
): Promise<{ user: any, isNewUser: boolean }> {
  let user = await ctx.context.adapter.findOne({
    model: 'user',
    where: [{ field: 'atprotoDid', value: profile.did }],
  })

  let isNewUser = false

  if (!user) {
    if (options.disableSignUp) {
      throw new APIError('FORBIDDEN', { message: 'Sign-up via atproto is disabled' })
    }

    const extraFields = (await options.getNewUserFields?.(profile)) || {}

    user = await ctx.context.internalAdapter.createUser({
      name: profile.displayName || profile.handle,
      // atproto has no email concept — a synthetic, never-emailed
      // placeholder keeps the (non-unique-enforced, but
      // email/password-plugin-assumed) users.email column populated
      // without colliding with a real account's address.
      email: `${profile.handle}@atproto.local`,
      emailVerified: false,
      // Not writing `image` here — this app's live users table (see
      // layers/auth/server/database/migrations/schema.ts) has no such
      // column; better-auth's core user schema assumes one, but nothing
      // else in this app's auth config writes it either.
      atprotoDid: profile.did,
      atprotoHandle: profile.handle,
      ...extraFields,
    })
    isNewUser = true
  } else if (user.atprotoHandle !== profile.handle) {
    // Handles can be changed on the user's own PDS between logins — keep
    // the locally-stored handle current.
    user = await ctx.context.internalAdapter.updateUser(user.id, { atprotoHandle: profile.handle })
  }

  if (!user) {
    throw new APIError('INTERNAL_SERVER_ERROR', { message: 'Failed to create or find a local user for this atproto identity' })
  }

  return { user, isNewUser }
}

async function persistSession(
  options: AtprotoAuthOptions,
  userId: string,
  session: AtpSessionData,
  service: string,
): Promise<void> {
  try {
    await options.onSessionEstablished?.({ userId, session, service })
  } catch (error) {
    // Persisting the resumable session is a nice-to-have (it only enables
    // posting-as-this-user later) — never fail the request itself over it.
    console.error('[atprotoAuth] onSessionEstablished failed:', error)
  }
}

async function issueLocalSession(ctx: any, user: any) {
  const newSession = await ctx.context.internalAdapter.createSession(user.id)
  if (!newSession) {
    throw new APIError('INTERNAL_SERVER_ERROR', { message: 'Failed to create a session' })
  }
  await setSessionCookie(ctx, { session: newSession, user })
  return newSession
}

/**
 * A single-use invite code from our own PDS (com.atproto.server.createInviteCode,
 * admin auth: ATPROTO_PDS_ADMIN_PASSWORD), when it requires invites — or
 * undefined (another PDS, invites off, no admin password).
 */
async function ownInviteCode(service: string, options: AtprotoAuthOptions): Promise<string | undefined> {
  const adminPassword = process.env.ATPROTO_PDS_ADMIN_PASSWORD
  const own = (options.service || getAtprotoServiceUrl()).replace(/\/+$/, '')
  if (!adminPassword || service.replace(/\/+$/, '') !== own) return undefined
  try {
    const described = await fetch(`${own}/xrpc/com.atproto.server.describeServer`).then((r) => r.json()) as { inviteCodeRequired?: boolean }
    if (!described?.inviteCodeRequired) return undefined
    const res = await fetch(`${own}/xrpc/com.atproto.server.createInviteCode`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Basic ${Buffer.from(`admin:${adminPassword}`).toString('base64')}` },
      body: JSON.stringify({ useCount: 1 }),
    })
    const body = await res.json().catch(() => null) as { code?: string } | null
    if (!res.ok || !body?.code) throw new Error(`createInviteCode ${res.status}`)
    return body.code
  } catch (error: any) {
    console.error('[atprotoAuth] could not get an invite code from the PDS:', error?.message || error)
    return undefined
  }
}

function authFailure(error: any): APIError {
  // The PDS's own com.atproto.server.createSession/createAccount error
  // message (e.g. "Invalid identifier or password", "Handle already
  // taken") is already user-appropriate — surfaced as-is rather than
  // replaced with a guessed string, with a generic fallback if the client
  // threw for some other reason (network error, unreachable service).
  return new APIError('UNAUTHORIZED', { message: error?.message || 'Could not authenticate with the atproto service' })
}

const signInAtprotoBody = z.object({
  identifier: z.string().meta({ description: 'AT Protocol handle (e.g. "alice.bsky.social") or DID' }),
  appPassword: z.string().meta({ description: 'App password created on the PDS for this account' }),
  service: z.string().optional().meta({ description: 'Override the PDS/AppView to authenticate against' }),
})

const signUpAtprotoBody = z.object({
  handle: z.string().meta({ description: 'Desired handle, e.g. "alice.sky.meeovicms.com" — must resolve under one of the PDS\'s availableUserDomains unless using a verified custom domain' }),
  password: z.string().min(8).meta({ description: 'Initial account password' }),
  // Optional per the com.atproto.server.createAccount lexicon, but
  // confirmed live against sky.meeovicms.com that this PDS enforces it as
  // a server policy (createAccount 400s with "Email is required"
  // otherwise) — required here rather than trusting the lexicon's own
  // optionality.
  email: z.email().meta({ description: 'Email for the atproto account itself (password recovery on the PDS) — separate from the local app account\'s email' }),
  inviteCode: z.string().optional().meta({ description: 'Required only if the PDS has inviteCodeRequired: true (see com.atproto.server.describeServer)' }),
  service: z.string().optional().meta({ description: 'Override the PDS to create the account on' }),
})

const linkAtprotoBody = signInAtprotoBody

export const atprotoAuth = (options: AtprotoAuthOptions = {}): BetterAuthPlugin => {
  return {
    id: 'atproto',
    endpoints: {
      signInAtproto: createAuthEndpoint('/sign-in/atproto', {
        method: 'POST',
        body: signInAtprotoBody,
        requireHeaders: true,
        metadata: {
          openapi: {
            operationId: 'signInWithAtproto',
            description: 'Sign in (or sign up) with an existing AT Protocol / Bluesky identifier and app password',
            responses: {
              200: {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        session: { $ref: '#/components/schemas/Session' },
                        isNewUser: { type: 'boolean' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }, async (ctx: any) => {
        const { identifier, appPassword } = ctx.body as z.infer<typeof signInAtprotoBody>
        const service = ctx.body.service || options.service || getAtprotoServiceUrl()

        let profile: AtprotoProfileSummary
        let atpSession: AtpSessionData
        try {
          const client = new AtprotoClient({ serviceUrl: service })
          atpSession = await client.login(identifier, appPassword)
          profile = await resolveProfile(client, atpSession)
        } catch (error: any) {
          throw authFailure(error)
        }

        const { user, isNewUser } = await findOrCreateLocalUser(ctx, profile, options)
        await persistSession(options, user.id, atpSession, service)
        const newSession = await issueLocalSession(ctx, user)

        return ctx.json({
          user,
          session: newSession,
          isNewUser,
          atproto: { did: profile.did, handle: profile.handle },
        })
      }),

      signUpAtproto: createAuthEndpoint('/sign-up/atproto', {
        method: 'POST',
        body: signUpAtprotoBody,
        requireHeaders: true,
        metadata: {
          openapi: {
            operationId: 'signUpWithAtproto',
            description: 'Create a brand-new account on the AT Protocol PDS itself, then sign in as it',
            responses: {
              200: {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        session: { $ref: '#/components/schemas/Session' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }, async (ctx: any) => {
        const { handle, password, email } = ctx.body as z.infer<typeof signUpAtprotoBody>
        let { inviteCode } = ctx.body as z.infer<typeof signUpAtprotoBody>
        const service = ctx.body.service || options.service || getAtprotoServiceUrl()
        // Our own PDS keeps invite codes on (so nobody can mass-create
        // accounts on it directly); a visitor who passed this endpoint's
        // Turnstile check gets a single-use code made for them.
        if (!inviteCode) inviteCode = await ownInviteCode(service, options)

        let profile: AtprotoProfileSummary
        let atpSession: AtpSessionData
        try {
          const client = new AtprotoClient({ serviceUrl: service })
          atpSession = await client.createAccount({ handle, password, email, inviteCode })
          profile = await resolveProfile(client, atpSession)
        } catch (error: any) {
          throw authFailure(error)
        }

        const { user } = await findOrCreateLocalUser(ctx, profile, options)
        await persistSession(options, user.id, atpSession, service)
        const newSession = await issueLocalSession(ctx, user)

        return ctx.json({
          user,
          session: newSession,
          isNewUser: true,
          atproto: { did: profile.did, handle: profile.handle },
        })
      }),

      // Bluesky OAuth, step 1: the URL where the member approves Meeovi on
      // their own PDS. Body: { handle, callbackURL?, link? }.
      signInAtprotoOAuth: createAuthEndpoint('/sign-in/atproto/oauth', {
        method: 'POST',
        body: signInAtprotoOAuthBody,
        requireHeaders: true,
        metadata: { openapi: { operationId: 'signInWithAtprotoOAuth', description: 'Start signing in (or linking) with Bluesky OAuth; returns the URL to send the member to' } },
      }, async (ctx: any) => {
        const { handle, callbackURL, link } = ctx.body as z.infer<typeof signInAtprotoOAuthBody>
        let linkUserId: string | undefined
        if (link) {
          const current = await getSessionFromCtx(ctx)
          if (!current?.user?.id) throw new APIError('UNAUTHORIZED', { message: 'Sign in first to connect a Bluesky account' })
          linkUserId = current.user.id
        }
        let client
        try {
          client = await atprotoOAuthClient()
        } catch (error: any) {
          throw new APIError('SERVICE_UNAVAILABLE', { message: error?.statusMessage || 'Signing in with Bluesky is unavailable' })
        }
        try {
          // The app state is kept server-side in the OAuth state store.
          const url = await client.authorize(handle.trim().replace(/^@/, ''), {
            scope: OAUTH_SCOPE,
            state: JSON.stringify({ returnTo: safeReturnPath(callbackURL), linkUserId }),
          })
          return ctx.json({ url: url.toString() })
        } catch (error: any) {
          throw new APIError('BAD_REQUEST', { message: /resolve|not found|invalid/i.test(error?.message || '') ? "We couldn't find that Bluesky account" : 'Bluesky sign-in could not start. Please try again.' })
        }
      }),

      // Bluesky OAuth, step 2: the PDS sends the member back here.
      atprotoOAuthCallback: createAuthEndpoint('/atproto/oauth/callback', {
        method: 'GET',
        requireHeaders: true,
        metadata: { openapi: { operationId: 'atprotoOAuthCallback', description: 'Finish Bluesky OAuth sign-in or linking' } },
      }, async (ctx: any) => {
        const fail = (reason: string, returnTo = '/login') => {
          throw ctx.redirect(`${returnTo}${returnTo.includes('?') ? '&' : '?'}error=${encodeURIComponent(reason)}`)
        }
        let did: string
        let appState: { returnTo?: string, linkUserId?: string } = {}
        let handle: string
        let displayName: string | undefined
        let avatar: string | undefined
        try {
          const client = await atprotoOAuthClient()
          const params = new URLSearchParams(Object.entries(ctx.query ?? {}).map(([k, v]) => [k, String(v)]))
          const { session, state } = await client.callback(params)
          did = session.did
          try { appState = JSON.parse(state || '{}') } catch { appState = {} }
          const agent = new Agent(session)
          const profile = await agent.getProfile({ actor: did }).then((r) => r.data).catch(() => null)
          handle = profile?.handle || did
          displayName = profile?.displayName
          avatar = profile?.avatar
        } catch (error: any) {
          console.warn('[atprotoAuth] OAuth callback failed:', error?.message || error)
          return fail(/denied|access_denied/i.test(String(ctx.query?.error || '')) ? 'bluesky_denied' : 'bluesky_failed')
        }

        const returnTo = safeReturnPath(appState.returnTo)
        if (appState.linkUserId) {
          // Connecting Bluesky to the signed-in member.
          const existingOwner = await ctx.context.adapter.findOne({ model: 'user', where: [{ field: 'atprotoDid', value: did }] })
          if (existingOwner && existingOwner.id !== appState.linkUserId) return fail('bluesky_linked_elsewhere', returnTo)
          await ctx.context.internalAdapter.updateUser(appState.linkUserId, { atprotoDid: did, atprotoHandle: handle })
          await options.onOAuthSessionEstablished?.({ userId: appState.linkUserId, did, handle })?.catch?.((e: unknown) => console.error('[atprotoAuth] onOAuthSessionEstablished', e))
          throw ctx.redirect(returnTo)
        }

        const { user } = await findOrCreateLocalUser(ctx, { did, handle, displayName, avatar }, options)
        try {
          await options.onOAuthSessionEstablished?.({ userId: user.id, did, handle })
        } catch (error) {
          console.error('[atprotoAuth] onOAuthSessionEstablished failed:', error)
        }
        await issueLocalSession(ctx, user)
        throw ctx.redirect(returnTo)
      }),

      linkAtproto: createAuthEndpoint('/link/atproto', {
        method: 'POST',
        body: linkAtprotoBody,
        requireHeaders: true,
        use: [sessionMiddleware],
        metadata: {
          openapi: {
            operationId: 'linkAtproto',
            description: 'Attach an AT Protocol identity to the current signed-in user, without creating a new user or changing the active session',
            responses: {
              200: {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }, async (ctx: any) => {
        const { identifier, appPassword } = ctx.body as z.infer<typeof linkAtprotoBody>
        const service = ctx.body.service || options.service || getAtprotoServiceUrl()
        const currentUser = ctx.context.session.user

        let profile: AtprotoProfileSummary
        let atpSession: AtpSessionData
        try {
          const client = new AtprotoClient({ serviceUrl: service })
          atpSession = await client.login(identifier, appPassword)
          profile = await resolveProfile(client, atpSession)
        } catch (error: any) {
          throw authFailure(error)
        }

        const existingOwner = await ctx.context.adapter.findOne({
          model: 'user',
          where: [{ field: 'atprotoDid', value: profile.did }],
        })

        if (existingOwner && existingOwner.id !== currentUser.id) {
          throw new APIError('CONFLICT', { message: 'This AT Protocol account is already linked to a different user' })
        }

        const user = await ctx.context.internalAdapter.updateUser(currentUser.id, {
          atprotoDid: profile.did,
          atprotoHandle: profile.handle,
        })

        await persistSession(options, currentUser.id, atpSession, service)

        return ctx.json({
          user,
          atproto: { did: profile.did, handle: profile.handle },
        })
      }),
    },
  }
}
