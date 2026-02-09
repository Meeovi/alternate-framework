import { setCommerceAdapter } from '@mframework/core'

import { createTransport } from './src/transport'
import { createCommerceAdapter } from './src/commerce'

export const installAdapter = (config: { baseUrl: string; apiKey?: string }) => {
  const transport = createTransport(config)

  setCommerceAdapter(createCommerceAdapter(transport))
}
