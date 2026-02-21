<template>
    <v-dialog max-width="500">
        <template v-slot:activator="{ props: activatorProps }">
            <UButton color="primary" v-bind="activatorProps" icon="fas fa-gear" size="medium"
                title="Upload Media"></UButton>
        </template>

        <template v-slot:default="{ isActive }">
            <UCard title="Dialog">
                <template #header>
                    <div v-if="formError" class="error">{{ formError }}</div>
                    <div v-else-if="formSuccess" class="success">{{ formSuccess }}</div>
                    <UForm @submit.prevent="submitForm">
                        <DirectusFormElement v-for="field in mediaFields" :key="field.field" :field="field"
                            v-model="form[field.field]" />
                        <UButton type="submit">Post</UButton>
                    </UForm>
                </template>
            </UCard>
        </template>
    </v-dialog>
</template>

<script setup>
    import {
        ref
    } from 'vue'
    import DirectusFormElement from '../ui/forms/DirectusFormElement.vue'
        import { useDirectusForm } from '../../composables/useDirectusForm'
        import { useDirectusSchema } from '../../composables/useDirectusSchema'
    const dialog = ref(false)
    const {
        data,
        error
    } = await useAsyncData('media', async () => {
        return useDirectusSchema('media')
    })

    // guard against undefined/null data.value and empty arrays
    if (error.value || data.value == null || (data.value?.length ?? 0) === 0) {
        console.error(error)
        throw createError({
            statusCode: 404,
            statusMessage: 'Note not found'
        })
    }

    const mediaFields = data

    // use composable for form handling (validation, submit, provide context)
    const {
        form,
        formError,
        formSuccess,
        submitForm
    } = useDirectusForm('media', mediaFields, {
        clearOnSuccess: true,
        closeDialogRef: dialog
    })
</script>