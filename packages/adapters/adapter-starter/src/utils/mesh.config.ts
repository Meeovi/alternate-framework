import {
  createPrefixTransform,
  defineConfig,
  loadGraphQLHTTPSubgraph
} from '@graphql-mesh/compose-cli'
import {
  defineConfig as defineGatewayConfig
} from '@graphql-hive/gateway'

export const composeConfig = defineConfig({
  subgraphs: [
    {
      sourceHandler: loadGraphQLHTTPSubgraph('Starter', {
        endpoint: `${process.env.MYBACKEND_ENDPOINT}`,
        operationHeaders: {
          // This forwards the header from the incoming request to the remote server
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.MYBACKEND_TOKEN}`
        },
        retry: 2,
        timeout: 5_000
      }),
      transforms: [
        createPrefixTransform({
          value: 'Starter_',
          includeRootOperations: true
        })
      ]
    },
  ],
})

export const gatewayConfig = defineGatewayConfig({
  webhooks: true
})
