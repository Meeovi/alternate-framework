import { sql } from 'drizzle-orm'
import * as schema from '../../server/database/migrations/schema'
import { db } from '../../server/utils/drizzle'
import { stripeClient } from '../../server/utils/stripe'
import { sendAuthEmail } from './infrastructure/email'
import type { User } from '../../app/types'
import { dash } from '@better-auth/infra'
import { oauthProvider } from '@better-auth/oauth-provider'
import { passkey } from '@better-auth/passkey'
import { apiKey } from '@better-auth/api-key'
import { i18n } from '@better-auth/i18n'
import { stripe } from '@better-auth/stripe'
import {
  deviceAuthorization,
  multiSession,
  organization,
  oneTimeToken,
  twoFactor,
  username,
  magicLink,
  emailOTP,
  admin as adminPlugin,
  lastLoginMethod,
  openAPI,
  oAuthProxy,
  oneTap,
  jwt,
  haveIBeenPwned,
  captcha,
} from 'better-auth/plugins'
import { atprotoAuth } from '@mframework/meeovi-atproto/auth/plugin'
import { ac, admin, user, seller, myCustomRole } from './permissions'
import { MAX_USERNAME_LENGTH, MIN_USERNAME_LENGTH, isAllowedUsername, storedUsername } from './username'

if (!process.env.NUXT_STRIPE_WEBHOOK_SECRET) {
  console.warn('[stripe] NUXT_STRIPE_WEBHOOK_SECRET is not set — the stripe plugin\'s own webhook endpoint will reject every incoming event with a signature-verification failure.')
}

