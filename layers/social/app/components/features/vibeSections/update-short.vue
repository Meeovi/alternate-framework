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
                        <v-form @submit.prevent="handleSubmit">
                            <v-toolbar dark color="primary">
                                <v-btn icon dark @click="dialog = false">
                                    <v-icon icon="fas fa-circle-xmark"></v-icon>
                                </v-btn>
                                <template>
                                    <span class="text-h6">Update Short</span>
                                </template>
                            </v-toolbar>
                            <template>
                                <v-container>
                                    <v-row>
                                        <v-col cols="12">
                                            <v-text-field v-model="shortData.name" id="shortName" label="Short Name*"
                                                required />
                                        </v-col>
                                        <v-col cols="6">
                                            <v-select v-model="shortData.type" label="What type of short is this?"
                                                :items="['Default', 'Live', 'Eats']" />
                                        </v-col>
                                        <v-col cols="6">
                                            <v-select v-model="shortData.status"
                                                label="Is this short public or private?"
                                                :items="['Published', 'Private', 'Draft']" />
                                        </v-col>
                                        <v-col cols="6">
                                            <v-select v-model="shortData.age_requirement"
                                                label="What is the Age Requirement?"
                                                :items="['Everyone', '18+', '16+']" />
                                        </v-col>
                                        <v-col cols="12">
                                            <v-textarea v-model="shortData.description" label="Description"
                                                id="shortDescription" />
                                        </v-col>
                                        <v-col cols="6">
                                            <v-file-upload @change="handleVideoUpload" clearable density="compact"
                                                prepend-icon="fas fa-video" accept="video/*" label="Video File"
                                                variant="solo-inverted" />
                                        </v-col>
                                        <v-col cols="6">
                                            <v-file-upload @change="handleThumbnailUpload" clearable density="compact"
                                                prepend-icon="fas fa-image" accept="image/*" label="Image for Video"
                                                variant="solo-inverted" />
                                        </v-col>
                                    </v-row>
                                </v-container>
                                <small>*indicates required field</small>
                            </template>
                            <template>
                                <v-spacer></v-spacer>
                                <v-btn color="blue-darken-1" variant="text" @click="dialog = false">
                                    Close
                                </v-btn>
                                <v-btn color="blue-darken-1" variant="text" type="submit">
                                    Update Short
                                </v-btn>
                            </template>
                        </v-form>
                    </v-card>
                </v-row>
            </template>
        </v-dialog>
    </div>
</template>

<script setup>
    import {
        ref
    } from '#imports';
    import {
        useRouter
    } from 'vue-router';
    import uploadFiles from '#social/app/composables/lists/content/uploadFiles';
    import updateShort from '../../composables/shorts/updateShort';

    const { $readItem, $updateItem } = useNuxtApp()

    // Make sure your props are properly defined
    // Update props to include spaces_id
    const props = defineProps({
        spaces_id: {
            type: String,
            required: true
        }
    });

    const route = useRoute();

    const id = route.params.id;

    const shortData = ref({
        name: '',
        description: '',
        type: '',
        status: '',
        duration: '',
        video_url: '',
        age_requirement: '',
        video: '',
        thumbnail: null,
        host: userDisplayName,
        spaces: [{
            spaces_id: {
                id: id
            }
        }], // Initialize with the spaces_id from props
    })

    const dialog = ref(false);
    const location = ref('bottom');
    const loading = ref(false);

    const imageFile = ref(null);
    const videoFile = ref(null);

    // Function to fetch existing space data
    const fetchShortData = async () => {
        try {
            const shortId = route.params.id
            const resp = await $sdk.content.readItem('shorts', shortId)
            const data = resp || null
            if (!data) return
            shortData.value = {
                id: data.id,
                name: data.name,
                type: data.type,
                status: data.status,
                description: data.description,
                video: data.video,
                duration: data.duration,
                video_url: data.video_url,
                age_requirement: data.age_requirement,
                thumbnail: data.thumbnail,
            }
        } catch (error) {
            console.error('Error fetching short:', error)
        }
    }

    // Load existing data when component mounts
    onMounted(() => {
        if (route.params.id) {
            fetchShortData();
        }
    });

    const getVideoDuration = (file) => {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.preload = 'metadata';

            video.onloadedmetadata = function () {
                window.URL.revokeObjectURL(video.src);
                resolve(video.duration);
            }

            video.onerror = function () {
                reject("Invalid video. Please select a valid video file.");
            }

            video.src = URL.createObjectURL(file);
        });
    }


    // Emit event for parent component updates
    const emit = defineEmits(['short-updated']);

    const handleThumbnailUpload = (event) => {
        imageFile.value = event.target.files[0];
    };

    const handleVideoUpload = async (event) => {
        videoFile.value = event.target.files[0];
        if (videoFile.value) {
            try {
                const duration = await getVideoDuration(videoFile.value);
                shortData.value.duration = Math.round(duration);
                console.log('Video duration:', shortData.value.duration);
            } catch (error) {
                console.error('Error getting video duration:', error);
                alert(error);
            }
        }
    };

    const handleSubmit = async () => {
        try {
            loading.value = true;
            let uploadedFiles = {};
            let videoDuration = shortData.value.duration; // Keep the existing duration as fallback

            if (videoFile.value || imageFile.value) {
                uploadedFiles = await uploadFiles({
                    videoFile: videoFile.value,
                    imageFile: imageFile.value
                });

                // Calculate video duration if a new video file is uploaded
                if (videoFile.value) {
                    try {
                        const duration = await getVideoDuration(videoFile.value);
                        videoDuration = Math.round(duration);
                        console.log('New video duration:', videoDuration);
                    } catch (error) {
                        console.error('Error getting video duration:', error);
                        // Don't throw here, we'll use the existing duration
                    }
                }
            }

            // Update the short using the content gateway adapter
            const updatedShort = await updateItem('shorts', route.params.id, {
                name: shortData.value.name,
                type: shortData.value.type,
                status: shortData.value.status,
                description: shortData.value.description,
                video: uploadedFiles.videoId || shortData.value.video,
                duration: videoDuration,
                video_url: shortData.value.video_url,
                age_requirement: shortData.value.age_requirement,
                thumbnail: uploadedFiles.imageId || shortData.value.thumbnail,
            })

            if (updatedShort) {
                await fetchShortData()
                alert('Short updated successfully')
                dialog.value = false
                window.location.reload()
            }
        } catch (error) {
            console.error('Error updating short:', error);
            alert('Error updating short: ' + error.message);
        } finally {
            loading.value = false;
        }
    };

    // Add watch to update shorts_id if props change
    watch(() => props.spaces_id, (newSpaceId) => {
        shortData.value.spaces_id = newSpaceId;
    });
</script>