<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" :scrim="false" transition="dialog-bottom-transition">
      <template v-slot:activator="{ props }">
        <UButton v-bind="props" class="rightAddBtn">
          <UIcon start icon="fas:fa fa-plus"></UIcon>Create a List
        </UButton>
      </template>
      <UCard class="b-1">
        <template #header>
          <h3>Create New List</h3>
        </template>

        <template #header>
          <div v-if="formError" class="error">{{ formError }}</div>
          <div v-else-if="formSuccess" class="success">{{ formSuccess }}</div>
          <UForm @submit.prevent="submitForm">
            <DirectusFormElement v-for="field in listFields" :key="field.field" :field="field" v-model="form[field.field]" />
            <UButton type="submit">Submit</UButton>
          </UForm>
        </template>
      </UCard>
    </v-dialog>
  </v-row>
</template>

<script setup>
import { ref, computed } from 'vue'
import DirectusFormElement from '#shared/app/components/ui/forms/DirectusFormElement.vue'
import { useDirectusForm } from '../../composables/globals/useDirectusForm'

const dialog = ref(false)
const content = useContentAdapter()

const { data, error } = await useAsyncData('listsFields', async () => {
  if (content && typeof content.readFieldsByCollection === 'function') {
    return await content.readFieldsByCollection('lists')
  }
  const { $directus, $readFieldsByCollection } = useNuxtApp()
  return $directus.request($readFieldsByCollection('lists'))
})

// normalize response: Directus may return { data: [...] } or an array directly
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
const { form, formError, formSuccess, submitForm } = useDirectusForm('lists', listFields, { clearOnSuccess: true, closeDialogRef: dialog })
</script>