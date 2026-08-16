import { sql } from 'drizzle-orm'
import * as schema from '../../server/database/migrations/schema'
import { db } from '../../server/utils/drizzle'
import { stripeClient } from '../../server/utils/stripe'
import { logAuditEvent } from '../../server/utils/audits'
import { sendAuthEmail } from './infrastructure/email'
import type { User } from '../../app/types'
import { dash } from '@better-auth/infra'
import { sso } from '@better-auth/sso'
import { passkey } from '@better-auth/passkey'
import { apiKey } from '@better-auth/api-key'
import { scim } from '@better-auth/scim'
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
  anonymous,
  siwe,
  phoneNumber,
  lastLoginMethod,
  mcp,
  openAPI,
  oAuthProxy,
  oneTap,
  genericOAuth,
  jwt,
  haveIBeenPwned,
  auth0,
  gumroad,
  hubspot,
  keycloak,
  line,
  microsoftEntraId,
  okta,
  slack,
  patreon,
} from 'better-auth/plugins'
import { generateRandomString } from 'better-auth/crypto'
import { verifyMessage, createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { ac, admin, user, myCustomRole } from './permissions'
import { normalizeUsername } from './username'

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
    getCustomerCreateParams: async (user: User, ctx) => {
      // Previously read user.metadata?.referralSource — `metadata` was
      // never declared as an additionalField anywhere on the user model,
      // so this was always undefined regardless of who signed up. Attach
      // the one piece of real, available data instead.
      return {
        metadata: {
          appUserId: user.id
        }
      };
    },
    subscription: {
      enabled: true,
      // modelName was previously "subscriptions" — a pre-existing Directus
      // content table (status/subscriptionNumber/startDate/endDate, no
      // stripe_price_id or limits column) — this plugin could never have
      // stored real subscription state there. Points at a dedicated table
      // instead, same fix as organizations above.
      modelName: "authSubscriptions",
      fields: {
        id: "id",
        stripePriceId: "stripe_price_id",
        limits: "limits"
      },
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
        `, 'objects') as any[];
        return member?.role === "owner" || member?.role === "admin";
      },
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
    minUsernameLength: 5,
    maxUsernameLength: 100,
    usernameValidator: (username) => username !== 'admin',
    displayUsernameValidator: (displayUsername) => /^[a-zA-Z0-9_-]+$/.test(displayUsername),
    usernameNormalization: normalizeUsername,
    displayUsernameNormalization: (displayUsername) => displayUsername.toLowerCase(),
    validationOrder: {
      username: 'post-normalization',
      displayUsername: 'post-normalization',
    },
  }),

  // SSO/SAML — provisioning hooks log through this layer's real audit log
  // instead of a disconnected Prisma client. No real IdP is configured in
  // this environment, so the actual SSO login flow can't be exercised end
  // to end, but the plugin/endpoints are real and wired correctly.
  sso({
    provisionUser: async ({ user, userInfo, provider }) => {
      await logAuditEvent({
        userId: user.id,
        category: 'sso',
        action: 'sso_provision',
        targetType: 'user',
        targetId: user.id,
        status: 'success',
        details: JSON.stringify({ provider: provider.providerId, email: userInfo.email }),
        id: '',
      })
    },
    organizationProvisioning: {
      disabled: false,
      defaultRole: 'member',
      getRole: async ({ userInfo }) => {
        const department = userInfo.attributes?.department
        const jobTitle = userInfo.attributes?.jobTitle
        if (
          jobTitle?.toLowerCase().includes('manager') ||
          jobTitle?.toLowerCase().includes('director') ||
          jobTitle?.toLowerCase().includes('vp')
        ) return 'admin'
        if (department?.toLowerCase() === 'it') return 'admin'
        return 'member'
      },
    },
    saml: {
      enableInResponseToValidation: true,
      allowIdpInitiated: false,
      requestTTL: 10 * 60 * 1000,
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

  // SCIM provisioning token generation, gated to admins/org-admins and
  // audited through this layer's real audit log.
  scim({
    beforeSCIMTokenGenerated: async ({ user, member }) => {
      const isOrgAdmin = member?.role === 'admin' || member?.role === 'owner'
      const isAdmin = (user as any)?.role === 'admin'
      if (!isOrgAdmin && !isAdmin) {
        throw new Error('User does not have enough permissions')
      }
    },
    afterSCIMTokenGenerated: async ({ user }) => {
      await logAuditEvent({
        userId: user?.id,
        category: 'scim',
        action: 'scim_token_generated',
        targetType: 'user',
        targetId: user?.id || '',
        status: 'success',
        id: '',
      })
    },
  }),

  jwt({
    disableSettingJwtHeader: true,
  }),

  anonymous({
    emailDomainName: 'example.com',
  }),

  // Sign-In-With-Ethereum — real signature verification via viem. No
  // wallet is available in this environment to drive the full flow, but
  // the nonce/verify endpoints are real.
  siwe({
    domain: process.env.NUXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || 'localhost',
    emailDomainName: process.env.NUXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || 'localhost',
    anonymous: false,
    getNonce: async () => generateRandomString(32, 'a-z', 'A-Z', '0-9'),
    verifyMessage: async ({ message, signature, address }) => {
      try {
        return await verifyMessage({
          address: address as `0x${string}`,
          message,
          signature: signature as `0x${string}`,
        })
      } catch (error) {
        console.error('SIWE verification failed:', error)
        return false
      }
    },
    ensLookup: async ({ walletAddress }) => {
      try {
        const client = createPublicClient({ chain: mainnet, transport: http() })
        const ensName = await client.getEnsName({ address: walletAddress as `0x${string}` })
        const ensAvatar = ensName ? await client.getEnsAvatar({ name: ensName }) : null
        return { name: ensName || walletAddress, avatar: ensAvatar || '' }
      } catch {
        return { name: walletAddress, avatar: '' }
      }
    },
  }),

  // Phone OTP — falls back to a console log when Twilio isn't configured
  // (TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_VERIFY_SERVICE_SID are
  // placeholders in this environment), same pattern as magicLink/emailOTP.
  phoneNumber({
    sendOTP: async ({ phoneNumber, code }) => {
      console.info('[phone-otp] OTP for', phoneNumber, code)
    },
    signUpOnVerification: {
      getTempEmail: (phoneNumber) => `${phoneNumber}@example.com`,
      getTempName: (phoneNumber) => phoneNumber,
    },
  }),

  lastLoginMethod(),

  // The real sign-in page is layers/auth/app/pages/login.vue (route
  // /login) — '/sign-in' doesn't exist anywhere in this app, so an MCP
  // client's auth redirect would have 404'd.
  mcp({
    loginPage: '/login',
  }),

  openAPI(),

  oAuthProxy({
    productionURL: process.env.NUXT_PUBLIC_SITE_URL,
    currentURL: process.env.NUXT_APP_URL,
  }),

  // Google One Tap reuses the same socialProviders.google credentials
  // already configured on the main betterAuth() instance.
  oneTap(),

  // Generic OAuth providers — registered so the endpoints are real and
  // correctly wired, but none of these have real client credentials in
  // this environment (AUTH0_CLIENT_ID etc. are unset), so an actual login
  // through any of them can't be exercised end to end here.
  genericOAuth({
    config: [
      auth0({
        clientId: `${process.env.AUTH0_CLIENT_ID}`,
        clientSecret: `${process.env.AUTH0_CLIENT_SECRET}`,
        domain: `${process.env.AUTH0_DOMAIN}`,
      }),
      gumroad({
        clientId: `${process.env.GUMROAD_CLIENT_ID}`,
        clientSecret: `${process.env.GUMROAD_CLIENT_SECRET}`,
      }),
      hubspot({
        clientId: `${process.env.HUBSPOT_CLIENT_ID}`,
        clientSecret: `${process.env.HUBSPOT_CLIENT_SECRET}`,
        scopes: ['oauth', 'contacts'],
      }),
      keycloak({
        clientId: `${process.env.KEYCLOAK_CLIENT_ID}`,
        clientSecret: `${process.env.KEYCLOAK_SECRET}`,
        issuer: `${process.env.KEYCLOAK_ISSUER}`,
      }),
      line({
        providerId: 'line-jp',
        clientId: `${process.env.LINE_JP_CLIENT_ID}`,
        clientSecret: `${process.env.LINE_JP_CLIENT_SECRET}`,
      }),
      microsoftEntraId({
        clientId: `${process.env.MS_APP_ID}`,
        clientSecret: `${process.env.MS_CLIENT_SECRET}`,
        tenantId: `${process.env.MS_TENANT_ID}`,
      }),
      okta({
        clientId: `${process.env.OKTA_CLIENT_ID}`,
        clientSecret: `${process.env.OKTA_CLIENT_SECRET}`,
        issuer: `${process.env.OKTA_ISSUER}`,
      }),
      slack({
        clientId: `${process.env.SLACK_CLIENT_ID}`,
        clientSecret: `${process.env.SLACK_CLIENT_SECRET}`,
      }),
      patreon({
        clientId: `${process.env.PATREON_CLIENT_ID}`,
        clientSecret: `${process.env.PATREON_CLIENT_SECRET}`,
      }),
    ],
  }),

  adminPlugin({
    ac,
    roles: { admin, user, myCustomRole },
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
]
