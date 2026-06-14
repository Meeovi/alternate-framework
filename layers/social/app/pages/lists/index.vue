<template>
    <div>
        <v-toolbar color="green">
            <v-toolbar-title>
                <div class="listsToolbarTitle">
                    {{ page?.name }}
                    <v-tooltip interactive>
                        <template v-slot:activator="{ props: activatorProps }">
                            <v-icon-btn size="small" icon="fas fa-circle-info" v-bind="activatorProps"></v-icon-btn>
                        </template>
                        <div>
                            <p class="listsToolbarTooltip" v-dompurify-html="page?.content"></p>
                        </div>
                    </v-tooltip>
                </div>
            </v-toolbar-title>

            <v-toolbar-items>
                <createList class="createListsToolbarItems" />
            </v-toolbar-items>
        </v-toolbar>

        <v-sheet class="mx-auto sliderLists row align-items-stretch items-row justify-content-center">
            <v-toolbar color="transparent">
                <v-toolbar-title>{{ page?.repeaterTextBox?.[0]?.name }}</v-toolbar-title>
            </v-toolbar>
            <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
                <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="(list, index) in myLists"
                    :key="index">
                    <listCard :class="['ma-4', selectedClass]" :list="list" v-if="isSelected" @click="toggle" />
                </v-slide-group-item>
            </v-slide-group>
        </v-sheet>

        <RelatedLists />

        <v-sheet class="mx-auto sliderLists row align-items-stretch items-row justify-content-center">
            <v-toolbar color="transparent">
                <v-toolbar-title>{{ page?.repeaterTextBox?.[2]?.name }}</v-toolbar-title>
            </v-toolbar>
            <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
                <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
                    v-for="(bookmarks, index) in myBookmarks" :key="index">
                    <listCard :class="['ma-4', selectedClass]" :list="bookmarks" v-if="isSelected" @click="toggle" />
                </v-slide-group-item>
            </v-slide-group>
        </v-sheet>
    </div>
</template>

<script setup>
    import {
        ref,
        computed
    } from '#imports'
    import listCard from '#social/app/components/related/list.vue'
    import RelatedLists from '#social/app/components/related/relatedlists.vue'
    import createList from '#social/app/components/features/lists/add-list.vue'
    import {
        useUsers
    } from '#auth/app/composables/users'

    import {
        useLists
    } from '#social/app/composables/lists/useLists'
    import {
        normalizeListRecord
    } from '#social/app/composables/content/socialMappers'
    import {
        useRoute
    } from 'vue-router'

    const model = ref(null)

    const { $directus, $readItems, $readItem } = useNuxtApp()
    
    const directusUrl = useDirectusUrl?.()
    const hasAsset = (file) => Boolean(getAssetUrl(file))

    const opts = {
        fields: ['*', 'category.categories_id.*', 'department.departments_id', 'user.user.*',
            'image.*'
        ],
        limit: 50
    }

    const {
        data: allLists
    } = await useAsyncData('allLists', async () => {
        return $directus.request($readItems('lists', opts))
    })

    const {
        data: myLists
    } = await useAsyncData('myLists', async () => {
        return $directus.request($readItems('lists', {
            ...opts,
            filter: {
                user: {
                    _neq: 'null'
                }
            }
        }))
    })

    const {
        data: myBookmarks
    } = await useAsyncData('myBookmarks', async () => {
        return $directus.request($readItems('lists', {
            ...opts,
            filter: {
                type: {
                    _eq: 'bookmarks'
                }
            }
        }))
    })

    const {
        data: page
    } = await useAsyncData('page', () => {
        return $directus.request($readItems('pages', {
            filter: {
                id: {
                    _eq: 40
                }
            },
            fields: ['*'],
            limit: 1
        })).then(response => (response?.data?.[0] || response?.[0]) ?? null)
    })

    useHead({
        title: () => page?.value?.name || 'Page',
    })
</script>
