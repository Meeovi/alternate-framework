<template>
    <div>
        <v-menu>
            <template v-slot:activator="{ props }">
                <v-btn size="small"  color="primary" v-bind="props" icon="fas fa-ellipsis-vertical"></v-btn>
            </template>
            <v-list lines="one">
                <v-list-item class="feedMenu">
                    <v-list-item-title><updatePost :post="post" /></v-list-item-title>

                    <v-list-item-title><flag :reportId="post?.report?.report_id?.id" /></v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </div>
</template>

<script setup>
    import {
        ref
    } from 'vue'
    import addPost from '#social/app/components/features/feed/add-post.vue';
    import updatePost from '#social/app/components/features/feed/update-post.vue';
    import flag from '#social/app/components/blocks/flag.vue';

    const props = defineProps({
        post: {
            type: Object,
            required: true,
        },
    });
</script>