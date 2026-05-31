<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" :scrim="false" transition="dialog-bottom-transition">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" class="rightAddBtn">
          <v-icon start icon="fas fa-plus"></v-icon>Create a Bookmark
        </v-btn>
      </template>
      <v-card class="b-1">
        <v-toolbar>
          <h3>Create New Bookmark</h3>
        </v-toolbar>

        <div>
          <div v-if="formError" class="error">{{ formError }}</div>
          <div v-else-if="formSuccess" class="success">{{ formSuccess }}</div>
          <JsonSchemaFormFromFields
            :fields="websiteFields"
            :model-value="form"
            @update:model-value="Object.assign(form, $event)"
            @submit="submitForm"
          />
        </div>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup>
import { ref } from '#imports'
import useContent from '#shared/app/composables/content/useContent'
import JsonSchemaFormFromFields from '#shared/app/components/ui/forms/JsonSchemaFormFromFields.vue'
import { useContentForm } from '../../../composables/useContentForm'

const dialog = ref(false)
const content = useContent()

const { data, error } = await useAsyncData('websites', async () => {
  return await content.readFieldsByCollection('websites')
})

// guard against undefined/null data.value and empty arrays
if (error.value || data.value == null || (data.value?.length ?? 0) === 0) {
  console.error(error)
  throw createError({
    statusCode: 404,
    statusMessage: 'Bookmark not found'
  })
}

const websiteFields = data

// use composable for form handling (validation, submit, provide context)
const { form, formError, formSuccess, submitForm } = useContentForm('websites', websiteFields, { clearOnSuccess: true, closeDialogRef: dialog })
</script>
