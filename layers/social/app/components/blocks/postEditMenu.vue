<template>
    <div v-if="canEdit || canReport">
        <v-menu>
            <template v-slot:activator="{ props }">
                <v-btn size="small"  color="primary" v-bind="props" icon="fas fa-ellipsis-vertical"></v-btn>
            </template>
            <v-list lines="one">
                <v-list-item class="feedMenu">
                    <!-- Only the post's author can edit it -->
                    <v-list-item-title v-if="canEdit"><updatePost :post="post" /></v-list-item-title>

                    <!-- Anyone else who is signed in can report it -->
                    <v-list-item-title v-if="canReport"><flag :reportId="post?.report?.report_id?.id" /></v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </div>
</template>

<script setup>
    import {
        computed
    } from 'vue'
    import { authClient } from '#auth/lib/auth-client'
    import updatePost from '#social/app/components/features/feed/update-post.vue';
    import flag from '#social/app/components/blocks/flag.vue';

    const props = defineProps({
        post: {
            type: Object,
            required: true,
        },
    });

    // authClient.useSession() returns the Vue ref itself (not { data }).
    // It's empty during SSR, so the menu only appears once the session loads.
    const session = authClient.useSession();
    const userId = computed(() => session.value?.data?.user?.id ?? null);

    // posts.creator_id holds the author's better-auth user id (stamped by the
    // CMS proxy on create). Posts without one have no app-side owner.
    const canEdit = computed(() => !!userId.value && !!props.post?.creator_id && props.post.creator_id === userId.value);
    const canReport = computed(() => !!userId.value && !canEdit.value);
</script>
