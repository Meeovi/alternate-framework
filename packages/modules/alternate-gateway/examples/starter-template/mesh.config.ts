import { defineConfig, loadGraphQLHTTPSubgraph } from '@graphql-mesh/compose-cli'
 
export const composeConfig = defineConfig({
  subgraphs: [
    {
      sourceHandler: loadGraphQLHTTPSubgraph('commerce', {
        endpoint: 'https://api.github.com/graphql',
        // You can provide your SDL or introspection seperately
        source: 'https://docs.github.com/public/schema.docs.graphql',
 
        operationHeaders: {
          // This forwards the header from the incoming request to the remote server
          authorization: 'Bearer {context.headers["x-my-api-token"]}'
        },
        // Specify here, if you have an unstable/error prone indexer and want to retry failed requests
        retry: 2
      })
    },
    {
      sourceHandler: loadGraphQLHTTPSubgraph('social', {
        endpoint: `http://localhost:4002/graphql`,
        // Specify here, if you have an unstable/error prone indexer and want to retry failed requests
        retry: 2
      })
    }
  ],
})