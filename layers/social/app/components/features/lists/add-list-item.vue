<template>
    <div>
        <v-row justify="center">
          <v-dialog v-model="dialog" :scrim="false" max-width="720" transition="dialog-bottom-transition">
                <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" color="primary" class="mb-4">
                        <v-icon start icon="fas fa-plus"></v-icon>Add Item
                    </v-btn>
                </template>
                <v-card class="b-1">
                    <v-card-title>Add List Item</v-card-title>
                    <v-card-text>
                        <div v-if="formError" class="error mb-4">{{ formError }}</div>
                        <div v-else-if="formSuccess" class="success mb-4">{{ formSuccess }}</div>
                <div v-else-if="pending" class="d-flex justify-center py-6">
                  <v-progress-circular indeterminate />
                </div>
                <div v-else-if="error" class="error mb-4">Failed to load list item form fields.</div>
                <div v-else-if="listItemFields.length === 0" class="error mb-4">No list item fields available.</div>
                        <JsonSchemaFormFromFields
                  v-else
                            :fields="listItemFields"
                            :model-value="form"
                            @update:model-value="Object.assign(form, $event)"
                            @submit="submitForm"
                        />
                    </v-card-text>
                </v-card>
            </v-dialog>
        </v-row>

        <div v-if="list?.items?.length === 0" class="text-center py-8">
            <v-icon size="64" color="grey-lighten-1">{{ getListIcon(list?.type) }}</v-icon>
            <h3 class="text-h6 mt-4 mb-2">No items yet</h3>
            <p class="text-body-2 text-medium-emphasis mb-4">
                Add your first item to get started
            </p>
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
    ref
  } from '#imports'

  import JsonSchemaFormFromFields from '#shared/app/components/ui/forms/JsonSchemaFormFromFields.vue'
  import {
    useContentForm
  } from '../../../composables/useContentForm'
  import ListItemCard from './ListItemCard.vue'

  const props = defineProps({
    modelValue: Boolean,
    listType: String,
    listId: String
  })

  const dialog = ref(false)
  const { $sdk } = useNuxtApp()

  const {
    data: listItemFields,
    error,
    pending
  } = await useAsyncData('listItemsFields', async () => {
    const resp = await $sdk.content.readFieldsByCollection('list_items')
    return Array.isArray(resp) ? resp : []
  })

  // use composable for form handling (validation, submit, provide context)
  const {
    form,
    formError,
    formSuccess,
    submitForm
  } = useContentForm('list_items', listItemFields, {
    clearOnSuccess: true,
    closeDialogRef: dialog
  })
</script>
