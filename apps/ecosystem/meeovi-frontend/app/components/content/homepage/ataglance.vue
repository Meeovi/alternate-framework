<template>
    <div v-if="blocks && !blocks.hide_block && items.length">
        <section data-bs-version="5.1" class="content2 cid-skeBU2vAkT" id="content2-8">
            <div class="container">
                <h2 v-if="blocks.name" class="mbr-section-title mbr-fonts-style align-center mb-4 display-2">
                    <strong>{{ blocks.name }}</strong>
                </h2>

                <h4 v-if="blocks.description" class="mbr-section-subtitle mbr-fonts-style align-center mb-4 display-7">
                    {{ blocks.description }}
                </h4>

                <!-- One card per item in the block's Content list, laid out by its
                     Layout field: adding, removing or reordering items in
                     Directus, or changing the layout, needs no rebuild. -->
                <div class="row mt-4" :class="`ataglance--${layout}`">
                    <div v-for="(item, i) in items" :key="i" class="item features-image" :class="columnClass">
                        <div class="item-wrapper">
                            <div class="item-img">
                                <NuxtImg provider="cloudinary" loading="lazy" :src="imageFor(i)" :alt="item.name || blocks.name" />
                            </div>
                            <div class="item-content">
                                <h3 v-if="item.name" class="item-title mbr-fonts-style display-5">
                                    {{ item.name }}
                                </h3>
                                <h4 v-if="item.subtitle" class="item-subtitle mbr-fonts-style mt-1 display-7">
                                    <strong>{{ item.subtitle }}</strong>
                                </h4>
                                <div v-if="item.content" class="mbr-text mbr-fonts-style mt-3 display-7" v-dompurify-html="item.content">
                                </div>
                            </div>
                            <div v-if="item.url" class="mbr-section-btn item-footer mt-2">
                                <NuxtLink :to="item.url" class="btn item-btn btn-primary display-7">
                                    {{ item.url_name || 'Learn more' }} &gt;
                                </NuxtLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
  import { reuseServerData } from '#shared/app/utils/reuseServerData'
    const { $directus, $readItem } = useNuxtApp()

    import { getAssetURL } from '#shared/app/utils/get-asset-url'

    // lazy: true — see headerslider.vue's comment on the same pattern.
    const {
        data: blocks
    } = useAsyncData('blocks', async () => {
        try {
            const resp = await $directus.request($readItem('page_blocks', '2', {
                // page_blocks_files has no `file` field (it's directus_files_id),
                // so 'media.file.*' left media as bare junction ids → /assets/4.
                fields: ['*', 'media.*.*', 'content.*'],
            }))
            return resp?.data || resp || null
        } catch {
            return null
        }
    }, { getCachedData: reuseServerData, lazy: true })

    const items = computed(() => (Array.isArray(blocks.value?.content) ? blocks.value.content : []).filter(Boolean))

    // The block's `layout` field (a dropdown in Directus). Unknown or empty
    // values fall back to three columns, the original design.
    const LAYOUTS = {
        'columns-3': 'col-12 col-md-6 col-lg-4',
        'columns-2': 'col-12 col-md-6',
        'columns-4': 'col-12 col-md-6 col-lg-3',
        list: 'col-12',
    }
    const layout = computed(() => (LAYOUTS[blocks.value?.layout] ? blocks.value.layout : 'columns-3'))
    const columnClass = computed(() => LAYOUTS[layout.value])

    // Pictures come from the block's Media files, in order: the first item
    // gets the first file. Items without one get the stock pictures.
    function imageFor(i) {
        return getAssetURL(blocks.value?.media?.[i]) || `/images/display-${(i % 3) + 1}.png`
    }
</script>

<style scoped>
    /* List layout: picture beside the text on wider screens. */
    @media (min-width: 768px) {
        .ataglance--list .item-wrapper {
            display: grid;
            grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
            grid-template-rows: 1fr auto;
            column-gap: 1.5rem;
        }

        .ataglance--list .item-img {
            grid-row: 1 / span 2;
        }
    }
</style>
