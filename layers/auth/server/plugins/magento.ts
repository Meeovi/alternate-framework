import { betterAuth } from "better-auth"
import { genericOAuth } from "better-auth/plugins"

export const magentoAuth = () => betterAuth({
	plugins: [
		genericOAuth({
			config: [{
				providerId: "magento",
				clientId: process.env.MAGENTO_CLIENT_ID,
				clientSecret: process.env.MAGENTO_CLIENT_SECRET,
				// Use Magento's OAuth endpoints
				authorizationUrl: `${process.env.MAGE_STORE_URL}/oauth/authorize`,
				tokenUrl: `${process.env.MAGE_STORE_URL}/oauth/token`,
				userInfoUrl: `${process.env.MAGE_STORE_URL}/rest/V1/customers/me`,
				scopes: ["openid", "email", "profile"],
				// If Magento uses OIDC discovery, you can use discoveryUrl instead:
				// discoveryUrl: `${process.env.MAGE_STORE_URL}/.well-known/openid-configuration`,
			}]
		})
	]
})

export default defineNitroPlugin(() => {
  // Keep this module compatible with Nitro plugin auto-loading.
})
