<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" :scrim="false" transition="dialog-bottom-transition">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" class="rightAddBtn">
          <v-icon start icon="fas fa-plus"></v-icon>Create a List
        </v-btn>
      </template>
      <v-card class="b-1">
        <template>
          <h3>Create New List</h3>
        </template>

        <template>
          <div v-if="formError" class="error">{{ formError }}</div>
          <div v-else-if="formSuccess" class="success">{{ formSuccess }}</div>
          <JsonSchemaFormFromFields
            :fields="listFields"
            :model-value="form"
            @update:model-value="Object.assign(form, $event)"
            @submit="submitForm"
          />
        </template>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup>
import { ref, computed } from '#imports'
import useContent from '#shared/app/composables/content/useContent'
import JsonSchemaFormFromFields from '#shared/app/components/ui/forms/JsonSchemaFormFromFields.vue'
import { useContentForm } from '../../../composables/useContentForm'

const dialog = ref(false)
const content = useContent()

const { data, error } = await useAsyncData('listsFields', async () => {
  return await content.readFieldsByCollection('lists')
})

// normalize response: providers may return { data: [...] } or an array directly
const listFields = computed(() => {
  const resp = data?.value
  return resp?.data ?? resp ?? []
})

// guard against undefined/null and empty arrays
if (error.value || listFields.value == null || listFields.value.length === 0) {
  console.error(error)
  throw createError({
    statusCode: 404,
    statusMessage: 'List not found'
  })
}


// use composable for form handling (validation, submit, provide context)
const { form, formError, formSuccess, submitForm } = useContentForm('lists', listFields, { clearOnSuccess: true, closeDialogRef: dialog })
</script>
