<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" :scrim="false" transition="dialog-bottom-transition">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" class="rightAddBtn">
          <v-icon start icon="fas:fa fa-plus"></v-icon>Create a Brand
        </v-btn>
      </template>
      <v-card class="b-1">
        <v-card-title>
          <h3>Create New Brand</h3>
        </v-card-title>

        <v-card-text>
          <div v-if="formError" class="error">{{ formError }}</div>
          <div v-else-if="formSuccess" class="success">{{ formSuccess }}</div>
          <form @submit.prevent="submitForm">
            <DirectusFormElement v-for="field in brandFields" :key="field.field" :field="field" v-model="form[field.field]" />
            <v-btn type="submit">Submit</v-btn>
          </form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>

</template>

<script setup>
import { ref } from 'vue'
import DirectusFormElement from '#shared/app/components/ui/forms/DirectusFormElement.vue'
import { useDirectusForm } from '#shared/app/composables/globals/useDirectusForm'

const dialog = ref(false)
const { $directus, $readFieldsByCollection } = useNuxtApp()

const { data, error } = await useAsyncData('brands', async () => {
  return $directus.request($readFieldsByCollection('brands'))
})

// guard against undefined/null data.value and empty arrays
if (error.value || data.value == null || (data.value?.length ?? 0) === 0) {
  console.error(error)
  throw createError({
    statusCode: 404,
    statusMessage: 'Brand not found'
  })
}

const brandFields = data


// use composable for form handling (validation, submit, provide context)
const { form, formError, formSuccess, submitForm } = useDirectusForm('brands', brandFields, { clearOnSuccess: true, closeDialogRef: dialog })
</script>