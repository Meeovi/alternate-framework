# adapter-directus

A deeply integrated, zero-overhead data adapter for Directus. This package utilizes **GraphQL Mesh (v1)** and **GraphQL Codegen** to automatically compose, namespace, and strictly type your entire Directus collection schema at compile time. 

It acts as the canonical domain layer for our frontend applications, providing complete type safety, inline autocomplete, and payload normalization.

## Features

- 🔄 **Fully Automated Schema Mapping:** Compiles your entire Directus instance down to a single typed contract.
- 🪄 **Dynamic Intellisense:** Auto-suggests collection names and strictly validates requested fields without manual typing overhead.
- 🗜️ **Prefix Stripping:** Transparently manages and discards required GraphQL Mesh routing prefixes (`CMS_`), delivering pure shapes directly to your frontend app.
- 🎛️ **Type-Safe Document Escape Hatch:** Includes a `.query()` runtime configuration for highly customized relational operations.

---

## Architecture Overview

Instead of maintaining brittle, hand-written TypeScript interfaces for hundreds of Directus database tables, this adapter pulls live introspection schemas directly from your designated environment endpoint.

1. **`mesh-compose`** fetches the Directus GraphQL schema and applies isolation transforms.
2. **`graphql-codegen`** converts that compiled schema into a comprehensive flat TypeScript file (`schema-types.ts`).
3. **`DirectusAdapter`** leverages template-literal mapping to provide dynamic code completions based *only* on what exists in your database.

---

## Step-by-Step Getting Started

Follow these steps to integrate or sync this adapter with a frontend website or a new Directus instance.

### 1. Prerequisites & Environment Setup
Ensure your local development environment or your targeted frontend layer contains a valid configuration file. Create or update your `.env` file in your frontend root directory:

```env
DIRECTUS_GRAPHQL="[https://your-directus-instance.com/graphql](https://your-directus-instance.com/graphql)"

### 2. Add Dependencies (Workspace Root)
Make sure your workspace root includes dotenv-cli to handle cross-package environment injection:

Bash
npm install -D dotenv-cli

### 3. Configure Frontend Sync Scripts
Add an automated synchronization script to your frontend application's package.json file. This tells the workspace to load your local credentials, jump into the adapter directory, and rebuild the type definitions:

JSON
{
  "name": "your-frontend-site",
  "scripts": {
    "adapter:sync": "dotenv -- npm run --prefix ../../packages/adapters/adapter-directus mesh:build"
  }
}
(Note: Adjust the relative path ../../packages/adapters/adapter-directus to match your specific monorepo directory layout).

### 4. Fetch Schema & Generate Types
From the root of your frontend application, execute the sync command. This will contact your custom Directus endpoint, compose the gateway supergraph, and spit out the latest TypeScript compiler tokens.

Bash
npm run adapter:sync
Whenever you add collections or modify system fields inside the Directus App UI, simply re-run this command to refresh your definitions.

### Usage Guide

#### Initializing the SDK
Import and instantiate the class inside your framework plugin or utility file (e.g., a Nuxt 4 runtime plugin):

TypeScript
import { DirectusAdapter } from 'adapter-directus'

const config = useRuntimeConfig()

// Initialize pointing to your unified Hive Gateway / Local address
export const cms = new DirectusAdapter(config.public.gatewayUrl)

#### Fetching a Dynamic Collection
Pass the target collection name and an array of required tracking fields. You receive strict validation on your field values, structural query security, and clean runtime arrays.

TypeScript
// Autocomplete will show valid collections (e.g., 'articles', 'products')
// Passing 'titel' instead of 'title' will trigger a compile-time IDE error!
const articles = await cms.getCollection('articles', ['id', 'title', 'date_created'])

// 'articles' is automatically typed and parsed:
articles.forEach(item => {
  console.log(item.title) // Fully typed property
})
Complex Queries (Escape Hatch)
For deep nested relationships, filtration parameters, or complex data joins, pass raw GraphQL operation documents directly to the helper:

TypeScript
const customQuery = `
  query GetNestedData {
    CMS_authors {
      name
      CMS_articles_authored {
        title
      }
    }
  }
`

const data = await cms.query(customQuery)