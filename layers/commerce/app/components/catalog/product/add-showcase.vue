<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" :scrim="false" transition="dialog-bottom-transition">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" class="rightAddBtn">
          <v-icon start icon="fas fa-plus"></v-icon>Create a Showcase
        </v-btn>
      </template>
      <v-card class="b-1">
        <template>
          <h3>Create New Showcase</h3>
        </template>

        <template>
          <div v-if="formError" class="error">{{ formError }}</div>
          <div v-else-if="formSuccess" class="success">{{ formSuccess }}</div>
          <v-form @submit.prevent="submitForm">
            <DataFormElement v-for="field in showcaseFields" :key="field.field" :field="field" v-model="form[field.field]" />
            <v-btn type="submit">Submit</v-btn>
          </v-form>
        </template>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup>
  import { ref } from '#imports'
import DataFormElement from '~/components/ui/forms/DataFormElement.vue'
import { useDataForm } from '~/composables/globals/useDataForm'

const dialog = ref(false)
const { $readFieldsByCollection } = useNuxtApp()

const { data, error } = await useAsyncData('showcases', async () => {
  return gateway.content($readFieldsByCollection('showcases'))
})

// guard against undefined/null data.value and empty arrays
if (error.value || data.value == null || (data.value?.length ?? 0) === 0) {
  console.error(error)
  throw createError({
    statusCode: 404,
    statusMessage: 'Showcase not found'
  })
}

const showcaseFields = data

// use composable for form handling (validation, submit, provide context)
const { form, formError, formSuccess, submitForm } = useDataForm('showcases', showcaseFields, { clearOnSuccess: true, closeDialogRef: dialog })
</script>