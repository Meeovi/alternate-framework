# @mframework/adapter-magento

A Magento adapter for Meeovi SDK. This package provides:

- a lightweight HTTP transport factory with timeouts and retries (`createStarterTransport`)
- a GraphQL client factory for Magento (`createMagentoClient`)
- starter `Auth` and `Commerce` adapter factories that call an HTTP transport

Configuration

`createStarterTransport` accepts an options object:

- `baseUrl` (string) - base URL for HTTP requests
- `apiKey` (string, optional) - sets an Authorization Bearer header
- `fetchImpl` (optional) - custom fetch implementation for Node runtimes
- `timeoutMs` (optional) - request timeout in milliseconds
- `retries` (optional) - number of retry attempts for transient errors (default 1)
- `retryDelayMs` (optional) - delay between retries in milliseconds (default 250)

`createMagentoClient` options:

- `endpoint` (string) - GraphQL endpoint
- `accessToken` (string, optional) - bearer token for Magento
- `timeoutMs` (number, optional) - request timeout for GraphQL fetch
- `fetchImpl` (optional) - custom fetch implementation for Node

Example

```ts
import { createStarterTransport } from '@mframework/adapter-magento/src/transport'
import { createStarterCommerceAdapter } from '@mframework/adapter-magento/src/commerce'

const transport = createStarterTransport({ baseUrl: 'https://api.my-magento.com', timeoutMs: 5000, retries: 2 })
const commerce = createStarterCommerceAdapter(transport)
```

For GraphQL usage (search adapter):

```ts
import { createMagentoClient } from '@mframework/adapter-magento/src/client'
const sdk = createMagentoClient({ endpoint: 'https://api.my-magento.com/graphql', accessToken: process.env.MAGENTO_TOKEN, timeoutMs: 5000 })
// use sdk.GetProducts(...) etc.
```

Notes

- This package intentionally keeps adapter implementations small; production deployments should provide secure token management and error monitoring at the application level.
- If you run on Node <18, provide a `fetchImpl` such as `node-fetch`.
