import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler((event) => {
  const runtimeConfig = useRuntimeConfig() as any
  const polarAccessToken = runtimeConfig.polarAccessToken as string
  const polarServer = (runtimeConfig.polarServer || 'sandbox') as 'sandbox' | 'production'

  const customerPortalHandler = CustomerPortal({
    accessToken: polarAccessToken,
    returnUrl: 'https://myapp.com', // An optional URL which renders a back-button in the Customer Portal
    server: polarServer,
    getCustomerId: (event) => {
      // Use your own logic to get the customer ID - from a database, session, etc.
      return Promise.resolve('9d89909b-216d-475e-8005-053dba7cff07')
    },
  })

  return customerPortalHandler(event)
})