<template>
    <div>
        <v-toolbar density="comfortable"
            :style="`background-color: ${mediaBar?.color}; color: ${mediaBar?.colortext} !important`">
            <v-toolbar-title>{{ mediaCenterPage?.name }}</v-toolbar-title>

            <v-spacer></v-spacer>

            <DragDropUpload />
        </v-toolbar>

        <!-- NAVIGATION TABS -->
        <v-card variant="text">
            <v-toolbar :style="`background-color: ${mediaBar?.color}; color: ${mediaBar?.colortext} !important`">
                <v-tabs v-model="tab" align-tabs="center">
                    <v-tab v-for="(menu, index) in mediaBar?.menus" :key="index" :value="menu.value">
                        <v-btn variant="text" :style="`color: ${mediaBar?.colortext} !important`">
                            {{ menu.name }}
                        </v-btn>
                    </v-tab>
                </v-tabs>
            </v-toolbar>
        </v-card>

        <!-- TAB CONTENT -->
        <v-tabs-window v-model="tab">
            <!-- ALL (carousel) -->
            <v-tabs-window-item :value="mediaBar?.menus?.[0]?.value">
                <MediaCarousel :items="allMedia" />
            </v-tabs-window-item>

            <!-- AUDIO -->
            <v-tabs-window-item :value="mediaBar?.menus?.[1]?.value">
                <AudioGallery :items="audioMedia" />
            </v-tabs-window-item>

            <!-- VIDEO -->
            <v-tabs-window-item :value="mediaBar?.menus?.[2]?.value">
                <VideoGallery :items="videoMedia" />
            </v-tabs-window-item>

            <!-- IMAGES -->
            <v-tabs-window-item :value="mediaBar?.menus?.[3]?.value">
                <ImageGallery :items="imageMedia" />
            </v-tabs-window-item>

            <!-- FOLDERS -->
            <v-tabs-window-item :value="mediaBar?.menus?.[4]?.value">
                <MediaFolderSidebar :folders="folders" @create="createFolder" @select="selectFolder"
                    @reorder="reorderFolders" />
            </v-tabs-window-item>

            <!-- SEARCH -->
            <v-tabs-window-item :value="mediaBar?.menus?.[5]?.value">
                <MediaSearchBar @search="searchMedia" />
                <MediaCarousel :items="searchResults" />
            </v-tabs-window-item>

            <!-- SHARED WITH ME (if you have a menu for it) -->
            <v-tabs-window-item :value="mediaBar?.menus?.[6]?.value">
                <MediaCarousel :items="sharedWithMe" />
            </v-tabs-window-item>

            <!-- SMART ALBUMS TAB -->
            <v-tabs-window-item :value="mediaBar?.menus?.[7]?.value">
                <div v-for="album in smartAlbums" :key="album.id" class="mb-6">
                    <h4 class="mb-2">{{ album.label }}</h4>
                    <MediaCarousel :items="album.items" />
                </div>
            </v-tabs-window-item>
        </v-tabs-window>
    </div>
</template>

<script setup>
    import {
        ref
    } from 'vue'
    import ImageGallery from '#shared/app/components/media/imageGallery.vue'
    import VideoGallery from '#shared/app/components/media/videoGallery.vue'
    import AudioGallery from '#shared/app/components/media/audioGallery.vue'
    import MediaCarousel from '#shared/app/components/media/mediaCarousel.vue'
    import MediaFolderSidebar from '#shared/app/components/media/mediaFolderSidebar.vue'
    import MediaSearchBar from '#shared/app/components/media/mediaSearchBar.vue'
    import DragDropUpload from '#shared/app/components/media/dragDropUpload.vue'

    import {
        useMediaCenter
    } from '#shared/app/composables/media/useMediaCenter'

    const {
        allMedia,
        imageMedia,
        videoMedia,
        audioMedia,
        searchResults,
        sharedWithMe,
        folders,
        smartAlbums,

        uploadFiles,
        searchMedia,
        createFolder,
        filterByFolder,
        reorderFolders,
    } = useMediaCenter()

    const selectFolder = (folder) => {
        filterByFolder(folder?.id || null)
    }

    const {
        $directus,
        $readItem
    } = useNuxtApp()
    const tab = ref(null)

    const {
        data: mediaBar
    } = await useAsyncData('mediaBar', () =>
        $directus.request(
            $readItem('navigation', '81', {
                fields: ['*', {
                    menus: ['*']
                }],
            })
        )
    )

    const {
        data: mediaCenterPage
    } = await useAsyncData('mediaCenterPage', () =>
        $directus.request(
            $readItem('pages', '100', {
                fields: ['*'],
            })
        )
    )

    useHead({
        title: 'Meeovi Media Center'
    })
</script>