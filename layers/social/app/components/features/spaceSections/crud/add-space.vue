<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" :scrim="false" transition="dialog-bottom-transition">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" class="rightAddBtn">
          <v-icon start icon="fas fa-plus"></v-icon>Create a Space
        </v-btn>
      </template>
      <v-card class="b-1">
        <v-card-title>
          <h3>Create New Space</h3>
        </v-card-title>

        <v-card-text>
          <div v-if="formError" class="error">{{ formError }}</div>
          <div v-else-if="formSuccess" class="success">{{ formSuccess }}</div>
          <JsonSchemaFormFromFields
            :fields="spaceFields"
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
import useContent from '#shared/app/composables/content/useContent'
import { useContentForm } from '../../../composables/useContentForm'

const dialog = ref(false)
 const { readFieldsByCollection } = useContent()

const { data, error } = await useAsyncData('space-schema-fields', async () => {
  const resp = await readFieldsByCollection('spaces')
  return resp?.data || resp || []
})

// guard against undefined/null data.value and empty arrays
if (error.value || data.value == null || (data.value?.length ?? 0) === 0) {
  console.error(error)
  throw createError({
    statusCode: 404,
    statusMessage: 'Space not found'
  })
}

const spaceFields = data

// use composable for form handling (validation, submit, provide context)
const { form, formError, formSuccess, submitForm } = useContentForm('spaces', spaceFields, { clearOnSuccess: true, closeDialogRef: dialog })
</script>