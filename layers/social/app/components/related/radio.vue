<template>
    <div>
        <v-card color="#b02564">
            <div class="d-flex flex-no-wrap justify-space-between">
                <div>
                    <v-card-title class="text-h5">
                        {{ radio?.name }}
                    </v-card-title>

                    <v-card-text>
                        {{ radio?.description }}
                    </v-card-text>

                    <div class="px-4 pb-2">
                        <MeeoviRating v-if="radio?.id" type="station" :id="radio.id" summary />
                    </div>

                    <v-btn class="ms-2" size="small" text="LISTEN" variant="outlined"
                        :to="`/connect/station/${radio?.slug || radio?.id}`" />
                </div>

                <v-avatar class="ma-3" rounded="0" size="125">
                    <NuxtImg :src="getAssetURL(radio?.image)" />
                </v-avatar>
            </div>
        </v-card>
    </div>
</template>

<script setup>
    import {
        getAssetURL
    } from '#shared/app/utils/get-asset-url'
    const {
        radio
    } = defineProps({
        radio: {
            type: Object,
            required: true,
        },
    })
</script>