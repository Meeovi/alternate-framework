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

const oauthProviders = [
	process.env.AUTH0_CLIENT_ID && process.env.AUTH0_CLIENT_SECRET && process.env.AUTH0_DOMAIN
		? auth0({
				clientId: process.env.AUTH0_CLIENT_ID,
				clientSecret: process.env.AUTH0_CLIENT_SECRET,
				domain: process.env.AUTH0_DOMAIN,
			})
		: null,
	process.env.GUMROAD_CLIENT_ID && process.env.GUMROAD_CLIENT_SECRET
		? gumroad({
				clientId: process.env.GUMROAD_CLIENT_ID,
				clientSecret: process.env.GUMROAD_CLIENT_SECRET,
			})
		: null,
	process.env.HUBSPOT_CLIENT_ID && process.env.HUBSPOT_CLIENT_SECRET
		? hubspot({
				clientId: process.env.HUBSPOT_CLIENT_ID,
				clientSecret: process.env.HUBSPOT_CLIENT_SECRET,
				scopes: ['oauth', 'contacts'],
			})
		: null,
	process.env.KEYCLOAK_CLIENT_ID && process.env.KEYCLOAK_CLIENT_SECRET && process.env.KEYCLOAK_ISSUER
		? keycloak({
				clientId: process.env.KEYCLOAK_CLIENT_ID,
				clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
				issuer: process.env.KEYCLOAK_ISSUER,
			})
		: null,
	process.env.LINE_JP_CLIENT_ID && process.env.LINE_JP_CLIENT_SECRET
		? line({
				providerId: 'line-jp',
				clientId: process.env.LINE_JP_CLIENT_ID,
				clientSecret: process.env.LINE_JP_CLIENT_SECRET,
			})
		: null,
	process.env.LINE_TH_CLIENT_ID && process.env.LINE_TH_CLIENT_SECRET
		? line({
				providerId: 'line-th',
				clientId: process.env.LINE_TH_CLIENT_ID,
				clientSecret: process.env.LINE_TH_CLIENT_SECRET,
			})
		: null,
	process.env.MS_APP_ID && process.env.MS_CLIENT_SECRET && process.env.MS_TENANT_ID
		? microsoftEntraId({
				clientId: process.env.MS_APP_ID,
				clientSecret: process.env.MS_CLIENT_SECRET,
				tenantId: process.env.MS_TENANT_ID,
			})
		: null,
	process.env.OKTA_CLIENT_ID && process.env.OKTA_CLIENT_SECRET && process.env.OKTA_ISSUER
		? okta({
				clientId: process.env.OKTA_CLIENT_ID,
				clientSecret: process.env.OKTA_CLIENT_SECRET,
				issuer: process.env.OKTA_ISSUER,
			})
		: null,
	process.env.SLACK_CLIENT_ID && process.env.SLACK_CLIENT_SECRET
		? slack({
				clientId: process.env.SLACK_CLIENT_ID,
				clientSecret: process.env.SLACK_CLIENT_SECRET,
			})
		: null,
	process.env.PATREON_CLIENT_ID && process.env.PATREON_CLIENT_SECRET
		? patreon({
				clientId: process.env.PATREON_CLIENT_ID,
				clientSecret: process.env.PATREON_CLIENT_SECRET,
			})
		: null,
].filter(Boolean) as any[];

export const oAuth = betterAuth({
	plugins: [
		genericOAuth({
			config: oauthProviders,
		}),
	],
});

export default defineNitroPlugin(() => {
  // Keep this module compatible with Nitro plugin auto-loading.
})
