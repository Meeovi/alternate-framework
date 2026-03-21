import { betterAuth } from 'better-auth';
import {
	// genericOAuth plugin
	genericOAuth,
	// providers
	auth0,
	gumroad,
	hubspot,
	keycloak,
	line,
	microsoftEntraId,
	okta,
	slack,
	patreon,
} from 'better-auth/plugins';

export const oAuth = betterAuth({
	plugins: [
		genericOAuth({
			config: [
				auth0({
					clientId: String(process.env.AUTH0_CLIENT_ID ?? ''),
					clientSecret: String(process.env.AUTH0_CLIENT_SECRET ?? ''),
					domain: String(process.env.AUTH0_DOMAIN ?? ''),
				}),
				gumroad({
					clientId: String(process.env.GUMROAD_CLIENT_ID ?? ''),
					clientSecret: String(process.env.GUMROAD_CLIENT_SECRET ?? ''),
				}),
				hubspot({
					clientId: String(process.env.HUBSPOT_CLIENT_ID ?? ''),
					clientSecret: String(process.env.HUBSPOT_CLIENT_SECRET ?? ''),
					scopes: ['oauth', 'contacts'],
				}),
				keycloak({
					clientId: String(process.env.KEYCLOAK_CLIENT_ID ?? ''),
					clientSecret: String(process.env.KEYCLOAK_CLIENT_SECRET ?? ''),
					issuer: String(process.env.KEYCLOAK_ISSUER ?? ''),
				}),
				// LINE supports multiple channels (countries) - use different providerIds
				line({
					providerId: 'line-jp',
					clientId: String(process.env.LINE_JP_CLIENT_ID ?? ''),
					clientSecret: String(process.env.LINE_JP_CLIENT_SECRET ?? ''),
				}),
				line({
					providerId: 'line-th',
					clientId: String(process.env.LINE_TH_CLIENT_ID ?? ''),
					clientSecret: String(process.env.LINE_TH_CLIENT_SECRET ?? ''),
				}),
				microsoftEntraId({
					clientId: String(process.env.MS_APP_ID ?? ''),
					clientSecret: String(process.env.MS_CLIENT_SECRET ?? ''),
					tenantId: String(process.env.MS_TENANT_ID ?? ''),
				}),
				okta({
					clientId: String(process.env.OKTA_CLIENT_ID ?? ''),
					clientSecret: String(process.env.OKTA_CLIENT_SECRET ?? ''),
					issuer: String(process.env.OKTA_ISSUER ?? ''),
				}),
				slack({
					clientId: String(process.env.SLACK_CLIENT_ID ?? ''),
					clientSecret: String(process.env.SLACK_CLIENT_SECRET ?? ''),
				}),
				patreon({
					clientId: String(process.env.PATREON_CLIENT_ID ?? ''),
					clientSecret: String(process.env.PATREON_CLIENT_SECRET ?? ''),
				}),
                
			],
		}),
	],
});