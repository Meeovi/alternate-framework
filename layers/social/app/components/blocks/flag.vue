<template>
  <div>
    <v-btn variant="text" color="inherit" prepend-icon="fas fa-flag" title="Flag this content" @click="dialog = true">
      Flag this content
    </v-btn>

    <v-dialog v-model="dialog" transition="dialog-bottom-transition" fullscreen :scroll-strategy="'reposition'">
      <v-card class="pa-4">
        <v-toolbar>
          <v-btn :icon="'mdi-close'" variant="text" @click="dialog = false" />

          <v-toolbar-title>New Report</v-toolbar-title>

          <v-toolbar-items>
            <v-btn variant="text" @click="submitForm">
              Save
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <div v-if="formError" class="error">{{ formError }}</div>
        <div v-else-if="formSuccess" class="success">{{ formSuccess }}</div>
        <JsonSchemaFormFromFields :fields="reportFields" :model-value="form"
          @update:model-value="Object.assign(form, $event)" @submit="submitForm" />
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
  import {
    computed,
    ref,
  } from '#imports'
  import JsonSchemaFormFromFields from '#shared/app/components/ui/forms/JsonSchemaFormFromFields.vue'
  import {
    useContentForm
  } from '../../composables/useContentForm'

  const props = defineProps({
    reportId: {
      type: [String, Number, Object],
      required: false,
    },
    report: {
      type: [String, Number, Object],
      required: false,
    },
  })

  const providedReportId = props.reportId ?? props.report ?? null
  const dialog = ref(false)
  const {
    $directus,
    $readFieldsByCollection,
  } = useNuxtApp()

  const {
    data,
    error,
  } = await useAsyncData(`report-schema-fields-${String(providedReportId ?? 'new')}`, async () => {
    const resp = await $directus.request($readFieldsByCollection('report'))
    return Array.isArray(resp) ? resp : []
  })

  if (error.value || data.value == null || (data.value?.length ?? 0) === 0) {
    console.warn('Report fields not available or empty', error?.value)
  }

  const reportFields = computed(() => Array.isArray(data.value) ? data.value : [])

  const {
    form,
    formError,
    formSuccess,
    submitForm,
  } = useContentForm('report', reportFields, {
    clearOnSuccess: true,
    closeDialogRef: dialog,
  })
</script>