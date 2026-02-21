<template>
    <div>
        <UCard color="#b02564">
            <div class="d-flex flex-no-wrap justify-space-between">
                <div>
                    <UCard-title class="text-h5">
                        {{ radio?.name }}
                    </template>

                    <UCard-subtitle>{{ radio?.description }}</v-card-subtitle>

                    <template>
                        <UButton class="ms-2" size="small" text="LISTEN" variant="outlined"
                            :href="`/departments/categories/station/${radio?.id}`"></UButton>
                    </template>
                </div>

                <UAvatar class="ma-3" rounded="0" size="125">
                    <NuxtImg :src="`${$directus.url}/assets/${radio?.image?.filename_disk}`" />
                </UAvatar>
            </div>
        </UCard>
    </div>
</template>


import { useCommerceAdapter, useContentAdapter } from '#imports'
void useCommerceAdapter()
void useContentAdapter()

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