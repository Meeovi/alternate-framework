export { default as AlternateAuthNuxtModule } from './integrations/nuxt/module'
export * from './integrations/nuxt'

export * from './runtime/composables/useAuth'
export * from './runtime/composables/useAuthorization'
export * from './runtime/composables/useCurrentUser'

export {
	authClient,
	signIn,
	signOut,
	signUp,
	useSession,
	forgotPassword,
	forgetPassword,
	resetPassword
} from './client/auth-client'

export * from './server/utils/auth'
export * from './server/utils/adapter-auth'

export * from './server/plugins'