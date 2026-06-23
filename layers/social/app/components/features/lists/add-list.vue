<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" :scrim="false" max-width="720" transition="dialog-bottom-transition">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" class="rightAddBtn">
          <v-icon start icon="fas fa-plus"></v-icon>Create a List
        </v-btn>
      </template>
      <v-card class="b-1">
        <v-card-title>
          <h3>Create New List</h3>
        </v-card-title>

        <v-card-text>
          <div v-if="formError" class="error">{{ formError }}</div>
          <div v-else-if="formSuccess" class="success">{{ formSuccess }}</div>
          <div v-else-if="pending" class="d-flex justify-center py-6">
            <v-progress-circular indeterminate />
          </div>
          <div v-else-if="error" class="error">Failed to load list form fields.</div>
          <div v-else-if="listFields.length === 0" class="error">No list fields available.</div>
          <JsonSchemaFormFromFields
            v-else
            :fields="listFields"
            :model-value="form"
            @update:model-value="Object.assign(form, $event)"
            @submit="submitForm"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup>
import { ref } from '#imports'

import JsonSchemaFormFromFields from '#shared/app/components/ui/forms/JsonSchemaFormFromFields.vue'
import { useContentForm } from '../../../composables/useContentForm'

const dialog = ref(false)
const { $sdk } = useNuxtApp()

const { data: listFields, error, pending } = await useAsyncData('listsFields', async () => {
  const resp = await $sdk.content.readFieldsByCollection('lists')
  return Array.isArray(resp) ? resp : []
})

// use composable for form handling (validation, submit, provide context)
const { form, formError, formSuccess, submitForm } = useContentForm('lists', listFields, { clearOnSuccess: true, closeDialogRef: dialog })
</script>
