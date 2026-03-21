/**
 * Mesh Query Client
 *
 * Provides a simple interface to execute GraphQL queries through the mesh.
 * Handles error formatting and response typing for composables and server routes.
 *
 * See: docs/mesh-architecture.md
 */

import { execute, parse, type DocumentNode } from 'graphql'
import { getMeshInstance } from './meshInstance'

export interface QueryExecutionOptions {
  variables?: Record<string, any>
  operationName?: string
}

/**
 * Execute a GraphQL query or mutation through the mesh
 *
 * @param query - GraphQL query string or DocumentNode
 * @param options - Variables and operation name
 * @returns Query result data, typed by the caller
 * @throws Error if query execution fails
 *
 * @example
 * const result = await executeQuery<ProductsQuery>(
 *   `query GetProducts($limit: Int!) {
 *     products(limit: $limit) { id name }
 *   }`,
 *   { variables: { limit: 10 } }
 * )
 */
export async function executeQuery<TData = any>(
  query: string | DocumentNode,
  options?: QueryExecutionOptions
): Promise<TData> {
  try {
    const mesh = await getMeshInstance()

    const document = typeof query === 'string' ? parse(query) : query

    const result = await execute({
      schema: mesh.schema,
      document,
      variableValues: options?.variables,
      operationName: options?.operationName,
      contextValue: {}
    })

    // Handle GraphQL errors
    if (result.errors && result.errors.length > 0) {
      const errorMessages = result.errors
        .map(err => err.message)
        .join('; ')

      throw new Error(`GraphQL query failed: ${errorMessages}`)
    }

    // Handle null/undefined data
    if (!result.data) {
      throw new Error('GraphQL query returned no data')
    }

    return result.data as TData
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[meshClient] Query execution failed:', message)
    throw error
  }
}

/**
 * Execute a batched set of queries (for performance)
 *
 * @param queries - Array of { query, variables } tuples
 * @returns Array of results in same order
 *
 * @example
 * const [products, categories] = await executeBatch<[ProductsQuery, CategoriesQuery]>([
 *   { query: productsQuery, variables: { limit: 10 } },
 *   { query: categoriesQuery, variables: { limit: 5 } }
 * ])
 */
export async function executeBatch<TData extends any[] = any[]>(
  queries: Array<{ query: string | DocumentNode; variables?: Record<string, any> }>
): Promise<TData> {
  const results = await Promise.all(
    queries.map(q =>
      executeQuery(q.query, { variables: q.variables }).catch(err => {
        console.error('[meshClient] Batch query failed:', err.message)
        throw err
      })
    )
  )

  return results as TData
}
