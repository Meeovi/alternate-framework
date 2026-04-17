<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" :scrim="false" transition="dialog-bottom-transition">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" class="rightAddBtn">
          <v-icon start icon="fas:fa fa-plus"></v-icon>Create a List
        </v-btn>
      </template>
      <v-card class="b-1">
        <template #header>
          <h3>Create New List</h3>
        </template>

        <template>
          <div v-if="formError" class="error">{{ formError }}</div>
          <div v-else-if="formSuccess" class="success">{{ formSuccess }}</div>
          <v-form @submit.prevent="submitForm">
            <DirectusFormElement v-for="field in listFields" :key="field.field" :field="field" v-model="form[field.field]" />
            <v-btn type="submit">Submit</v-btn>
          </v-form>
        </template>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup>
import { ref, computed } from '#imports'
import DirectusFormElement from '#shared/app/components/ui/forms/DirectusFormElement.vue'
import { useDirectusForm } from '@mframework/adapter-directus'

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