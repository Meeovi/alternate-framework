<template>
    <v-dialog max-width="500">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn color="primary" v-bind="activatorProps" icon="fas fa-gear" size="medium"
                title="Upload Media"></v-btn>
        </template>

        <template v-slot:default="{ isActive }">
            <v-card title="Dialog">
                <v-card-text>
                    <div v-if="formError" class="error">{{ formError }}</div>
                    <div v-else-if="formSuccess" class="success">{{ formSuccess }}</div>
                    <form @submit.prevent="submitForm">
                        <DirectusFormElement v-for="field in mediaFields" :key="field.field" :field="field"
                            v-model="form[field.field]" />
                        <v-btn type="submit">Post</v-btn>
                    </form>
                </v-card-text>
            </v-card>
        </template>
    </v-dialog>
</template>

<script setup>
    import {
        ref
    } from 'vue'
    import DirectusFormElement from '~/components/ui/forms/DirectusFormElement.vue'
    import {
        useDirectusForm
    } from '~/composables/globals/useDirectusForm'

    const dialog = ref(false)
    const {
        $directus,
        $readFieldsByCollection
    } = useNuxtApp()

    const {
        data,
        error
    } = await useAsyncData('media', async () => {
        return $directus.request($readFieldsByCollection('media'))
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