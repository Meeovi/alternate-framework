<template>
    <div>
        <v-row justify="center">
            <v-dialog v-model="dialog" :scrim="false" transition="dialog-bottom-transition" @show="fetchBookmarkData">
                <template v-slot:activator="{ props }">
                    <v-btn v-bind="props">
                        <v-icon start icon="fas:fa fa-plus"></v-icon>Update Address
                    </v-btn>
                </template>
                <v-card>
                    <v-form @submit.prevent="handleSubmit">
                        <v-card>
                            <template>
                                <v-row>
                                    <v-col cols="6"><v-text-field v-model="bookmarkData.name" id="bookmarkName"
                                            label="Bookmark Name*" required /></v-col>
                                    <v-col cols="6"><v-text-field v-model="bookmarkData.url" id="bookmarkUrl"
                                            label="Bookmark Url*" required /></v-col>
                                    <v-col cols="6">
                                        <v-select v-model="bookmarkData.type" label="What type of bookmark is this?"
                                            :items="['Website', 'Password']" />
                                    </v-col>
                                    <v-col cols="6">
                                        <v-select v-model="bookmarkData.status"
                                            label="Is this bookmark public or private?"
                                            :items="['Public', 'Private']" />
                                    </v-col>
                                    <v-col cols="12">
                                        <v-file-upload @change="handleImageUpload" clearable density="compact"
                                            prepend-icon="fas:fa fa-image" accept="image/*" label="Image"
                                            variant="solo-inverted" />
                                    </v-col>
                                    <v-col cols="12"><v-textarea v-model="bookmarkData.note" label="Note"
                                            variant="outlined"></v-textarea></v-col>
                                </v-row>
                            </template>
                            <v-divider class="mt-12"></v-divider>
                            <template>
                                <v-btn color="blue-darken-1" variant="text" @click="isActive.value = false">
                                    Close
                                </v-btn>
                                <v-spacer></v-spacer>
                                <v-btn color="blue-darken-1" variant="text" type="submit" @click="confirmDelete"
                                    :loading="deleteLoading">
                                    Delete Bookmark
                                </v-btn>
                                <v-btn color="blue-darken-1" variant="text" type="submit">
                                    Update Bookmark
                                </v-btn>
                            </template>
                        </v-card>
                    </v-form>

                    <!-- Delete Confirmation Dialog -->
                    <v-dialog v-model="deleteDialog" max-width="500px">
                        <v-card>
                            <template #title class="text-h5">Delete Bookmark</template>
                            <template>
                                Are you sure you want to delete this bookmark? This action cannot be undone.
                            </template>
                            <template>
                                <v-spacer></v-spacer>
                                <v-btn color="blue-darken-1" variant="text" @click="deleteDialog = false">
                                    Cancel
                                </v-btn>
                                <v-btn color="error" variant="text" @click="deleteBookmark" :loading="deleteLoading">
                                    Delete
                                </v-btn>
                            </template>
                        </v-card>
                    </v-dialog>
                </v-card>
            </v-dialog>
        </v-row>
    </div>
</template>

<script>
    export default {
        methods: {
            reset() {
                this.$refs.form.reset()
            },
        },
    }
</script>

<script setup>
    import {
        ref,
        onMounted,
        watch,
        computed
    } from '#imports';
    import {
        useRoute,
        useRouter
    } from 'vue-router';
    import uploadFiles from '#social/app/composables/lists/content/uploadFiles';
    import {
        updateItem,
        deleteItem
    } from '@mframework/adapter-directus';
    const currentUser = useCurrentUser()

    const content = useContentAdapter()

    const userDisplayName = computed(() => {
        return currentUser.value?.name || currentUser.value?.username || 'User'
    })

    const route = useRoute();

    const id = route.params.id;

    // Add these new refs for delete functionality
    const deleteDialog = ref(false);
    const deleteLoading = ref(false);

    const bookmarkData = ref({
        name: '',
        url: '',
        type: '',
        status: '',
        note: '',
        image: null,
        username: userDisplayName,
    })

    const dialog = ref(false);
    const location = ref('bottom');

    const imageFile = ref(null);
    const loading = ref(false);

    // Function to fetch existing bookmark data
    const fetchBookmarkData = async () => {
        try {
            const bookmarkId = route.params.id
            if (!bookmarkId) return

            if (content && typeof content.readItem === 'function') {
                const resp = await content.readItem('websites', bookmarkId)
                const response = resp?.data || resp || null
                if (response) {
                    bookmarkData.value = {
                        id: response.id,
                        name: response.name || '',
                        type: response.type || '',
                        status: response.status || '',
                        note: response.note || '',
                        image: response.image || '',
                        url: response.url || '',
                        username: response.username || userDisplayName
                    }
                }
                return
            }
        } catch (error) {
            console.error('Error fetching bookmark:', error);
        }
    };

    // Load existing data when component mounts
    onMounted(() => {
        if (route.params.id) {
            fetchBookmarkData();
        }
    });
    // Emit event for parent component updates
    const emit = defineEmits(['bookmark-updated']);

    const handleImageUpload = (event) => {
        imageFile.value = event.target.files[0];
    };

    const handleSubmit = async () => {
        try {
            loading.value = true;

            // Prepare update data
            const updateData = {
                id: bookmarkData.value.id,
                name: bookmarkData.value.name,
                type: bookmarkData.value.type,
                status: bookmarkData.value.status,
                note: bookmarkData.value.note,
                image: bookmarkData.value.image,
                url: bookmarkData.value.url,
            };

            // Handle image upload if there's a new image
            if (imageFile.value) {
                const uploadedFiles = await uploadFiles({
                    imageFile: imageFile.value,
                });
                updateData.image = uploadedFiles.imageId;
            }

            let updatedBookmark = null
            if (content && typeof content.updateItem === 'function') {
                const resp = await content.updateItem('websites', route.params.id, updateData)
                updatedBookmark = resp?.data || resp
            }

            if (updatedBookmark) {
                // Refresh the bookmark data
                await fetchBookmarkData();

                // Show success message
                alert('Bookmark updated successfully');
            } else {
                throw new Error('Failed to update bookmark');
            }

        } catch (error) {
            console.error('Error updating bookmark:', error);
            alert('Error updating bookmark: ' + error.message);
        } finally {
            loading.value = false;
        }
    };

    // Remove the onMounted hook since we'll use the dialog @show event instead
    // Instead, watch for dialog changes
    watch(dialog, (newValue) => {
    if (newValue && route.params.id) {
        fetchBookmarkData();
    }
    });

    // Add these new functions for delete functionality
    const confirmDelete = () => {
        deleteDialog.value = true;
    };

    const deleteBookmark = async () => {
        try {
            deleteLoading.value = true;
            if (content && typeof content.deleteItem === 'function') {
                await content.deleteItem('websites', route.params.id)
            }

            // Close the delete dialog
            deleteDialog.value = false;

            // Show success message
            alert('Bookmark deleted successfully');

            // Redirect to bookmarks page
            navigateTo('/commerce/lists');
        } catch (error) {
            console.error('Error deleting bookmark:', error);
            alert('Error deleting bookmark: ' + error.message);
        } finally {
            deleteLoading.value = false;
        }
    };
</script>