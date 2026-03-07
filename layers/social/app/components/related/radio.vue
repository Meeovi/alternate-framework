<template>
    <div>
        <v-card color="#b02564">
            <div class="d-flex flex-no-wrap justify-space-between">
                <div>
                    <template #title class="text-h5">
                        {{ radio?.name }}
                    </template>

                    <v-card #header>{{ radio?.description }}</v-card>

                    <template>
                        <v-btn class="ms-2" size="small" text="LISTEN" variant="outlined"
                            :href="`/departments/categories/station/${radio?.id}`"></v-btn>
                    </template>
                </div>

                <UAvatar class="ma-3" rounded="0" size="125">
                    <NuxtImg :src="getAssetUrl(radio?.image)" />
                </UAvatar>
            </div>
        </v-card>
    </div>
</template>

<script setup>
    const props = defineProps({
        radio: {
            type: Object,
            required: true,
        },
    });
    const {
        radio
    } = props;
import useAdapterRequest from '~/composables/useAdapterRequest'
const { getAssetUrl } = useAdapterRequest()
</script>