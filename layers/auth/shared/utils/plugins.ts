import { sql } from 'drizzle-orm'
import * as schema from '../../server/database/migrations/schema'
import { db } from '../../server/utils/drizzle'
import { stripeClient } from '../../server/utils/stripe'
import type { User } from '../../app/types'
import { dash } from '@better-auth/infra'
import { deviceAuthorization } from 'better-auth/plugins'
import { i18n } from '@better-auth/i18n'
import { multiSession } from 'better-auth/plugins'
import { oneTimeToken } from 'better-auth/plugins'
import { organization } from 'better-auth/plugins'
import { stripe } from '@better-auth/stripe'

export const plugins = [
  dash(),
  multiSession(),
  organization({
    schema: {
      organization: {
        modelName: "organizations",
        fields: {
          name: "name",
          slug: "slug",
          logo: "logo",
          metadata: "metadata",
          createdAt: "dateCreated"
        }
      },
      member: {
        modelName: "organization_members",
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
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    createCustomerOnSignUp: true,
    onCustomerCreate: async ({
      stripeCustomer,
      user
    }, ctx) => {
      console.log(`Customer ${stripeCustomer.id} created for user ${user.id}`);
    },
    getCustomerCreateParams: async (user: User, ctx) => {
      return {
        metadata: {
          referralSource: user.metadata?.referralSource ?? ''
        }
      };
    },
    subscription: {
      enabled: true,
      modelName: "subscriptions",
      fields: {
        id: "id",
        stripePriceId: "stripe_price_id",
        limits: "limits"
      },
      plans: async () => {
        const plans = await db.select().from(schema.subscriptions);
        
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
            metadata: {
              planType: "business",
              referralCode: user.metadata?.referralCode
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
          SELECT * FROM organization_members 
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
]
