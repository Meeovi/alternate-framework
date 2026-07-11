import {
  createServer
} from 'node:http'
import {
  createYoga
} from 'graphql-yoga'
import {
  schema
} from './schema.js'
import {
  useAPQ
} from '@graphql-yoga/plugin-apq'
import {
  useCookies
} from '@whatwg-node/server-plugin-cookies'
import {
  buildHTTPExecutor
} from '@graphql-tools/executor-http'
import { costLimitPlugin } from '@escape.tech/graphql-armor-cost-limit'
import { maxAliasesPlugin } from '@escape.tech/graphql-armor-max-aliases'
import { maxDepthPlugin } from '@escape.tech/graphql-armor-max-depth'
import { maxDirectivesPlugin } from '@escape.tech/graphql-armor-max-directives'
import { maxTokensPlugin } from '@escape.tech/graphql-armor-max-tokens'
import { useDeferStream } from '@graphql-yoga/plugin-defer-stream'

// Create a Yoga instance with a GraphQL schema.
const yoga = createYoga({
  schema,
  plugins: [
    useAPQ(),
    useCookies(),
    costLimitPlugin(),
    maxTokensPlugin(),
    maxDepthPlugin(),
    maxDirectivesPlugin(),
    maxAliasesPlugin(),
    useDeferStream()
  ],
  logging: 'debug',
  batching: true
})

// Pass it into a server to hook into request handlers.
const server = createServer(yoga)

// Start the server and you're done!
server.listen(4000, () => {
  console.info('Server is running on http://localhost:4000/graphql')
})

const executor = buildHTTPExecutor({
  fetch: yoga.fetch
})
