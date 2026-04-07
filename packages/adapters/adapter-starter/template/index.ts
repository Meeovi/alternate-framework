import { createTransport } from './src/transport'
import { createAuthAdapter } from './src/auth'
import { createCommerceAdapter } from './src/commerce'
import { createSearchAdapter } from './src/search'
import { createAdapterInstaller, defineAdapterLayerFactories } from './src/patterns'

// Replace __PACKAGE_NAME__ with your package name.
const layerFactories = defineAdapterLayerFactories({
  auth: createAuthAdapter,
  commerce: createCommerceAdapter,
  search: createSearchAdapter,
})

export const install__SHORT_NAME__Adapter = createAdapterInstaller(createTransport, layerFactories)
