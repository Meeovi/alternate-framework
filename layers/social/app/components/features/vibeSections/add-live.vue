<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" :scrim="false" transition="dialog-bottom-transition">
      <v-card class="b-1">
        <template>
          <h3>Create New Vibe</h3>
        </template>

        <template #default>
          <div v-if="formError" class="error">{{ formError }}</div>
          <div v-else-if="formSuccess" class="success">{{ formSuccess }}</div>
          <v-form @submit.prevent="submitForm">
            <DirectusFormElement v-for="field in shortFields" :key="field.field" :field="field" v-model="form[field.field]" />
            <v-btn type="submit">Create</v-btn>
          </v-form>
        </template>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup>
import { ref } from '#imports'
import DirectusFormElement from '#shared/app/components/ui/forms/DirectusFormElement.vue'
import { useDirectusForm } from '@mframework/adapter-directus'
import useAdapterRequest from '#social/app/composables/core/useAdapterRequest'

const dialog = ref(false)
const { readFieldsByCollection } = useAdapterRequest()

const { data, error } = await useAsyncData('shorts', async () => {
  const resp = await readFieldsByCollection('shorts')
  return resp?.data || resp || []
})

// guard against undefined/null data.value and empty arrays
if (error.value || data.value == null || (data.value?.length ?? 0) === 0) {
  console.error(error)
  throw createError({
    statusCode: 404,
    statusMessage: 'Vibe not found'
  })
}

const shortFields = data

// use composable for form handling (validation, submit, provide context)
const { form, formError, formSuccess, submitForm } = useDirectusForm('shorts', shortFields, { clearOnSuccess: true, closeDialogRef: dialog })
</script>