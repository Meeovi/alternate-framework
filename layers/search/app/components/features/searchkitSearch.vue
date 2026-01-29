<template>
  <div class="searchkit-search">
    <div class="controls">
      <SearchInput v-model="query" @search="onSearch" />
      <autocomplete @input="onInput" @select="onSelect" />

      <label>
        <select v-model="ranking" @change="onRankingChange">
          <option value="relevance">Relevance</option>
          <option value="newest">Newest</option>
          <option value="popularity">Popularity</option>
        </select>
      </label>

      <label>
        Semantic:
        <input type="checkbox" v-model="semanticEnabled" @change="toggleSemantic" />
      </label>

      <label>
        Per page:
        <select v-model.number="perPage" @change="onPerPage">
          <option :value="12">12</option>
          <option :value="24">24</option>
          <option :value="48">48</option>
        </select>
      </label>
    </div>

    <div class="filters">
      <div v-for="(agg, key) in facets" :key="key" class="facet">
        <strong>{{ key }}</strong>
        <ul>
          <li v-for="(b, idx) in bucketsFor(agg)" :key="idx">{{ b.key }} ({{ b.doc_count }})</li>
        </ul>
      </div>
    </div>

    <ResultList :hits="hits" :loading="loading">
      <template #item="{ hit }">
        <div>
          <h3>{{ hit.title || hit.name }}</h3>
          <p v-if="hit.description">{{ hit.description }}</p>
          <small v-if="hit.location">{{ hit.location.lat }}, {{ hit.location.lon }}</small>
        </div>
      </template>
    </ResultList>

    <pagination :page="page" :totalPages="totalPages" @change="onPageChange" />
  </div>
</template>

<script setup lang="ts">
import { watch, computed } from 'vue'
import useSearchkit from '../../composables/useSearchkit'
import SearchInput from '../molecules/SearchInput.vue'
import autocomplete from './autocomplete.vue'
import ResultList from '../molecules/resultList.vue'
import pagination from '../molecules/pagination.vue'

const { query, hits, loading, page, perPage, facets, totalPages, search, setPage, setPerPage, setSemantic, ranking } = useSearchkit()

const semanticEnabled = computed({ get: () => false, set: (v: boolean) => setSemantic(v) })

function onSearch() {
  page.value = 1
  return search()
}

function onInput(val: string) {
  query.value = val
}

function onSelect(item: any) {
  // if suggestion contains a query text or id, perform targeted search
  query.value = item.query || item.title || item.name || query.value
  search()
}

function onPageChange(p: number) {
  return setPage(p)
}

function onPerPage(e: any) {
  return setPerPage(parseInt(e.target.value || '12', 10))
}

function toggleSemantic(e: Event) {
  const target = e.target as HTMLInputElement
  return setSemantic(target.checked)
}

function onRankingChange(e: Event) {
  const target = e.target as HTMLSelectElement
  ranking.value = target.value as any
  return search()
}

function bucketsFor(agg: any) {
  return (agg && (agg.buckets || agg.terms || agg)) || []
}

// initialize
search()

watch(query, () => {
  // do not auto-search on every keystroke by default; controlled via SearchInput
})
</script>

<style scoped>
.controls { display:flex; gap:12px; align-items:center; flex-wrap:wrap }
.filters { margin-top:12px; display:flex; gap:16px }
.facet { background:#fafafa; padding:8px; border:1px solid #eee }
</style>
