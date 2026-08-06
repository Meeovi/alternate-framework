<template>
    <div>
        <v-dialog max-width="500">
            <template v-slot:activator="{ props: activatorProps }">
                <v-btn color="primary" v-bind="activatorProps" size="medium" variant="text" class="shortUpdateBtn"
                    text="Update" title="Update"></v-btn>
            </template>

            <template v-slot:default="{ isActive }">
                <v-row justify="center">
                    <v-card>
                        <DynamicForm collection="shorts" />
                    </v-card>
                </v-row>
            </template>
        </v-dialog>
    </div>
</template>

<script setup>
    import { ref } from '#imports';
    import { DynamicForm } from '@mframework/meeovi-forms'
    import updateShort from '../../composables/shorts/updateShort';

    const { $readItem, $updateItem } = useNuxtApp()

    const props = defineProps({
        spaces_id: {
            type: String,
            required: true
        }
    });

    const route = useRoute();
    const dialog = ref(false);
</script>