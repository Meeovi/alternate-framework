<template>
    <v-card class="mx-auto" max-width="400">
        <img v-if="member?.avatar?.filename_disk" class="align-end auto-text" height="200" :src="getAssetUrl(member?.avatar)"  :alt="member?.first_name" />

        <img v-else class="align-end auto-text" height="200" src="https://via.placeholder.com/200" :alt="member?.first_name" />
        <template #header>{{ member?.first_name }} {{ member?.last_name }}</template>

        <v-card-text class="pt-4">
            {{ member?.title }}
        </v-card-text>

        <template>
            <div>{{ member?.language }}</div>

            <div>{{ member?.location }}</div>
        </template>

        <template>
            <v-btn color="orange" text="Add Friend" :href="`/user/${member?.id}`"></v-btn>
        </template>
    </v-card>
</template>

<script setup>
import useAdapterRequest from '~/composables/useAdapterRequest'
const { getAssetUrl } = useAdapterRequest()
    
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