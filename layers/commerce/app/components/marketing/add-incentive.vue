<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" :scrim="false" transition="dialog-bottom-transition">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" class="rightAddBtn">
          <v-icon start icon="fas:fa fa-plus"></v-icon>Create a Coupon
        </v-btn>
      </template>
      <v-card class="b-1">
        <template #header>
          <h3>Create New Coupon</h3>
        </template>

        <template #header>
          <div v-if="formError" class="error">{{ formError }}</div>
          <div v-else-if="formSuccess" class="success">{{ formSuccess }}</div>
          <v-form @submit.prevent="submitForm">
            <DirectusFormElement v-for="field in couponFields" :key="field.field" :field="field" v-model="form[field.field]" />
            <v-btn type="submit">Submit</v-btn>
          </v-form>
        </template>
      </v-card>
    </v-dialog>
  </v-row>

</template>



<script setup>
import { useCommerceAdapter, useContentAdapter } from '#imports'
void useCommerceAdapter()
void useContentAdapter()

import { ref } from '#imports'
import DirectusFormElement from '~/components/ui/forms/DirectusFormElement.vue'
import { useDirectusForm } from '~/composables/useDirectusForm'

const dialog = ref(false)
const { $directus, $readFieldsByCollection } = useNuxtApp()

const { data, error } = await useAsyncData('incentives', async () => {
  return $directus.request($readFieldsByCollection('incentives'))
})

// guard against undefined/null data.value and empty arrays
if (error.value || data.value == null || (data.value?.length ?? 0) === 0) {
  console.error(error)
  throw createError({
    statusCode: 404,
    statusMessage: 'Coupon not found'
  })
}

const couponFields = data


// use composable for form handling (validation, submit, provide context)
const { form, formError, formSuccess, submitForm } = useDirectusForm('incentives', couponFields, { clearOnSuccess: true, closeDialogRef: dialog })
</script>