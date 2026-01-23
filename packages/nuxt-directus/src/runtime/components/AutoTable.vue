<script setup lang="ts">
  import {
    ref,
    onMounted
  } from 'vue';
  import {
    generateTableSchema, useVueDirectus, fetchTableRows
  } from '@meeovi/directus-client';

  const props = defineProps < {
    collection: string;
  } > ();

  const directus = useVueDirectus();
  const loading = ref(true);
  const rows = ref < any[] > ([]);
  const columns = ref < any[] > ([]);

  onMounted(async () => {
    const fields = await directus.request(directus.readFieldsByCollection(props.collection));
    columns.value = generateTableSchema(fields);
    rows.value = await fetchTableRows(directus, props.collection);
    loading.value = false;
  });

</script>

<template>
  <div v-if="loading">Loading table…</div>

  <table v-else class="auto-table">
    <thead>
      <tr>
        <th v-for="col in columns" :key="col.key">
          {{ col.label }}
        </th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="row in rows" :key="row.id">
        <td v-for="col in columns" :key="col.key">
          {{ row[col.key] }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
