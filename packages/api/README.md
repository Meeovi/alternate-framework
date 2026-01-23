
---

# 📦 `@meeovi/api` — README.md

```md
# @meeovi/api

A dynamic, backend‑agnostic API SDK for Meeovi.  
Supports GraphQL, REST, RPC, and custom transports via a pluggable fetcher system.

## ✨ Features

- Dynamic fetcher architecture  
- GraphQL + REST loaders (auto‑import queries/mutations/endpoints)  
- Namespaced operation registry  
- Runtime‑switchable transports  
- Nuxt module for auto‑initialization  
- Provider integration for other Meeovi modules  

## 📦 Installation

```sh
npm install @meeovi/api

⚙️ Setup

import { createApolloClient, setFetcher } from '@meeovi/api'
import { GraphQLFetcher } from '@meeovi/api'

createApolloClient('https://api.meeovi.com/graphql')
setFetcher(GraphQLFetcher)

🧩 Usage

import { fetcher, getQuery } from '@meeovi/api'

const GET_PRODUCT = getQuery('products.GET_PRODUCT')

const { data } = await fetcher(GET_PRODUCT, { id: '123' })
🔌 Fetchers

export interface Fetcher {
  execute(req: FetcherRequest): Promise<FetcherResponse>
}
Register:

registerFetcher('rest', RestFetcher)
setActiveFetcher('rest')
🧱 Folder Structure
Code
src/
  client/
  fetcher/
  loader/
  graphql/
  rest/
  providers/
  utils/