<template>
  <v-row justify="center">
      <v-card>
          <h4>Create New Note</h4>
          <div v-if="formError" class="error">{{ formError }}</div>
          <div v-else-if="formSuccess" class="success">{{ formSuccess }}</div>

          <div v-if="postFields.length === 0" class="text-medium-emphasis">
            Post fields are not available yet.
          </div>

          <JsonSchemaFormFromFields
            v-else
            :fields="postFields"
            :model-value="form"
            @update:model-value="Object.assign(form, $event)"
            @submit="submitForm"
          />
      </v-card>
  </v-row>
</template>

<script setup>
import { ref } from 'vue'
import JsonSchemaFormFromFields from '#shared/app/components/ui/forms/JsonSchemaFormFromFields.vue'
import useDynamicSchema from '#shared/app/composables/content/useDynamicSchema'
import { useContentForm } from '../../../composables/useContentForm'
const dialog = ref(false)
const { fields: schemaFields, error: schemaError, loadSchema } = useDynamicSchema()
await loadSchema('posts')

if (schemaError.value) {
  console.error(schemaError.value)
}

const postFields = computed(() => (Array.isArray(schemaFields.value) ? schemaFields.value : []))

// use composable for form handling (validation, submit, provide context)
const { form, formError, formSuccess, submitForm } = useContentForm('posts', postFields, { clearOnSuccess: true, closeDialogRef: dialog })
</script>