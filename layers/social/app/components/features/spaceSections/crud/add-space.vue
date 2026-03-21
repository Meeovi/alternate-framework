<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" :scrim="false" transition="dialog-bottom-transition">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" class="rightAddBtn">
          <v-icon start icon="fas:fa fa-plus"></v-icon>Create a Space
        </v-btn>
      </template>
      <v-card class="b-1">
        <template #header>
          <h3>Create New Space</h3>
        </template>

        <template #header>
          <div v-if="formError" class="error">{{ formError }}</div>
          <div v-else-if="formSuccess" class="success">{{ formSuccess }}</div>
          <v-form @submit.prevent="submitForm">
            <DirectusFormElement v-for="field in spaceFields" :key="field.field" :field="field" v-model="form[field.field]" />
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
import { useDirectusForm } from '#shared/app/composables/globals/useDirectusForm'

const dialog = ref(false)
import useAdapterRequest from '~/composables/useAdapterRequest'
const { readFieldsByCollection } = useAdapterRequest()

const { data, error } = await useAsyncData('spaces', async () => {
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
const { form, formError, formSuccess, submitForm } = useDirectusForm('spaces', spaceFields, { clearOnSuccess: true, closeDialogRef: dialog })
</script>