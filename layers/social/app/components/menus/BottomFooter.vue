<template>
    <div class="pa-4 text-center feedButton">
        <v-dialog v-model="dialog" max-width="800" transition="dialog-bottom-transition">
            <template v-slot:activator="{ props }">
                <v-btn icon="fas:fa fa-plus" class="postbtn" title="Post to Social Feed" v-bind="props">
                </v-btn>
            </template>

            <template v-slot:default="{ isActive }">
                <v-card class="pa-4">
                    <createpost />

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
    import createpost from '#social/app/components/features/feed/add-post.vue'

    const dialog = ref(false);
</script>