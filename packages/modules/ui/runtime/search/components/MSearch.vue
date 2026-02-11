<template>
  <ais-instant-search :search-client="client" :index-name="index">
    <ais-search-box />
    <ais-hits>
      <template #item="{ item }">
        <slot name="hit" :item="item">
          <div class="p-2 border rounded">
            <ais-highlight attribute="title" :hit="item" />
          </div>
        </slot>
      </template>
    </ais-hits>
  </ais-instant-search>
</template>

<script setup lang="ts">
const client = inject('mSearchClient')
const index = inject('mSearchIndex')
</script>