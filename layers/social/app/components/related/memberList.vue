<template>
    <v-card class="mx-auto" max-width="400">
        <img v-if="member?.avatar?.filename_disk" class="align-end auto-text" height="200" :src="`${$directus.url}assets/${member?.avatar?.filename_disk}`"  :alt="member?.first_name" />

        <img v-else class="align-end auto-text" height="200" src="assets/images/face7.jpg" :alt="member?.first_name" />
            <v-card-title>{{ member?.first_name }} {{ member?.last_name }}</v-card-title>

        <v-card-subtitle class="pt-4">
            {{ member?.title }}
        </v-card-subtitle>

        <v-card-text>
            <div>{{ member?.language }}</div>

            <div>{{ member?.location }}</div>
        </v-card-text>

        <v-card-actions>
            <v-btn color="orange" text="Add Friend" :href="`/user/${member?.id}`"></v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup>
  const {
        $directus
    } = useNuxtApp()
    
    const props = defineProps({
        member: {
            type: Object,
            required: true,
        },
    });
    const {
        member
    } = props;
</script>