<template>
    <v-card class="lowerBar hashtagBar" flat rounded="0"
        :color="lowerbar?.color" :style="{ color: lowerbar?.colortext || undefined }">
        <div class="hashtagBar__inner">
            <NuxtLink v-if="firstName" class="hashtagBar__user" :to="`/u/${session?.user?.id}`">
                {{ hellobar?.description }} {{ firstName }}
            </NuxtLink>

            <div ref="scroller" class="hashtagBar__tags" @scroll.passive="updateOverflow">
                <v-chip v-for="tag in tags" :key="tag.id" class="ma-1" size="small" variant="tonal"
                    :to="`/connect/hashtag/${encodeURIComponent(tag.slug || tag.name)}`">
                    #{{ tag.name || tag.slug }}
                </v-chip>
            </div>

            <v-btn v-if="overflowing" class="hashtagBar__next" icon="fas fa-chevron-right" size="small" variant="text"
                :aria-label="atEnd ? 'Back to the first hashtags' : 'More hashtags'" @click="scrollNext" />
        </div>
    </v-card>
</template>

<script setup>
    // Desktop only: hidden below 960px by the scoped style below, and the
    // apps' own .lowerBar rule may hide it wider still. Not Vuetify's
    // d-none/d-md-flex: the apps' Bootstrap CSS redefines .d-md-flex as
    // !important from 768px, which showed the bar on tablets.
    // The user's name sits outside the scroller, so it stays put while
    // the hashtags scroll past it. (Comments live here rather than in the
    // template: in dev they render as nodes and broke hydration.)
    import {
        computed,
        nextTick,
        onBeforeUnmount,
        onMounted,
        ref,
        watch
    } from 'vue'

    // lazy: true on every call — see LowerBar.vue: this renders in the
    // default layout on nearly every page, so a blocking fetch here would
    // hold up navigation to any page using it.
    const auth = useAuth()
    const { data: session } = useAsyncData('hashtagBarSession', async () => {
        const { data } = await auth.getSession()
        return data
    }, { lazy: true })

    const firstName = computed(() => String(session.value?.user?.name || '').trim().split(/\s+/)[0])

    const {
        $directus,
        $readItem,
        $readItems,
    } = useNuxtApp()

    const { data: tagRows } = useAsyncData('hashtagBarTags', () => {
        return $directus.request($readItems('tags', {
            fields: ['id', 'name', 'slug'],
            filter: { status: { _eq: 'published' } },
            sort: ['sort', 'name'],
            limit: 100,
        }))
    }, { lazy: true, default: () => [] })

    // Some tag names carry stray whitespace; a tag with neither a name nor
    // a slug has nothing to show or link to.
    const tags = computed(() => (tagRows.value || [])
        .map((tag) => ({ ...tag, name: tag?.name?.trim(), slug: tag?.slug?.trim() }))
        .filter((tag) => tag.name || tag.slug))

    // Same navigation rows LowerBar used: 51 = bar colours, 50 = greeting.
    const { data: lowerbar } = useAsyncData('lowerbar', () => {
        return $directus.request($readItem('navigation', '51'))
    }, { lazy: true })

    const { data: hellobar } = useAsyncData('hellobar', () => {
        return $directus.request($readItem('navigation', '50'))
    }, { lazy: true })

    // The scroll button only appears when the tags don't fit; at the end
    // of the row it wraps back to the start.
    const scroller = ref(null)
    const overflowing = ref(false)
    const atEnd = ref(false)

    function updateOverflow() {
        const el = scroller.value
        if (!el) return
        overflowing.value = el.scrollWidth > el.clientWidth + 1
        atEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1
    }

    function scrollNext() {
        const el = scroller.value
        if (!el) return
        if (atEnd.value) el.scrollTo({ left: 0, behavior: 'smooth' })
        else el.scrollBy({ left: el.clientWidth * 0.8, behavior: 'smooth' })
    }

    let resizeObserver = null
    onMounted(() => {
        updateOverflow()
        if (typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(updateOverflow)
            resizeObserver.observe(scroller.value)
        }
    })
    onBeforeUnmount(() => resizeObserver?.disconnect())
    watch(tags, () => nextTick(updateOverflow))
</script>

<style scoped>
    .hashtagBar__inner {
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 48px;
        padding: 0 8px 0 16px;
    }

    @media (max-width: 959.98px) {
        .hashtagBar {
            display: none;
        }
    }

    .hashtagBar__user {
        flex: none;
        color: inherit;
        font-weight: 600;
        text-decoration: none;
        white-space: nowrap;
    }

    .hashtagBar__tags {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-wrap: nowrap;
        overflow-x: auto;
        scrollbar-width: none;
        -webkit-mask-image: linear-gradient(to right, transparent, #000 12px, #000 calc(100% - 24px), transparent);
        mask-image: linear-gradient(to right, transparent, #000 12px, #000 calc(100% - 24px), transparent);
    }

    .hashtagBar__tags::-webkit-scrollbar {
        display: none;
    }

    .hashtagBar__tags .v-chip {
        flex: none;
    }

    .hashtagBar__next {
        flex: none;
    }
</style>
