<template>
  <v-row justify="center">
      <v-card>
        <v-card-title>
          <h4>Create New Note</h4>
        </v-card-title>

        <v-card-text>
          <div v-if="formError" class="error">{{ formError }}</div>
          <div v-else-if="formSuccess" class="success">{{ formSuccess }}</div>
          <form @submit.prevent="submitForm">
            <DirectusFormElement v-for="field in postFields" :key="field.field" :field="field" v-model="form[field.field]" />
            <v-btn type="submit">Post</v-btn>
          </form>
        </v-card-text>
      </v-card>
  </v-row>
</template>

<script setup>
import { ref } from 'vue'
import DirectusFormElement from '#shared/app/components/ui/forms/DirectusFormElement.vue'
import { useDirectusForm } from '#shared/app/composables/globals/useDirectusForm'

const dialog = ref(false)
const { $directus, $readFieldsByCollection } = useNuxtApp()

const { data, error } = await useAsyncData('posts', async () => {
  return $directus.request($readFieldsByCollection('posts'))
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