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
        <DynamicForm collection="report" />
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref } from '#imports'
import { DynamicForm } from '@mframework/meeovi-forms'

const { $sdk, $directus, $readItems } = useNuxtApp()

const props = defineProps({
  reportId: {
    type: [String, Number, Object],
    required: false
  },
  report: {
    type: [String, Number, Object],
    required: false
  },
})

const providedReportId = props.reportId ?? props.report ?? null
const dialog = ref(false)
</script>