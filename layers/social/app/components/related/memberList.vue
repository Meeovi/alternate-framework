<template>
    <v-card class="mx-auto" max-width="400">
        <img v-if="hasAsset(member?.avatar)" class="align-end auto-text" height="200" :src="getAssetUrl(member?.avatar)"  :alt="member?.first_name" />
        <template>{{ member?.first_name }} {{ member?.last_name }}</template>

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
 const { getAssetUrl } = useContent()
const hasAsset = (file) => Boolean(getAssetUrl(file))
    
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
import useContent from '#shared/app/composables/content/useContent'
