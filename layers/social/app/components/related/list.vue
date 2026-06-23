<template>
    <div>
        <div class="item-wrapper card_1">
            <div class="item-content">
                <h4 class="item-title_1 mbr-fonts-style display-7">
                    <strong>{{ list?.name }}</strong>
                </h4>
                <p class="item-text_1 mbr-fonts-style display-4" v-dompurify-html="list?.description"></p>
                <div class="mbr-section-btn item-footer">
                    <NuxtLink :to="`/lists/list/${list?.slug}`" class="btn item-btn btn-info-outline display-4">
                        View
                    </NuxtLink>
                </div>
            </div>
            <div class="item-img" v-if="list?.image">
                <NuxtImg provider="cloudinary" :src="$sdk.media?.getAssetUrl?.(list?.image)" :alt="list?.name" />
            </div>

            <div class="item-img" v-else>
                <NuxtImg provider="cloudinary" src="https://via.placeholder.com/400x300" :alt="list?.name" />
            </div>
        </div>
    </div>
</template>

<script setup>

    defineProps({
        list: {
            type: Object,
            required: true,
        },
    })

    const { $sdk } = useNuxtApp()
</script>