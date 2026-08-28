<template>
    <v-card class="mx-auto" max-width="400" :href="member?.username ? `/u/${member.username}` : undefined">
        <v-img class="align-end text-white" height="200"
            :src="getAssetURL(member?.avatar) || 'https://placehold.net/avatar-5.png'"></v-img>

        <v-card-title style="text-align: center;">{{ member?.name }}</v-card-title>

        <v-card-subtitle style="text-align: center;">
            <v-icon icon="fas fa-location-dot" size="x-small">{{ member?.city?.cities_id?.name }}, {{ member?.country?.countries_id?.name }}</v-icon>
            <br>
            <br>
            <v-chip v-if="member?.profession" label>{{ member?.profession }}</v-chip>
        </v-card-subtitle>

        <v-card-text>
            <v-toolbar color="transparent">
                <div class="memberDetails">
                    <v-list>
                        <v-list-item :title="member?.lists?.length" subtitle="Lists"></v-list-item>
                    </v-list>

                    <v-divider inset vertical></v-divider>

                    <v-list>
                        <v-list-item :title="member?.follow?.length" subtitle="Followers"></v-list-item>
                    </v-list>

                    <v-divider inset vertical></v-divider>

                    <v-list>
                        <v-list-item :title="member?.products?.length" subtitle="Products"></v-list-item>
                    </v-list>
                </div>
            </v-toolbar>
        </v-card-text>

        <v-card-actions>
            <FollowButton :id="member?.id" entity-type="user" />

            <v-btn color="orange" :href="member?.username ? `/u/${member.username}` : undefined" text="Visit Profile"></v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup>
    import {
        getAssetURL
    } from '#shared/app/utils/get-asset-url'
    import FollowButton from './FollowButton.vue'

    const props = defineProps({
        member: {
            type: Object,
            default: null,
        }
    })
</script>