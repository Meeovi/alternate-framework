<template>
    <div>
        <v-card class="elite-card ma-2 mx-auto" color="white" height="320" width="350" max-width="100%">
              <video :src="`$${video?.video?.filename_disk}`" controls height="250" width="350"></video>
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
</script>