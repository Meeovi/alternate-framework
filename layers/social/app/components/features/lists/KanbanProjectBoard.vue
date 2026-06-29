<template>
  <v-container fluid>
    <v-row>
      <v-col
        v-for="column in columns"
        :key="column.key"
        cols="12" md="4"
      >
        <v-card>
          <v-card-title>{{ column.label }}</v-card-title>
          <ExperienceBuilder
            :items="column.items"
            :config="builderConfig"
            @update="payload => onUpdate(column.key, payload)"
          />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useLists } from '@/layers/social/composables/useLists'

const props = defineProps({
  listId: { type: [String, Number], required: true }
})

const { listLists, updateListItem } = useLists()
const allItems = ref<any[]>([])

onMounted(async () => {
  // assume list_items filtered by listId
  allItems.value = await (useNuxtApp() as any).$sdk.content.readItems('list_items', {
    filter: { listId: { _eq: props.listId } },
    sort: ['sort']
  }) || []
})

const columns = computed(() => [
  {
    key: 'todo',
    label: 'To Do',
    items: allItems.value.filter(i => i.status === 'todo')
  },
  {
    key: 'doing',
    label: 'In Progress',
    items: allItems.value.filter(i => i.status === 'doing')
  },
  {
    key: 'done',
    label: 'Done',
    items: allItems.value.filter(i => i.status === 'done')
  }
])

const builderConfig = {
  draggable: true,
  droppable: true
}

const onUpdate = async (columnKey: string, { type, payload }: any) => {
  if (type === 'move') {
    await updateListItem(payload.itemId, { status: columnKey })
  }
}
</script>
