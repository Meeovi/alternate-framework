import {
  setAuthAdapter,
  setCommerceAdapter,
  setSearchAdapter
} from '@mframework/sdk'

import { createTransport } from './src/transport'
import { createAuthAdapter } from './src/auth'
import { createCommerceAdapter } from './src/commerce'
import { createSearchAdapter } from './src/search'

// Replace __PACKAGE_NAME__ with your package name.
export const install__SHORT_NAME__Adapter = (config: { baseUrl: string; apiKey?: string }) => {
  const transport = createTransport(config)

  setAuthAdapter(createAuthAdapter(transport))
  setCommerceAdapter(createCommerceAdapter(transport))
  setSearchAdapter(createSearchAdapter(transport))
}
