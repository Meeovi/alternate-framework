<template>
    <v-dialog max-width="500">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn color="primary" v-bind="activatorProps" icon="fas fa-gear" size="medium"
                title="Upload Media"></v-btn>
        </template>

        <template v-slot:default="{ isActive }">
            <v-card title="Dialog">
                <template>
                    <div v-if="formError" class="error">{{ formError }}</div>
                    <div v-else-if="formSuccess" class="success">{{ formSuccess }}</div>
                    <JsonSchemaFormFromFields
                        :fields="mediaFields"
                        :model-value="form"
                        @update:model-value="Object.assign(form, $event)"
                        @submit="submitForm"
                    />
                </template>
            </v-card>
        </template>
    </v-dialog>
</template>

<script setup>
    import {
        ref,
        reactive
    } from '#imports'
    import JsonSchemaFormFromFields from '../ui/forms/JsonSchemaFormFromFields.vue'

    const dialog = ref(false)
    const { $directus, $readFieldsByCollection, $createItem } = useNuxtApp()
    const form = reactive({})
    const formError = ref('')
    const formSuccess = ref('')

    const {
        data,
        error
    } = await useAsyncData('media', async () => {
        const resp = await $directus.request($readFieldsByCollection('media'))
        return Array.isArray(resp) ? resp : []
    })

    if (error.value || data.value == null || (data.value?.length ?? 0) === 0) {
        console.error(error)
        throw createError({
            statusCode: 404,
            statusMessage: 'Note not found'
        })
    }

    const mediaFields = data

    for (const field of mediaFields.value || []) {
        if (field?.field && !(field.field in form)) {
            form[field.field] = null
        }
    }

    const submitForm = async () => {
        formError.value = ''
        formSuccess.value = ''
        try {
            await $directus.request($createItem('media', { ...form }))
            formSuccess.value = 'Posted successfully.'
            for (const key of Object.keys(form)) {
                form[key] = null
            }
            dialog.value = false
        } catch (err) {
            formError.value = err?.message || 'Failed to submit media.'
        }
    }
</script>