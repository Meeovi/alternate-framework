<template>
    <div>
        <a :href="`/story/${story?.slug}`">
            <v-card class="elite-card ma-2 mx-auto" color="white" height="550" width="300" max-width="100%">
                <div v-if="story?.image?.filename_disk">
                    <img class="align-end text-white" height="400" :alt="story?.name"
                        :src="`${$directus.url}assets/${story?.image?.filename_disk}`" cover />
                </div>

                <div v-else>
                    <img class="align-end text-white" height="300" src="assets/images/coming_soon.png" cover />
                </div>

                <v-card-subtitle class="pt-4">
                    Published: {{ new Date(story?.date_created).toLocaleDateString() }}
                </v-card-subtitle>

                <v-card-title>{{ story?.name }}</v-card-title>

                <v-card-actions>
                    <v-btn color="blue" :href="`/story/${story?.slug}`">
                        Read More
                    </v-btn>
                </v-card-actions>
                <div class="d-flex fill-height align-center justify-center">
                    <v-scale-transition>
                        <v-icon color="white" size="48" icon="fas fa-circle-xmark"></v-icon>
                    </v-scale-transition>
                </div>
            </v-card>
        </a>
    </div>
</template>

<script setup>
    const props = defineProps({
        story: {
            type: Object,
            required: true,
        },
    });
    const {
        story
    } = props;
</script>