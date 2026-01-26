<template>
    <div>
        <v-btn class="btn btn-sm btn-black-outline display-4" @click="dialog = true" prepend-icon="fas fa-flag"
            title="Flag this content" variant="flat"></v-btn>

        <v-dialog v-model="dialog" max-width="800" transition="dialog-bottom-transition">
            <template v-slot:default="{ isActive }">
                <v-card class="pa-4">
                    <h1>New Report</h1>
                    <div v-if="formError" class="error">{{ formError }}</div>
                    <div v-else-if="formSuccess" class="success">{{ formSuccess }}</div>
                    <form @submit.prevent="submitForm">
                        <DirectusFormElement v-for="field in reportFields" :key="field.field" :field="field"
                            v-model="form[field.field]" />
                        <v-btn type="submit">Submit</v-btn>
                    </form>

                    <v-card-actions>
                        <v-spacer></v-spacer>

                        <v-btn text="Close" variant="text" @click="isActive.value = false"></v-btn>
                    </v-card-actions>
                </v-card>
            </template>
        </v-dialog>
    </div>
</template>

<script setup>
    import {
        ref
    } from 'vue'
    import DirectusFormElement from '../../../../shared/app/components/ui/forms/DirectusFormElement.vue'
    import {
        useDirectusForm
    } from '../../../../shared/app/composables/globals/useDirectusForm'

    const dialog = ref(false)
    const {
        $directus,
        $readFieldsByCollection
    } = useNuxtApp()

    const {
        data,
        error
    } = await useAsyncData('report', async () => {
        return $directus.request($readFieldsByCollection('report'))
    })

    // guard against undefined/null data.value and empty arrays
    // Don't throw here (that will crash the parent page). Instead fall back to an empty fields array
    let reportFields = data
    if (error.value || data.value == null || (data.value?.length ?? 0) === 0) {
        console.warn('Report fields not available or empty', error?.value)
        reportFields = ref([])
    }

    // use composable for form handling (validation, submit, provide context)
    const {
        form,
        formError,
        formSuccess,
        submitForm
    } = useDirectusForm('report', reportFields, {
        clearOnSuccess: true,
        closeDialogRef: dialog
    })

    const props = defineProps({
        // Accept either `reportId` or `report` to be compatible with different usages
        reportId: {
            type: [String, Number, Object],
            required: false
        },
        report: {
            type: [String, Number, Object],
            required: false
        }
    });

    // normalize prop value
    const providedReportId = props.reportId ?? props.report ?? null
</script>