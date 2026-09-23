<template>
    <v-toolbar class="pagebar">
        <v-toolbar-title>
            <div class="listsToolbarTitle">
                {{ list }} &emsp;

                <v-tooltip interactive>
                    <template v-slot:activator="{ props: activatorProps }">
                        <v-icon-btn size="small" icon="fas fa-circle-info" v-bind="activatorProps"></v-icon-btn>
                    </template>
                    <div>
                        <p class="listsToolbarTooltip" v-dompurify-html="listBarMenus?.description"></p>
                    </div>
                </v-tooltip>
            </div>
        </v-toolbar-title>

        <v-toolbar-items>
            <v-tabs show-arrows>
                <div class="pagebarTabs" v-for="(menu, index) in listBarMenus"
                    :key="menu?.id || menu?.url || menu?.name || index">
                    <v-tab>
                        <starred />
                    </v-tab>
                    <v-tab>
                        <bookmarks />
                    </v-tab>
                    <v-tab>
                        <archived />
                    </v-tab>
                    <v-tab>
                        <createList style="top: 20px; position: relative;" class="createListsToolbarItems" />
                    </v-tab>
                </div>
            </v-tabs>
        </v-toolbar-items>
    </v-toolbar>
</template>

<script setup>
    import {
        computed,
        ref
    } from 'vue'
    import starred from '../lists/starred.vue'
    import archived from '../lists/archived.vue'
    import bookmarks from '../lists/bookmarks.vue'
    import createList from '#social/app/components/blocks/partials/listBtn.vue'

    const tab = ref(null)

    const props = defineProps({
        list: {
            type: String,
            required: true,
        },
    });

    const {
        $directus,
        $readItem,
    } = useNuxtApp()

    const {
        data: listBar
    } = await useAsyncData('listBar', async () => {
        const item = await $directus.request($readItem('navigation', '46', {
            fields: ['*', {
                '*': ['*'],
            }],
        }))
        return item?.data || item || {
            menus: []
        }
    })

    const listBarMenus = computed(() => Array.isArray(listBar.value?.menus) ? listBar.value.menus : [])
</script>