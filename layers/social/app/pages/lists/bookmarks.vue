<template>
    <div class="contentPage">
        <v-toolbar color="green">
            <v-toolbar-title>Bookmarks</v-toolbar-title>

            <v-toolbar-items>
                <createList style="top: 20px; position: relative;" class="createListsToolbarItems" />
            </v-toolbar-items>
        </v-toolbar>

        <v-row>
            <v-col v-for="bookmark in bookmarks" :key="bookmark">
                <listCard :list="bookmark" />
            </v-col>
        </v-row>
    </div>
</template>

<script setup>
    import listCard from '#social/app/components/related/list.vue'
    import createList from '#social/app/components/blocks/partials/listBtn.vue'

    const {
        $directus,
        $readItem,
        $readItems
    } = useNuxtApp()

    const model = ref(null)

    const {
        data: bookmarks
    } = await useAsyncData('bookmarks', async () => {
        const resp = await $directus.request($readItems('lists', {
            filter: {
                lists_type: {
                    lists_type_id: {
                        name: {
                            _eq: 'Bookmarks'
                        }
                    }
                }
            }
        }))
        return resp?.data || resp || []
    })

    useHead({
        title: 'Bookmarks'
    })
</script>