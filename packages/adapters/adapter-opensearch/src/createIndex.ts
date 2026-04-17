import { client } from './client'

type Doc = Record<string, unknown>

const DEFAULT_INDEX = process.env.ALTERNATE_SEARCH_INDEX || 'movies'

function printResponse(title: string, res: any) {
  console.log(`\n${title}:`)
  try {
    console.log(JSON.stringify(res.body || res, null, 2))
  } catch (e) {
    console.log(res)
  }
}

function handleErrorResponse(error: any) {
  if (error?.meta && error.meta.body) {
    console.error('Error:', error.meta.body.error)
  } else if (error?.message) {
    console.error('Error:', error.message)
  } else {
    console.error(error)
  }
}

export async function createIndex(indexName: string = DEFAULT_INDEX, settings?: any) {
  try {
    const exists = await client.indices.exists({ index: indexName })
    const existsFlag = (exists && (exists.statusCode === 200 || exists.body === true))
    if (existsFlag) {
      printResponse(`Index ${indexName} already exists`, exists)
      return exists
    }

    const body = settings || {
      settings: {
        index: {
          number_of_shards: 1,
          number_of_replicas: 1
        }
      }
    }

    const resp = await client.indices.create({ index: indexName, body })
    printResponse(`Created index ${indexName}`, resp)
    return resp
  } catch (err) {
    handleErrorResponse(err)
    throw err
  }
}

export async function indexDocuments(indexName: string = DEFAULT_INDEX, docs: Doc[] = []) {
  try {
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i]
      await client.index({ index: indexName, id: (doc as any).id ?? undefined, body: doc })
    }
    await client.indices.refresh({ index: indexName })
    printResponse(`Indexed ${docs.length} documents into ${indexName}`, { count: docs.length })
  } catch (err) {
    handleErrorResponse(err)
    throw err
  }
}

export async function searchIndex(indexName: string = DEFAULT_INDEX, query: any = { query: { match_all: {} } }) {
  try {
    const response = await client.search({ index: indexName, body: query })
    printResponse(`Search results for ${indexName}`, response)
    return response
  } catch (err) {
    handleErrorResponse(err)
    throw err
  }
}

export async function refreshIndex(indexName: string = DEFAULT_INDEX) {
  try {
    const response = await client.indices.refresh({ index: indexName })
    printResponse(`Refresh response for index ${indexName}`, response)
    return response
  } catch (err) {
    handleErrorResponse(err)
    throw err
  }
}

export async function deleteIndex(indexName: string = DEFAULT_INDEX) {
  try {
    const response = await client.indices.delete({ index: indexName })
    printResponse(`Delete response for index ${indexName}`, response)
    return response
  } catch (err) {
    handleErrorResponse(err)
    throw err
  }
}

// Convenience CLI-style entrypoint
export async function start(indexName?: string) {
  const idx = indexName || DEFAULT_INDEX
  try {
    await createIndex(idx)

    const sample = [
      { id: '1', title: 'The Dark Knight', director: 'Christopher Nolan', year: 2008 },
      { id: '2', title: 'The Godfather', director: 'Francis Ford Coppola', year: 1972 },
      { id: '3', title: 'The Shawshank Redemption', director: 'Frank Darabont', year: 1994 }
    ]

    await indexDocuments(idx, sample)

    await refreshIndex(idx)

    await searchIndex(idx, { query: { match: { title: 'dark' } } })

    // optional: delete index (comment out if you want to keep)
    // await deleteIndex(idx)
  } catch (err) {
    handleErrorResponse(err)
  }
}

// If invoked directly from node, allow passing index name via CLI.
// Guard CommonJS globals so ESM importers (Nuxt/Vite SSR) do not crash.
if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  const argv = process.argv.slice(2)
  const idx = argv[0]
  start(idx).catch((err) => {
    handleErrorResponse(err)
    process.exitCode = 1
  })
}