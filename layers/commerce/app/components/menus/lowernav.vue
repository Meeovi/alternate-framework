<template>
    <div>
        <v-card variant="text" class="lowerBar">
            <v-tabs v-model="tab" :bg-color="lowerbar?.color" :color="lowerbar?.colortext" align-tabs="center">
                <v-tab>
                    <NuxtLink style="color: black;" to="/">{{ lowerbar?.name }}</NuxtLink>
                </v-tab>
                <div v-for="(menu, index) in lowerbar?.menus" :key="index">
                    <v-tab :value="menu?.value">
                        <v-btn variant="text" :style="`color: ${lowerbar?.colortext} !important`"
                            :href="menu?.slug">{{ menu?.name }}</v-btn>
                    </v-tab>
                </div>

                <v-btn variant="text" prepend-icon="fas fa-plus" class="lowerBarBtn">
                    Add

                    <v-menu activator="parent">
                        <v-list lines="two">
                            <v-list-item>
                                <!--<addList />-->
                            </v-list-item>

                            <v-list-item>
                                <!--<addBookmark />-->
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </v-btn>
            </v-tabs>
        </v-card>

        <!--<v-tabs-window v-model="tab">
            <v-tabs-window-item :value="lowerbar?.menus?.[0]?.value">
                <myLists />
            </v-tabs-window-item>
            <v-tabs-window-item :value="lowerbar?.menus?.[1]?.value">
                <bookmarks />
            </v-tabs-window-item>
            <v-tabs-window-item :value="lowerbar?.menus?.[2]?.value">
                <starredLists />
            </v-tabs-window-item>
            <v-tabs-window-item :value="lowerbar?.menus?.[3]?.value">
                <archivedLists />
            </v-tabs-window-item>
        </v-tabs-window>-->
    </div>
</template>

<script setup>
    import {
        ref
    } from 'vue'
    //import addList from '~/components/related/add-list.vue'
    //import addBookmark from '~/components/related/add-bookmark.vue'
    //import myLists from '~/components/features/lists.vue'
    //import bookmarks from '~/components/features/bookmarks.vue'
    //import starredLists from '~/components/features/starred.vue'
    //import archivedLists from '~/components/features/archived.vue'

    const tab = ref(null);

    const {
        $directus,
        $readItem
    } = useNuxtApp()
    const route = useRoute()

    const {
        data: lowerbar
    } = await useAsyncData('lowerbar', () => {
        return $directus.request($readItem('navigation', '46', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })
</script>