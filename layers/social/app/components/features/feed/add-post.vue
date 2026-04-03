<template>
  <v-row justify="center">
      <v-card>
        <v-toolbar color="primary" dark>
          <h4>Create New Note</h4>
        </v-toolbar>

        <v-card>
          <div v-if="formError" class="error">{{ formError }}</div>
          <div v-else-if="formSuccess" class="success">{{ formSuccess }}</div>
          <v-form @submit.prevent="submitForm">
            <DirectusFormElement v-for="field in postFields" :key="field.field" :field="field" v-model="form[field.field]" />
            <v-btn type="submit">Post</v-btn>
          </v-form>
        </v-card>
      </v-card>
  </v-row>
</template>

<script setup>
import { ref } from '#imports'
import DirectusFormElement from '#shared/app/components/ui/forms/DirectusFormElement.vue'
import { useDirectusForm } from '#shared/app/composables/globals/useDirectusForm'
import useAdapterRequest from '#social/app/composables/core/useAdapterRequest'

const dialog = ref(false)
const { readFieldsByCollection } = useAdapterRequest()

const { data, error } = await useAsyncData('posts', async () => {
  const resp = await readFieldsByCollection('posts')
  return resp?.data || resp || []
})

// guard against undefined/null data.value and empty arrays
if (error.value || data.value == null || (data.value?.length ?? 0) === 0) {
  console.error(error)
  throw createError({
    statusCode: 404,
    statusMessage: 'Note not found'
  })
}

const postFields = data

// use composable for form handling (validation, submit, provide context)
const { form, formError, formSuccess, submitForm } = useDirectusForm('posts', postFields, { clearOnSuccess: true, closeDialogRef: dialog })
</script>