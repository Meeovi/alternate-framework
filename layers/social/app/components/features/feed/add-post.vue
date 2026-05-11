<template>
  <v-row justify="center">
      <UCard>
        <template>
          <h4>Create New Note</h4>
        </template>

        <template #default>
          <div v-if="formError" class="error">{{ formError }}</div>
          <div v-else-if="formSuccess" class="success">{{ formSuccess }}</div>

          <div v-if="postFields.length === 0" class="text-medium-emphasis">
            Post fields are not available yet.
          </div>

          <UForm v-else @submit.prevent="submitForm">
            <DirectusFormElement v-for="field in postFields" :key="field.field" :field="field" v-model="form[field.field]" />
            <UButton type="submit">Post</UButton>
          </UForm>
        </template>
      </UCard>
  </v-row>
</template>

<script setup>
import { ref } from 'vue'
import DirectusFormElement from '#shared/app/components/ui/forms/DirectusFormElement.vue'
import { useDirectusForm } from '#shared/app/composables/globals/useDirectusForm'
import useAdapterRequest from '~/composables/useAdapterRequest'

const dialog = ref(false)
const { readFieldsByCollection } = useAdapterRequest()

const { data, error } = await useAsyncData('posts', async () => {
  const resp = await readFieldsByCollection('posts')
  return resp?.data || resp || []
})

if (error.value) {
  console.error(error.value)
}

const postFields = computed(() => (Array.isArray(data.value) ? data.value : []))

// use composable for form handling (validation, submit, provide context)
const { form, formError, formSuccess, submitForm } = useDirectusForm('posts', postFields, { clearOnSuccess: true, closeDialogRef: dialog })
</script>