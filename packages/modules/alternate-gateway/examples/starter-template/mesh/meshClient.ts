/**
 * Mesh Query Client
 * 
 * Provides a simple interface for executing GraphQL queries against the
 * unified Mesh schema. Used by composables and server routes.
 * 
 * Usage:
 *   const data = await executeQuery<ArtworksQuery>(query, variables)
 */

import { execute, parse, type DocumentNode } from 'graphql'
import { getMeshInstance } from './meshInstance'

export interface ExecuteOptions {
  variables?: Record<string, any>
  contextValue?: any
}

/**
 * Execute a GraphQL query against the Mesh schema
 * 
 * @param query - GraphQL query string or DocumentNode
 * @param variables - Query variables
 * @returns Query result data
 * @throws Error if query has errors
 */
export async function executeQuery<TData = any, TVars = Record<string, any>>(
  query: string | DocumentNode,
  variables?: TVars
): Promise<TData> {
  const mesh = await getMeshInstance()
  const document = typeof query === 'string' ? parse(query) : query

  const result = await execute({
    schema: mesh.schema,
    document,
    variableValues: (variables as Record<string, unknown> | undefined),
    contextValue: {}
  })

  if (result.errors?.length) {
    const errorMessages = result.errors
      .map(e => `${e.message}${e.path ? ` at ${e.path.join('.')}` : ''}`)
      .join('; ')
    throw new Error(`GraphQL Error: ${errorMessages}`)
  }

  return result.data as TData
}

/**
 * Execute a GraphQL mutation against the Mesh schema
 * 
 * Alias for executeQuery but semantically indicates a mutation.
 */
export async function executeMutation<TData = any, TVars = Record<string, any>>(
  mutation: string | DocumentNode,
  variables?: TVars
): Promise<TData> {
  return executeQuery<TData, TVars>(mutation, variables)
}

/**
 * Batch execute multiple queries
 * 
 * Execute multiple queries and return results in order.
 * Errors in one query do not affect others.
 */
export async function batchExecute<TData = any>(
  queries: Array<{
    query: string | DocumentNode
    variables?: Record<string, any>
  }>
): Promise<Array<{ data?: TData; error?: Error }>> {
  const results = await Promise.allSettled(
    queries.map(({ query, variables }) =>
      executeQuery<TData>(query, variables)
    )
  )

  return results.map(result => {
    if (result.status === 'fulfilled') {
      return { data: result.value }
    }
    return { error: result.reason as Error }
  })
}
