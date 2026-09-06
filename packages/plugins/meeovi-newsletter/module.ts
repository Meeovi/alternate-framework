import {
  defineNuxtModule,
  createResolver,
  addComponentsDir,
  addImportsDir,
  addServerHandler,
} from '@nuxt/kit'
import type { MeeoviNewsletterModuleOptions } from './runtime/types'

export type { MeeoviNewsletterModuleOptions } from './runtime/types'
export * from './runtime/types'

const env = process.env

export default defineNuxtModule<MeeoviNewsletterModuleOptions>({
  meta: {
    name: 'meeovi-newsletter',
    configKey: 'meeoviNewsletter',
    compatibility: {
      nuxt: '^4.0.0',
    },
  },

  defaults: {
    provider: (env.NEWSLETTER_PROVIDER as MeeoviNewsletterModuleOptions['provider']) || 'directus',
    apiBase: '/api/newsletter',
    doubleOptIn: true,
    mailchimp: {
      apiKey: env.NEWSLETTER_API_KEY || env.MAILCHIMP_API_KEY,
      serverPrefix: env.MAILCHIMP_SERVER_PREFIX,
      audienceId: env.MAILCHIMP_AUDIENCE_ID,
    },
    directus: {
      url: env.NEWSLETTER_DIRECTUS_URL || env.DIRECTUS_URL,
      token: env.NEWSLETTER_DIRECTUS_TOKEN || env.NUXTUS_DIRECTUS_STATIC_TOKEN,
      collection: env.NEWSLETTER_DIRECTUS_COLLECTION || 'newsletters',
      emailField: 'email',
      statusField: 'status',
      statusValue: 'subscribed',
    },
    ui: {},
    turnstile: {
      // Auto-enable when the app already has a Turnstile site key
      // configured (e.g. via @nuxtjs/turnstile in layers/shared); stays
      // off otherwise so the module works standalone without it.
      enabled: Boolean(env.NUXT_PUBLIC_TURNSTILE_SITE_KEY),
    },
  },

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const apiBase = (options.apiBase || '/api/newsletter').replace(/\/+$/, '')

    // `#meeovi-newsletter` → runtime dir, for explicit imports in app code.
    nuxt.options.alias['#meeovi-newsletter'] = resolver.resolve('runtime')
    nuxt.options.alias['#meeovi-newsletter/'] = resolver.resolve('runtime') + '/'

    // Auto-import <MeeoviNewsletter> / <NewsletterBox> and useNewsletter().
    addComponentsDir({
      path: resolver.resolve('runtime/components'),
      pathPrefix: false,
    })
    addImportsDir(resolver.resolve('runtime/composables'))

    // Subscribe endpoint — dispatches to the configured backend provider.
    addServerHandler({
      route: `${apiBase}/subscribe`,
      method: 'post',
      handler: resolver.resolve('server/api/newsletter/subscribe.post'),
    })

    // Private config — credentials never reach the client bundle.
    const runtimeConfig = nuxt.options.runtimeConfig as Record<string, any>
    runtimeConfig.meeoviNewsletter = {
      ...(runtimeConfig.meeoviNewsletter as Record<string, unknown> || {}),
      provider: options.provider || 'directus',
      doubleOptIn: options.doubleOptIn !== false,
      mailchimp: { ...options.mailchimp },
      directus: {
        collection: 'newsletters',
        emailField: 'email',
        statusField: 'status',
        statusValue: 'subscribed',
        ...options.directus,
      },
      turnstile: {
        enabled: options.turnstile?.enabled ?? Boolean(env.NUXT_PUBLIC_TURNSTILE_SITE_KEY),
      },
    }

    // Public config — provider name + UI defaults only.
    nuxt.options.runtimeConfig.public.meeoviNewsletter = {
      ...(nuxt.options.runtimeConfig.public.meeoviNewsletter as Record<string, unknown> || {}),
      apiBase,
      provider: options.provider || 'directus',
      ui: { ...options.ui },
      turnstile: {
        enabled: options.turnstile?.enabled ?? Boolean(env.NUXT_PUBLIC_TURNSTILE_SITE_KEY),
      },
    }
  },
})
