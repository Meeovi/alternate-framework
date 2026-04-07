import {
  createServer
} from 'node:http'
import {
  loadBaseAppEnv
} from '../utils/load-base-app-env'
import {
  createYoga,
  useExecutionCancellation
} from 'graphql-yoga'
import {
  useCSRFPrevention
} from '@graphql-yoga/plugin-csrf-prevention'
import {
  usePersistedOperations
} from '@graphql-yoga/plugin-persisted-operations'
import {
  useAPQ
} from '@graphql-yoga/plugin-apq'
import {
  useCookies
} from '@whatwg-node/server-plugin-cookies'
import {
  createSupergraphSDLFetcher
} from '@graphql-hive/yoga'
import {
  getStitchedSchemaFromSupergraphSdl
} from '@graphql-tools/federation'
import {
  useManagedFederation
} from '@graphql-yoga/apollo-managed-federation'
import {
  usePrometheus
} from '@graphql-yoga/plugin-prometheus'
import {
  costLimitPlugin
} from '@escape.tech/graphql-armor-cost-limit'
import {
  maxAliasesPlugin
} from '@escape.tech/graphql-armor-max-aliases'
import {
  maxDepthPlugin
} from '@escape.tech/graphql-armor-max-depth'
import {
  maxDirectivesPlugin
} from '@escape.tech/graphql-armor-max-directives'
import {
  maxTokensPlugin
} from '@escape.tech/graphql-armor-max-tokens'

const store: Record<string, string> = {
  ecf4edb46db40b5132295c0291d62fb65d6759a9eedfa4d5d612dd5ec54a6b38: '{__typename}'
};

(async () => {
  const loadedBaseAppDir = loadBaseAppEnv()

  const supergraphFetcher = createSupergraphSDLFetcher({
    key: `${process.env.HIVE_CDN_KEY ?? ''}`,
    endpoint: `${process.env.HIVE_CDN_URL ?? ''}`
  });

  const {
    supergraphSdl
  } = await supergraphFetcher()

  // Create a Yoga instance with a GraphQL schema.
  const yoga = createYoga({
    plugins: [
      useExecutionCancellation(),
      useCSRFPrevention({
        requestHeaders: ['x-graphql-yoga-csrf'] // default
      }),
      usePersistedOperations({
        skipDocumentValidation: true,
        getPersistedOperation(sha256Hash: string) {
          return store[sha256Hash]
        },
      }),
      useAPQ(),
      useCookies(),
      useManagedFederation(),
      usePrometheus({
        endpoint: '/metrics', // optional, default is `/metrics`, you can disable it by setting it to `false` if registry is configured in "push" mode
        // Optional, see default values below
        metrics: {
          // This metric is disabled by default.
          // Warning: enabling resolvers level metrics will introduce significant overhead
          graphql_envelop_execute_resolver: false
        }
      }),
      costLimitPlugin(),
      maxTokensPlugin(),
      maxDepthPlugin(),
      maxDirectivesPlugin(),
      maxAliasesPlugin()
    ],
    schema: getStitchedSchemaFromSupergraphSdl({
      supergraphSdl
    }),
    graphqlEndpoint: '/api/server',
    batching: true,
    logging: 'debug',
    healthCheckEndpoint: '/live',
    cors: {
      origin: `${process.env.NUXT_PUBLIC_SITE_URL}`,
      credentials: true,
      allowedHeaders: [`${process.env.GRAPHQL_HEADER_AUTH}`],
      methods: ["POST"],
    },
  })

  // Pass it into a server to hook into request handlers.
  const server = createServer(yoga)

  // Start the server and you're done!
  server.listen(4000, () => {
    if (loadedBaseAppDir) {
      console.info(`Loaded gateway env from base app: ${loadedBaseAppDir}`)
    }
    console.info('Server is running on http://localhost:4000/graphql')
  })
})()
