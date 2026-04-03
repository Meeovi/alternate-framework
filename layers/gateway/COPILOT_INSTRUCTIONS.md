🔍 Better Search — Framework & Backend Agnostic Search Layer
A modular, adapter‑driven, plugin‑driven search framework designed to integrate directly into an application’s domain layer.
Inspired by the architectural principles of Better Auth.

This document defines the folder structure, core responsibilities, interfaces, and expected behaviour so that VS Code Copilot can scaffold the entire system.

📁 Folder Structure
Code
/alternate-search
  /core
    search.ts
    pipeline.ts
    index-manager.ts
    query-engine.ts
    tokenizer.ts
    ranker.ts
    vectorizer.ts
    types.ts
    errors.ts

  /adapters
    /meilisearch
      index.ts
      client.ts
      transforms.ts
    /typesense
      index.ts
      client.ts
    /elasticsearch
      index.ts
      client.ts
    /pgvector
      index.ts
      queries.sql
    /memory
      index.ts

  /plugins
    /semantic
      index.ts
      embedder.ts
      reranker.ts
    /autocomplete
      index.ts
    /synonyms
      index.ts
    /spellcheck
      index.ts
    /permissions
      index.ts
    /multitenancy
      index.ts

  /schema
    indexes.ts
    fields.ts

  /client
    index.ts
    http-client.ts
    types.ts

  /utils
    logger.ts
    config.ts
    deep-merge.ts

search.config.ts
🧩 Core Concepts
1. Core Layer (/core)
The core is backend‑agnostic and contains the unified search API.

search.ts
Creates the search instance:

ts
export function createSearch(config) {
  return {
    index: (...args) => {},
    query: (...args) => {},
    delete: (...args) => {},
    setup: () => {}
  }
}
pipeline.ts
Defines the search pipeline:

Code
tokenize → vectorize → adapter.query → rank → rerank → format
index-manager.ts
Handles:

creating indexes

syncing schemas

batch indexing

document updates

query-engine.ts
Normalizes queries and orchestrates the pipeline.

2. Adapters (/adapters)
Each adapter implements a unified interface:

ts
export interface SearchAdapter {
  setup(): Promise<void>
  index(indexName: string, docs: any[]): Promise<void>
  query(indexName: string, query: any, options: any): Promise<any>
  delete(indexName: string, id: string): Promise<void>
}
Adapters include:

Meilisearch

Typesense

Elasticsearch

Postgres pgvector

SQLite FTS5

In‑memory

3. Plugins (/plugins)
Plugins hook into the pipeline:

ts
export interface SearchPlugin {
  beforeQuery?(ctx): Promise<void> | void
  afterQuery?(ctx): Promise<void> | void
  beforeIndex?(ctx): Promise<void> | void
  afterIndex?(ctx): Promise<void> | void
}
Examples:

semantic search

autocomplete

synonyms

spellcheck

permissions

multi‑tenant search

4. Schema (/schema)
Declarative index definitions.

indexes.ts
ts
export const indexes = {
  products: {
    fields: ["title", "description", "tags"],
    vectorize: true
  },
  posts: {
    fields: ["title", "body"],
    vectorize: false
  }
}
5. Client SDK (/client)
Framework‑agnostic client for browser/server.

ts
export function createSearchClient({ endpoint }) {
  return {
    query: async (q, opts) => fetch(endpoint, { method: "POST", body: JSON.stringify({ q, opts }) })
  }
}
6. Entry File (search.config.ts)
This is the file the main app imports.

ts
import { createSearch } from "./search/core/search"
import { pgvectorAdapter } from "./search/adapters/pgvector"
import { indexes } from "./search/schema/indexes"
import { semanticSearch, autocomplete } from "./search/plugins"

export const search = createSearch({
  adapter: pgvectorAdapter({ connectionString: process.env.DB_URL }),
  indexes,
  plugins: [
    semanticSearch({ provider: "openai" }),
    autocomplete()
  ]
})
🧱 Integration Philosophy
This search layer is not a standalone service.
It is designed to be merged directly into the main application as a domain module.

The app imports it like:

ts
import { search } from "@/search.config"
And uses it in:

API routes

server actions

background jobs

RAG pipelines

admin dashboards

No microservices.
No separate infra.
Just a clean, modular search domain.

🚀 Implementation Notes for Copilot
All modules must be framework‑agnostic.

No direct dependencies on Next.js, Express, etc.

Adapters must be isolated and optional.

Plugins must be composable and hook‑based.

The pipeline must be fully extensible.

The entire system must be tree‑shakeable.

The search instance must be a pure function with no global state.