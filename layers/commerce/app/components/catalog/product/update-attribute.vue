<template>
    <v-row justify="center">
        <v-dialog v-model="dialog" :scrim="false" transition="dialog-bottom-transition">
            <template v-slot:activator="{ props }">
                <UButton v-bind="props" class="rightAddBtn">
                    <UIcon start icon="fas:fa fa-plus"></UIcon>Add Attribute
                </UButton>
            </template>
            <UCard>
                <UForm method="post" @v-on:submit.prevent="addAttribute()">
                    <v-toolbar dark color="primary">
                        <UButton icon dark @click="dialog = false">
                            <UIcon icon="fas:fa fa-circle-xmark"></UIcon>
                        </UButton>
                        <template #header>
                            <span class="text-h6">Create new Attribute</span>
                        </template>
                    </v-toolbar>
                    <template #header>
                        <v-container>
                            <v-row>
                                <v-col cols="12">
                                    <UInput v-model="name" id="addressName" label="Attribute Name*" required></UInput>
                                </v-col>
                                <v-col cols="12">
                                    <UTextarea v-model="content" label="Description" id="addressDescription">
                                    </UTextarea>
                                </v-col>
                                <v-col cols="6">
                                    <UInput v-model="meta_title" label="Meta Name" id="addressName"></UInput>
                                </v-col>
                                <v-col cols="6">
                                    <UInput v-model="meta_keywords" label="Meta Keywords"></UInput>
                                </v-col>
                                <v-col cols="12">
                                    <UTextarea v-model="meta_description" label="Meta Description" id="addressDescription"></UTextarea>
                                </v-col>
                            </v-row>
                        </v-container>
                        <small>*indicates required field</small>
                    </template>
                    <template>
                        <v-spacer></v-spacer>
                        <UButton color="blue-darken-1" variant="text" @click="dialog = false">
                            Close
                        </UButton>
                        <UButton color="blue-darken-1" variant="text" @click="dialog = false">
                            Save
                        </UButton>
                    </template>
                </UForm>
            </UCard>
        </v-dialog>
    </v-row>
</template>

<script setup>
import { useCommerceAdapter, useContentAdapter } from '#imports'
void useCommerceAdapter()
void useContentAdapter()
    import {
        ref
    } from 'vue'
    

    const config = useRuntimeConfig();
    const name = ref('');
    const content = ref('');
    const dialog = ref(false);
    const notifications = ref(false);
    const sound = ref(true);
    const widgets = ref(false);
    const slug = ref('');
    const type = ref('');
    const errorMessage = ref('');
    const successMessage = ref('');

    const createAttribute = async () => {
        try {
            const response = await $fetch(`${config.public.wordpressUrl}/wp-json/dokan/v1/products/attributes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.public.wordpressToken}`
                },
                body: JSON.stringify({
                    name: name.value,
                    slug: slug.value,
                    type: type.value,
                    status: 'publish',
                })
            })

            console.log(response);

            if (response.id) {
                successMessage.value = 'Attribute created successfully!'
                errorMessage.value = ''
            } else {
                throw new Error('Failed to create attribute')
            }
        } catch (error) {
            console.error('Error creating attribute:', error);
            if (error.response) {
                console.error('Error response:', error.response);
                if (error.response.status === 403) {
                    errorMessage.value = 'You do not have permission to create a attribute.'
                } else {
                    errorMessage.value = `Error: ${error.response.status} ${error.response.statusText}`
                }
            } else {
                errorMessage.value = error.message
            }
            successMessage.value = ''
        }
    }

    useHead({
        title: 'Create Attribute',
    })
</script>