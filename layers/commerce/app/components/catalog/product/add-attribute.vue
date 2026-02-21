<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" :scrim="false" transition="dialog-bottom-transition">
      <template v-slot:activator="{ props }">
        <UButton v-bind="props" class="rightAddBtn">
          <UIcon start icon="fas:fa fa-plus"></UIcon>Create a Attribute
        </UButton>
      </template>
      <UCard class="b-1">
        <template #header>
          <h3>Create New Attribute</h3>
        </template>

        <template #header>
          <div v-if="formError" class="error">{{ formError }}</div>
          <div v-else-if="formSuccess" class="success">{{ formSuccess }}</div>
          <UForm @submit.prevent="submitForm">
            <DirectusFormElement v-for="field in attributeFields" :key="field.field" :field="field" v-model="form[field.field]" />
            <UButton type="submit">Submit</UButton>
          </UForm>
        </template>
      </UCard>
    </v-dialog>
  </v-row>

</template>

<script setup>
import { useCommerceAdapter, useContentAdapter } from '#imports'
void useCommerceAdapter()
void useContentAdapter()
import { ref } from 'vue'
import DirectusFormElement from '#shared/app/components/ui/forms/DirectusFormElement.vue'
import { useDirectusForm } from '#shared/app/composables/globals/useDirectusForm'

const dialog = ref(false)
const { $directus, $readFieldsByCollection } = useNuxtApp()

const { data, error } = await useAsyncData('attributes', async () => {
  return $directus.request($readFieldsByCollection('attributes'))
})

// guard against undefined/null data.value and empty arrays
if (error.value || data.value == null || (data.value?.length ?? 0) === 0) {
  console.error(error)
  throw createError({
    statusCode: 404,
    statusMessage: 'Attribute not found'
  })
}

const attributeFields = data


// use composable for form handling (validation, submit, provide context)
const { form, formError, formSuccess, submitForm } = useDirectusForm('attributes', attributeFields, { clearOnSuccess: true, closeDialogRef: dialog })
</script>