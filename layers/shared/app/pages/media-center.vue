<template>
    <div>
        <v-toolbar style="background-color: rgb(var(--v-theme-info)) !important;">
            <v-toolbar-title>Media Center</v-toolbar-title>
        </v-toolbar>
        <ClientOnly>
            <Willow>
                <Tooltip overflow :api="api">
                    <Filemanager ref="api" :data="rawdata" :drive="drive" :init="init" />
                </Tooltip>
            </Willow>
        </ClientOnly>
    </div>
</template>

<script setup>
    import {
        Filemanager,
        Willow,
        Tooltip
    } from "@svar-ui/vue-filemanager";
    import "@svar-ui/vue-filemanager/all.css";
    import {
        ref,
        onMounted,
        computed
    } from 'vue'
    import {
        useMediaCenter
    } from '../composables/media/useMediaCenter'
        import {
        useUser
    } from '#commerce/app/composables/useUser'
    import {
        useSession
    } from '#commerce/app/composables/useSession'

    const api = ref()
    const rawdata = ref([])
    const drive = ref({})

    const {
        user
    } = useUser()
    const {
        data: session
    } = useSession()
    const {
        allMedia,
        folders,
        loadMedia,
        loadFolders
    } = useMediaCenter()
    const { $directus } = useNuxtApp()

    const isAuthenticated = computed(() => Boolean(user.value || session?.value?.user))

    function getLink(id, download) {
        return useDirectusUrl?.().replace(/\/$/, '') + '/assets/' + ({
            id
        })
    }

    function loadData(id, apiInstance) {
        const items = allMedia.value
        const item = items.find(i => i.id === id || i.slug === id)
        if (item && apiInstance?.exec) {
            apiInstance.exec("provide-data", {
                id,
                data: [item],
            })
        }
    }

    const init = (apiInstance) => {
        onMounted(() => {
            apiInstance.on("download-file", (ev) => {
                window.open(getLink(ev.id, true), "_self");
            });

            apiInstance.on("open-file", (ev) => {
                window.open(getLink(ev.id), "_blank");
            });

            apiInstance.on("request-data", ({
                id
            }) => loadData(id, apiInstance));
        })
    }

    if (process.client) {
        onMounted(async () => {
            if (isAuthenticated.value) {
                await Promise.all([loadMedia(), loadFolders()].map(p => p.catch(() => null)))
                rawdata.value = allMedia.value
                drive.value = {
                    total: allMedia.value?.length || 0
                }
            }
        })
    }
</script>