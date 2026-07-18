// server/utils/opensearch.ts
import { Client } from '@opensearch-project/opensearch'
import fs from 'node:fs'
import path from 'node:path'
import { useRuntimeConfig } from '#imports'

let _client: Client | null = null

/**
 * Lazily instantiates and returns the OpenSearch Client using runtime config.
 */
export function useOpenSearchClient() {
  if (_client) return _client

  const config = useRuntimeConfig() as any
  
  const nodeUrl = `${config.opensearch.protocol}://${config.opensearch.auth}@${config.opensearch.host}:${config.opensearch.port}`
  const sslOptions: any = {}

  if (config.opensearch.caCertsPath) {
    // Resolves path relative to the current working directory of the running app
    const fullPath = path.resolve(process.cwd(), config.opensearch.caCertsPath)
    if (fs.existsSync(fullPath)) {
      sslOptions.ca = fs.readFileSync(fullPath)
    } else {
      console.warn(`[OpenSearch Layer] CA certificate not found at ${fullPath}`)
    }
  } else if (config.opensearch.protocol === 'https') {
    // For local dev with self-signed certs where you don't pass a CA root
    sslOptions.rejectUnauthorized = false
  }

  _client = new Client({
    node: nodeUrl,
    ssl: Object.keys(sslOptions).length ? sslOptions : undefined,
  })

  return _client
}

/**
 * Resolves the dynamic index name based on runtime configurations
 */
export function getOpenSearchIndexName() {
  const config = useRuntimeConfig() as any
  return `${config.opensearch.appName.toLowerCase()}`
}

/**
 * Dynamic Core Operations
 */
export async function createOpenSearchIndex(shards = 4, replicas = 3) {
  const client = useOpenSearchClient()
  const index = getOpenSearchIndexName()

  return await client.indices.create({
    index,
    body: {
      settings: {
        index: {
          number_of_shards: shards,
          number_of_replicas: replicas,
        },
      },
    },
  })
}

export async function indexOpenSearchDocument(id: string, document: Record<string, any>) {
  const client = useOpenSearchClient()
  const index = getOpenSearchIndexName()

  return await client.index({
    id,
    index,
    body: document,
    refresh: true,
  })
}

export async function searchOpenSearchIndex(searchQuery: string, fields: string[] = ['title'], page = 1, pageSize = 12) {
  const client = useOpenSearchClient()
  const index = getOpenSearchIndexName()

  const from = (page - 1) * pageSize

  const query = {
    query: {
      multi_match: {
        query: searchQuery,
        fields: fields
      },
    },
  }

  return await client.search({
    index,
    body: {
      ...query,
      from,
      size: pageSize,
    },
  })
}