import { loadGraphQL } from './src/loader/loadGraphql'

loadGraphQL() 

export * from './src/utils/fetcher' 
export * from './src/loader/registry'

// Apollo client
export * from './src/client/apollo'

// REST helper
export * from './src/client/rest'

// GraphQL queries/mutations
export * from './src/graphql/queries/products'
// cart mutation not present in source — omitted for now

// Providers
export * from './src/providers/commerce'
// content/search providers are intentionally not exported here (no module)

// Utils
export * from './src/utils/errors'
export * from './src/utils/prisma'
