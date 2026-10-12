<template>
    <div>
        <v-card class="elite-card ma-2 mx-auto" color="white" height="320" width="350" max-width="100%">
              <MeeoviPlayer :src="video?.video?.filename_disk ? `${$directus.url}assets/${video.video.filename_disk}` : null"
                :type="video?.video?.type" :title="video?.name" />
              <v-card-title>{{ video?.name }}</v-card-title>
        </v-card>
    </div>
</template>

<script setup>
     const props = defineProps({
        video: {
            type: Object,
            required: true,
        },
    });
    const {
        video
    } = props;
    const { $directus } = useNuxtApp()
</script>