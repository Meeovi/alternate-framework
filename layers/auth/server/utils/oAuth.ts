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
					clientId: process.env.AUTH0_CLIENT_ID,
					clientSecret: process.env.AUTH0_CLIENT_SECRET,
					domain: process.env.AUTH0_DOMAIN,
				}),
				gumroad({
					clientId: process.env.GUMROAD_CLIENT_ID,
					clientSecret: process.env.GUMROAD_CLIENT_SECRET,
				}),
				hubspot({
					clientId: process.env.HUBSPOT_CLIENT_ID,
					clientSecret: process.env.HUBSPOT_CLIENT_SECRET,
					scopes: ['oauth', 'contacts'],
				}),
				keycloak({
					clientId: process.env.KEYCLOAK_CLIENT_ID,
					clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
					issuer: process.env.KEYCLOAK_ISSUER,
				}),
				// LINE supports multiple channels (countries) - use different providerIds
				line({
					providerId: 'line-jp',
					clientId: process.env.LINE_JP_CLIENT_ID,
					clientSecret: process.env.LINE_JP_CLIENT_SECRET,
				}),
				line({
					providerId: 'line-th',
					clientId: process.env.LINE_TH_CLIENT_ID,
					clientSecret: process.env.LINE_TH_CLIENT_SECRET,
				}),
				microsoftEntraId({
					clientId: process.env.MS_APP_ID,
					clientSecret: process.env.MS_CLIENT_SECRET,
					tenantId: process.env.MS_TENANT_ID,
				}),
				okta({
					clientId: process.env.OKTA_CLIENT_ID,
					clientSecret: process.env.OKTA_CLIENT_SECRET,
					issuer: process.env.OKTA_ISSUER,
				}),
				slack({
					clientId: process.env.SLACK_CLIENT_ID,
					clientSecret: process.env.SLACK_CLIENT_SECRET,
				}),
				patreon({
					clientId: process.env.PATREON_CLIENT_ID,
					clientSecret: process.env.PATREON_CLIENT_SECRET,
				}),
                
			],
		}),
	],
});