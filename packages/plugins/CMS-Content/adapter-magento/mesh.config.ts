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
      sourceHandler: loadGraphQLHTTPSubgraph('Mage', {
        endpoint: `${process.env.MAGENTO_GRAPHQL_URL}`,
        operationHeaders: {
          // This forwards the header from the incoming request to the remote server
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GQL_KEY}`
        },
        retry: 2,
        timeout: 5_000
      }),
      transforms: [
        createPrefixTransform({
          value: 'Mage_',
          includeRootOperations: true
        })
      ]
    },
  ],
})

export const gatewayConfig = defineGatewayConfig({
  webhooks: true
})