export const plugins = [
  dash(),
  multiSession(),
  organization({
    // modelName was previously "organizations" — a pre-existing Directus
    // CRM table (status/website/brandColor/paymentTerms/folder...) with no
    // slug or metadata column, so this plugin could never have worked
    // correctly against it. Pointed at a dedicated table instead so
    // better-auth's organization data never mixes with Directus CRM data.
    schema: {
      organization: {
        modelName: "authOrganizations",
        fields: {
          name: "name",
          slug: "slug",
          logo: "logo",
          metadata: "metadata",
          createdAt: "dateCreated"
        }
      },
      member: {
        modelName: "authOrganizationMembers",
        fields: {
          userId: "userId",
          organizationId: "organizationId",
          role: "role",
          createdAt: "createdAt"
        }
      }
    }
  }),
  stripe({
    stripeClient,
    // Real var is NUXT_STRIPE_WEBHOOK_SECRET — the unprefixed name was
    // never set anywhere in .env, so webhook signature verification for
    // this plugin's own webhook handling has never actually worked.
    stripeWebhookSecret: process.env.NUXT_STRIPE_WEBHOOK_SECRET!,
    createCustomerOnSignUp: true,
    onCustomerCreate: async ({
      stripeCustomer,
      user
    }, ctx) => {
      console.log(`Customer ${stripeCustomer.id} created for user ${user.id}`);
    },
    getCustomerCreateParams: async (user, ctx) => {
      // Previously read user.metadata?.referralSource — `metadata` was
      // never declared as an additionalField anywhere on the user model,
      // so this was always undefined regardless of who signed up. Attach
      // the one piece of real, available data instead.
      return {
        metadata: {
          appUserId: user.id ?? ''
        }
      };
    },
    subscription: {
      enabled: true,
      plans: async () => {
        // Plan catalog — also a dedicated table (auth_subscription_plans),
        // distinct from the per-user subscription records above. Starts
        // empty; real pricing plans need to be inserted before checkout
        // has anything to offer.
        const plans = await db.select().from(schema.authSubscriptionPlans);

        return plans.map((plan: any) => ({
          name: plan.name,
          priceId: plan.stripe_price_id,
          limits: typeof plan.limits === 'string'
            ? JSON.parse(plan.limits)
            : plan.limits || {}
        }));
      },
      getCheckoutSessionParams: async ({
        user,
        session,
        plan,
        subscription
      }, ctx) => {
        return {
          params: {
            tax_id_collection: {
              enabled: true
            },
            automatic_tax: {
              enabled: true
            },
            allow_promotion_codes: true,
            billing_address_collection: "required",
            custom_text: {
              submit: {
                message: "We'll start your subscription right away"
              }
            },
            // Previously hardcoded planType: "business" regardless of
            // which plan was actually purchased, and referralCode read
            // user.metadata?.referralCode — never declared anywhere, so
            // always undefined. Use the real plan name instead of both.
            metadata: {
              planName: plan.name,
              appUserId: user.id
            }
          },
          options: {
            idempotencyKey: `sub_${user.id}_${plan.name}_${Date.now()}`
          }
        };
      },
      authorizeReference: async ({
        user,
        referenceId,
        action
      }) => {
        const [member] = await db.execute(sql`
          SELECT * FROM auth_organization_members
          WHERE user_id = ${user.id} AND organization_id = ${referenceId}
          LIMIT 1
        `) as any[];
        return member?.role === "owner" || member?.role === "admin";
      },
    },
    // modelName was previously "subscriptions" — a pre-existing Directus
    // content table (status/subscriptionNumber/startDate/endDate, no
    // stripe_price_id or limits column) — this plugin could never have
    // stored real subscription state there. Points at a dedicated table
    // instead, same fix as organizations above. stripePriceId/limits live
    // on the separate authSubscriptionPlans catalog table (read directly
    // via drizzle in `plans` below), not on the plugin's own subscription
    // row schema, so they aren't valid keys for this fields remap.
    schema: {
      subscription: {
        modelName: "authSubscriptions",
      }
    },
  }),
  deviceAuthorization({
    verificationUri: "/device",
  }),
  oneTimeToken(),
  i18n({
    translations: {
      fr: {
        USER_NOT_FOUND: "Utilisateur non trouvé",
        INVALID_EMAIL_OR_PASSWORD: "Email ou mot de passe invalide",
        INVALID_PASSWORD: "Mot de passe invalide",
      },
      de: {
        USER_NOT_FOUND: "Benutzer nicht gefunden",
        INVALID_EMAIL_OR_PASSWORD: "Ungültige E-Mail oder Passwort",
        INVALID_PASSWORD: "Ungültiges Passwort",
      },
    },
    detection: ["session", "header"],
    userLocaleField: "locale",
  }),

  // ---------------------------------------------------------------------
  // Everything below here used to live as ~20 disconnected files under
  // shared/utils/*.ts, each spinning up its own standalone betterAuth()
  // instance that nothing ever imported — dead prototype code. Consolidated
  // into this single real instance. Where a scaffold depended on
  // @mframework/adapter-prisma (a different DB client from the drizzle
  // adapter this app actually uses) or @mframework/core (a package that
  // doesn't exist in this repo), that dependency was removed in favor of
  // this layer's own db/audit utilities or the plugin's own defaults.
  // ---------------------------------------------------------------------

  twoFactor({
    issuer: process.env.NUXT_APP_NAME || 'App',
    otpOptions: {
      async sendOTP({ user, otp }) {
        const { error } = await sendAuthEmail({
          to: user.email,
          subject: 'Your verification code',
          html: `<p>Your verification code is <strong>${otp}</strong>. It expires shortly.</p>`,
          text: `Your verification code is ${otp}. It expires shortly.`,
        })
        if (error) console.error('[2fa] Failed to send OTP email to', user.email, error)
      },
    },
  }),

  username({
    minUsernameLength: MIN_USERNAME_LENGTH,
    maxUsernameLength: MAX_USERNAME_LENGTH,
    usernameValidator: isAllowedUsername,
    displayUsernameValidator: (displayUsername) => /^[a-zA-Z0-9_-]+$/.test(displayUsername),
    // Lowercase only — normalizeUsername's digit folding is for the 'admin'
    // lookalike check inside isAllowedUsername, not for storage.
    usernameNormalization: storedUsername,
    displayUsernameNormalization: (displayUsername) => displayUsername.toLowerCase(),
    validationOrder: {
      username: 'post-normalization',
      displayUsername: 'post-normalization',
    },
  }),

  magicLink({
    sendMagicLink: async ({ email, url }) => {
      const { error } = await sendAuthEmail({
        to: email,
        subject: 'Your sign-in link',
        html: `<p>Click the link below to sign in:</p><p><a href="${url}">${url}</a></p>`,
        text: `Click the link to sign in: ${url}`,
      })
      if (error) console.error('[magic-link] Failed to send sign-in link to', email, error)
    },
  }),

  emailOTP({
    async sendVerificationOTP({ email, otp, type }) {
      const { error } = await sendAuthEmail({
        to: email,
        subject: type === 'sign-in' ? 'Your sign-in code' : type === 'forget-password' ? 'Your password reset code' : 'Your verification code',
        html: `<p>Your code is <strong>${otp}</strong>. It expires shortly.</p>`,
        text: `Your code is ${otp}. It expires shortly.`,
      })
      if (error) console.error(`[email-otp] Failed to send ${type} OTP to`, email, error)
    },
    allowedAttempts: 5,
    otpLength: 8,
    expiresIn: 600,
  }),

  passkey(),

  apiKey(),

  // AT Protocol (Bluesky) sign-in — POST /sign-in/atproto, backed by
  // this deployment's hosted PDS by default. Finds-or-creates the local
  // user by the atprotoDid/atprotoHandle columns (see the
  // 20260901120000_add_atproto_identity migration and this file's
  // additionalFields above) and issues a normal better-auth session, same
  // as every other plugin here. See @mframework/meeovi-atproto's
  // src/auth/plugin.ts for the endpoint itself, and layers/social for the
  // read/post side of the same atproto integration
  // (AtprotoClient, in the same package).
  atprotoAuth({
    service: process.env.ATPROTO_SERVICE || 'https://sky.meeovicms.com',
    // Persists the resumable AT Protocol session (accessJwt/refreshJwt)
    // into atproto_sessions on every sign-in — without this, the plugin
    // only ever links the identity (atprotoDid/atprotoHandle on `users`)
    // and the user could never post/like/follow as themselves later, only
    // via the separate shared service-account client. One row per user
    // (upserted), read back by layers/social/server/utils/atproto.ts.
    onSessionEstablished: async ({ userId, session, service }) => {
      await db.insert(schema.atprotoSessions)
        .values({
          userId,
          did: session.did,
          handle: session.handle,
          service,
          accessJwt: session.accessJwt,
          refreshJwt: session.refreshJwt,
        })
        .onConflictDoUpdate({
          target: schema.atprotoSessions.userId,
          set: {
            did: session.did,
            handle: session.handle,
            service,
            accessJwt: session.accessJwt,
            refreshJwt: session.refreshJwt,
            updatedAt: new Date(),
          },
        })
    },
  }),

  jwt({
    disableSettingJwtHeader: true,
  }),

  // SSO/SAML, SCIM, generic OAuth providers, phone numbers and anonymous
  // sign-in are packages (packages/plugins/Authentication/auth-*), added by
  // the apps that register them — see modules/auth-plugins.ts.

  lastLoginMethod(),

  // Meeovi as an OpenID Connect provider — "Log in with Meeovi" on
  // Pixanomy (app.pixanomy.com, Nextcloud user_oidc) and any other
  // first-party app. Replaces the old mcp() plugin (unused, and its
  // oidcProvider schema collides with this one's model names); this plugin
  // also serves MCP clients via dynamic registration if that's enabled.
  // Discovery: <site>/api/auth/.well-known/openid-configuration.
  // Clients are registered by an admin — see
  // server/api/admin/oauth-clients.post.ts.
  oauthProvider({
    // The real sign-in page is layers/auth/app/pages/login.vue (route
    // /login) — it forwards the signed OAuth query and follows the
    // redirect back to the client once signed in.
    loginPage: '/login',
    consentPage: '/workspace/oauth/consent',
    scopes: ['openid', 'profile', 'email', 'offline_access'],
    schema: {
      oauthClient: { modelName: 'oauthProviderClient' },
      oauthRefreshToken: { modelName: 'oauthProviderRefreshToken' },
      oauthAccessToken: { modelName: 'oauthProviderAccessToken' },
      oauthConsent: { modelName: 'oauthProviderConsent' },
    },
    // The discovery docs are served under /api/auth (the issuer path);
    // there's no root-level /.well-known proxy, and clients here are
    // configured with the full discovery URL anyway.
    silenceWarnings: { oauthAuthServerConfig: true, openidConfig: true },
  }),

  // /api/auth/reference lists every auth endpoint — development only.
  ...(process.env.NODE_ENV === 'production' ? [] : [openAPI()]),

  oAuthProxy({
    productionURL: process.env.NUXT_PUBLIC_SITE_URL,
    currentURL: process.env.NUXT_APP_URL,
  }),

  // Google One Tap reuses the same socialProviders.google credentials
  // already configured on the main betterAuth() instance.
  oneTap(),

  adminPlugin({
    ac,
    roles: { admin, user, seller, myCustomRole },
    // role/banned/banReason/banExpires/impersonatedBy are mapped to new,
    // distinctly-named columns rather than the pre-existing users.role /
    // users.bannedUntil — those are Supabase's own native auth fields
    // (role in particular is used in Postgres RLS policy checks), not
    // app-level fields, and must not be repurposed.
    schema: {
      user: {
        fields: {
          role: 'authRole',
          banned: 'authBanned',
          banReason: 'authBanReason',
          banExpires: 'authBanExpires',
        },
      },
      session: {
        fields: {
          impersonatedBy: 'authImpersonatedBy',
        },
      },
    },
  }),

  // Real haveibeenpwned check on signup/password-change/reset — replaces
  // shared/utils/pwned.ts, which (despite its name) never actually
  // implemented a pwned-password check; it was a copy-paste of the same
  // oAuthProxy config as proxy.ts above.
  haveIBeenPwned(),

  // Cloudflare Turnstile on every unauthenticated auth flow: signing in
  // (password guessing), creating accounts (spam) and sending email (inbox
  // bombing). The forms send the token as `x-captcha-response`
  // (app/composables/useAuthCaptcha.ts). Endpoints match by substring, so
  // /sign-in/email also covers /sign-in/email-otp. Off when no secret is
  // configured (local dev). Scripts and the production tests can't pass
  // it; the tests open sessions directly instead.
  ...(process.env.NUXT_TURNSTILE_SECRET_KEY
    ? [captcha({
        provider: 'cloudflare-turnstile',
        secretKey: process.env.NUXT_TURNSTILE_SECRET_KEY,
        endpoints: [
          // sign-in
          '/sign-in/email', '/sign-in/username', '/sign-in/magic-link', '/sign-in/atproto',
          // accounts
          '/sign-up/email', '/sign-up/atproto',
          // only exists when an app registers @mframework/auth-anonymous
          '/sign-in/anonymous',
          // email sending
          '/request-password-reset', '/send-verification-email',
          '/email-otp/send-verification-otp', '/email-otp/request-password-reset', '/forget-password/email-otp',
        ],
      })]
    : []),
]
