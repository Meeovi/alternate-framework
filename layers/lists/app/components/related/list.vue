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
            <div class="item-img" v-if="list?.image?.filename_disk">
                <img :src="`${$directus.url}assets/${list?.image?.filename_disk}`" :alt="list?.name" >
            </div>

            <div class="item-img" v-else>
                <img src="images/image10.jpg" :alt="list?.name" />
            </div>
        </div>
    </div>
</template>

<script setup>
    const props = defineProps({
        list: {
            type: Object,
            required: true,
        },
    });
</script>