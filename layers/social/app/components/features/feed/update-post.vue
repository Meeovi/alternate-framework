<template>
    <div>
        <v-dialog v-model="dialog" max-width="500" :scroll-strategy="'reposition'">
            <template v-slot:activator="{ props: activatorProps }">
                <v-btn color="red darken-1" v-bind="activatorProps" prepend-icon="fas fa-gear" text="Edit" variant="text"
                    title="Edit this Content"></v-btn>
            </template>

            <template v-slot:default="{ isActive }">
                <v-card title="Dialog">
                    <DynamicForm collection="posts" />
                </v-card>
            </template>
        </v-dialog>

        <!-- Delete Confirmation Dialog -->
        <v-dialog v-model="deleteDialog" max-width="500px" :scroll-strategy="'reposition'">
            <v-card>
                <h3 class="text-h5">Delete Post</h3>
                <div>
                    Are you sure you want to delete this post? This action cannot be undone.
                </div>
                <div>
                    <v-spacer></v-spacer>
                    <v-btn color="blue-darken-1" variant="text" @click="deleteDialog = false">
                        Cancel
                    </v-btn>
                    <v-btn color="error" variant="text" @click="deletePost" :loading="deleteLoading">
                        Delete
                    </v-btn>
                </div>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import { DynamicForm } from '@mframework/meeovi-forms'
    import uploadFiles from '../../../composables/content/uploadFiles'
    import updatePost from '../../../composables/posts/updatePost'
    import { useUserStore } from '#auth/app/stores/user'
    import { useRouter } from 'vue-router'
    import { useAuth } from '#auth/app/composables/useAuth'

    const { user } = useAuth()

    const props = defineProps({
        space_id: {
            type: String,
            required: true
        }
    })

    const deleteDialog = ref(false)
    const deleteLoading = ref(false)

    const userDisplayName = computed(() => {
        return user.user?.name || user.user?.username || 'User'
    })

    const route = useRoute()

    const dialog = ref(false)
    const includeFiles = ref(true)
    const imageFile = ref(null)
    const audioFile = ref(null)
    const loading = ref(false)
</script>
