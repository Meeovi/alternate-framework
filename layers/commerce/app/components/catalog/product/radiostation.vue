<template>
    <div>
        <v-card color="accent">
            <div class="d-flex flex-no-wrap justify-space-between">
                <div>
                    <template #title class="text-h5">
                        {{ radio?.name }}
                    </template>

                    <v-card>{{ radio?.description }}</v-card>

                    <template>
                        <v-btn class="ms-2" size="small" text="LISTEN" variant="outlined"
                            :href="`/departments/categories/station/${radio?.id}`"></v-btn>
                    </template>
                </div>

                <v-avatar class="ma-3" :rounded="0" size="125">
                    <NuxtImg :src="getAssetURL(radio?.image)" />
                </v-avatar>
            </div>
        </v-card>
    </div>
</template>



<script setup>
import { getAssetURL } from '#shared/app/utils/get-asset-url'

    const { $sdk } = useNuxtApp()

    const props = defineProps({
        radio: {
            type: Object,
            required: true,
        },
    });
    const {
        radio
    } = props;
</script>