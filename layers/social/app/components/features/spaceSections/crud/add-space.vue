<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" :scrim="false" transition="dialog-bottom-transition">
      <template v-slot:activator="{ props }">
        <UButton v-bind="props" class="rightAddBtn">
          <UIcon start icon="fas:fa fa-plus"></UIcon>Create a Space
        </UButton>
      </template>
      <UCard class="b-1">
        <template #header>
          <h3>Create New Space</h3>
        </template>

        <template #header>
          <div v-if="formError" class="error">{{ formError }}</div>
          <div v-else-if="formSuccess" class="success">{{ formSuccess }}</div>
          <UForm @submit.prevent="submitForm">
            <DirectusFormElement v-for="field in spaceFields" :key="field.field" :field="field" v-model="form[field.field]" />
            <UButton type="submit">Create</UButton>
          </UForm>
        </template>
      </UCard>
    </v-dialog>
  </v-row>
</template>

<script setup>
import { ref } from 'vue'
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