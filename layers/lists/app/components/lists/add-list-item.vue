<template>
    <div>
        <div v-if="list?.items?.length === 0" class="text-center py-8">
            <v-icon size="64" color="grey-lighten-1">{{ getListIcon(list?.type) }}</v-icon>
            <h3 class="text-h6 mt-4 mb-2">No items yet</h3>
            <p class="text-body-2 text-medium-emphasis mb-4">
                Add your first item to get started
            </p>
            <v-btn color="primary" @click="showAddDialog = true">
                Add Item
            </v-btn>
        </div>

        <div v-else>
            <!-- Task Items -->
            <div v-if="list?.type === 'tasks'">
                <TaskItem v-for="item in list?.items" :key="item?.id" :task="item?.content"
                    @update="updateTask(item?.id, $event)" @edit="editItem(item)" @duplicate="duplicateItem(item)"
                    @delete="deleteItem(item?.id)" />
            </div>

            <!-- Other List Types -->
            <v-row v-else>
                <v-col v-for="item in list?.items" :key="item?.id" cols="12" sm="6" md="4" lg="3">
                    <ListItemCard :item="item" :list-type="list?.type" @edit="editItem(item)"
                        @delete="deleteItem(item?.id)" />
                </v-col>
            </v-row>
        </div>
    </div>
</template>

<script setup>
  import {
    ref,
    computed
  } from 'vue'
  //import DirectusFormElement from '#shared/app/components/ui/forms/DirectusFormElement.vue'
  import {
    useDirectusForm
  } from '../../composables/globals/useDirectusForm'
  import ListItemCard from './ListItemCard.vue'

  const props = defineProps({
    modelValue: Boolean,
    listType: String,
    listId: String
  })

  const dialog = ref(false)
  const {
    $directus,
    $readFieldsByCollection
  } = useNuxtApp()

  const {
    data,
    error
  } = await useAsyncData('listItemsFields', async () => {
    return $directus.request($readFieldsByCollection('list_items'))
  })

  // normalize response: Directus may return { data: [...] } or an array directly
  const listItemFields = computed(() => {
    const resp = data?.value
    return resp?.data ?? resp ?? []
  })

  // guard against undefined/null and empty arrays
  if (error.value || listItemFields.value == null || listItemFields.value.length === 0) {
    console.error(error)
    throw createError({
      statusCode: 404,
      statusMessage: 'List not found'
    })
  }

  // use composable for form handling (validation, submit, provide context)
  const {
    form,
    formError,
    formSuccess,
    submitForm
  } = useDirectusForm('list_items', listItemFields, {
    clearOnSuccess: true,
    closeDialogRef: dialog
  })
</script>