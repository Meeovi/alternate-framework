<template>
  <v-sheet class="pa-4">
    <v-toolbar flat>
      <v-toolbar-title>Shopping</v-toolbar-title>
    </v-toolbar>

    <v-text-field
      v-model="newItem"
      label="Add item"
      @keyup.enter="add"
    />

    <v-list>
      <v-list-item
        v-for="item in items"
        :key="item.id"
      >
        <v-checkbox v-model="item.completed" />
        <v-list-item-title>{{ item.title }}</v-list-item-title>
        <v-text-field
          v-model="item.quantity"
          type="number"
          style="max-width: 80px"
          @change="update(item)"
        />
      </v-list-item>
    </v-list>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLists } from '../../../composables/lists/useLists'

const items = ref<any[]>([])
const newItem = ref('')

const { addItem, updateListItem } = useLists()
const listId = /* shopping list id */ 'shopping'

onMounted(async () => {
  const { $sdk } = useNuxtApp() as any
  items.value = await $sdk.content.readItems('list_items', {
    filter: { listId: { _eq: listId } },
    sort: ['sort']
  }) || []
})

const add = async () => {
  if (!newItem.value.trim()) return
  const created = await addItem({
    listId,
    title: newItem.value,
    quantity: 1
  })
  items.value.push(created)
  newItem.value = ''
}

const update = async (item: any) => {
  await updateListItem(item.id, { quantity: item.quantity })
}
</script>
