import { defineEventHandler, createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import { requireAuth } from '#auth/server/utils/sessions'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  if (!user.polarCustomerId) {
    throw createError({
      statusCode: 404,
      statusMessage: 'No billing account found for this user',
    })
  }

  const runtimeConfig = useRuntimeConfig() as any
  const polarAccessToken = runtimeConfig.polarAccessToken as string
  const polarServer = (runtimeConfig.polarServer || 'sandbox') as 'sandbox' | 'production'

  const customerPortalHandler = CustomerPortal({
    accessToken: polarAccessToken,
    returnUrl: `${process.env.NUXT_PUBLIC_SITE_URL}`, // An optional URL which renders a back-button in the Customer Portal
    server: polarServer,
    getCustomerId: () => Promise.resolve(user.polarCustomerId as string),
  })

  return customerPortalHandler(event)
})