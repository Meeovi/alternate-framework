<template>
    <div>
        <v-row justify="center">
            <v-dialog v-model="dialog" :scrim="false" transition="dialog-bottom-transition">
                <template v-slot:activator="{ props }">
                    <v-btn v-bind="props">
                        <v-icon start icon="fas fa-plus"></v-icon>Update Bookmark
                    </v-btn>
                </template>
                <v-card>
                    <DynamicForm collection="websites" />
                </v-card>
            </v-dialog>
        </v-row>
    </div>
</template>

<script setup>
import { ref } from '#imports';
import { DynamicForm } from '@mframework/meeovi-forms'

const dialog = ref(false);
</script>
