<template>
  <div class="searchField">
    <div class="container">
      <ais-instant-search :search-client="searchClient" :index-name="indexName">
        <ais-configure :hits-per-page.camel="8" />
        <div class="search-panel">
          <div class="search-panel__filters">
            <ais-panel>
              <template v-slot:header>type</template>
              <ais-refinement-list attribute="type" />
            </ais-panel>

            <ais-panel>
              <template v-slot:header>actors</template>
              <ais-refinement-list searchable attribute="actors" />
            </ais-panel>
          </div>

          <div class="search-panel__results">
            <div class="searchbox">
              <ais-search-box placeholder="" />
              <v-text-field v-if="isDev" v-model="searchQuery" placeholder="Debug: search input" class="debug-search-input"></v-text-field>
            </div>
            <ais-hits>
              <template v-slot:item="{ item, index }">
                <article @click="openResult(item)" style="cursor:pointer">
                  <h1>
                    <ais-highlight attribute="title" :hit="item" />
                  </h1>
                  <p>
                    <ais-snippet :hit="item" attribute="plot" />
                  </p>
                </article>
              </template>
            </ais-hits>

            <div class="pagination">
              <ais-pagination />
            </div>
          </div>
        </div>
      </ais-instant-search>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { getSearchClient, getIndexName } from '../utils/search/client'

const router = useRouter()
const searchQuery = ref('')
const searchClient = getSearchClient()
const indexName = getIndexName()
const isDev = process.env.NODE_ENV !== 'production'

if (isDev) {
  console.debug('[search] searchClient', searchClient, 'has search method:', typeof searchClient?.search)
}

function openResult(item: any) {
  const id = item._id ?? item.id ?? ''
  const title = item.title ?? ''
  router.push({
    path: '/results',
    query: { id, title }
  })
}
</script>
