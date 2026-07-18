<template>
    <div>
        <v-toolbar style="background-color: rgb(var(--v-theme-info)) !important;">
            <v-toolbar-title>Media Center</v-toolbar-title>
            <v-spacer />
            <v-btn
                prepend-icon="fas fa-upload"
                variant="tonal"
                @click="triggerUpload"
            >
                Upload
            </v-btn>
            <input
                ref="fileInput"
                type="file"
                multiple
                class="d-none"
                @change="onFilePicked"
            />
        </v-toolbar>

        <ClientOnly>
            <Willow>
                <Tooltip overflow :api="api">
                    <Filemanager
                        ref="api"
                        :data="rawdata"
                        :drive="drive"
                        :menuOptions="menuOptions"
                        :extraInfo="extraInfo"
                        :previews="previews"
                        :icons="icons"
                        :init="init"
                    />
                </Tooltip>
            </Willow>
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
    import { getAssetURL } from '../../../shared/app/utils/get-asset-url'
    import {
        Filemanager,
        Willow,
        Tooltip,
    } from '@svar-ui/vue-filemanager'
    import '@svar-ui/vue-filemanager/all.css'
    import {
        ref,
        computed,
        onMounted,
        onBeforeUnmount,
    } from 'vue'

    const {
        $directus,
        $readItems,
        $updateItem,
        $deleteItem,
        $createItem,
        $uploadFiles,
    } = useNuxtApp() as any

    const api = ref<any>(null)
    const rawdata = ref<any[]>([])
    const drive = ref<{ used?: number; total?: number }>({})
    const fileInput = ref<HTMLInputElement | null>(null)

    // Map a SVAR entity path id (e.g. "/Pictures/cat.png") back to the
    // Directus `media` row id so edits persist to the right record.
    const pathToId = new Map<string, string | number>()

    const QUOTA = Number(import.meta.env.NUXT_MEDIA_QUOTA || 0) // bytes; 0 = unlimited

    // ---- Load user media from Directus ------------------------------------

    async function loadData() {
        const [files, folders] = await Promise.all([
            $directus.request($readItems('media', { sort: ['-date_created'], limit: -1 })) as Promise<any[]>,
            $directus.request($readItems('media_folders', { sort: ['sort', 'name'], limit: -1 })) as Promise<any[]>,
        ])

        const folderName = new Map<number | string, string>()
        folders.forEach((f: any) => folderName.set(String(f.id), f.name))

        const entities: any[] = []

        // Folders first (SVAR renders them as directories).
        folders.forEach((f: any) => {
            const id = `/${f.name}`
            pathToId.set(id, f.id)
            entities.push({
                id,
                type: 'folder',
                date: f.date_created ? new Date(f.date_created) : new Date(),
                size: 0,
            })
        })

        // Files, nested under their folder path when a folder is set.
        files.forEach((file: any) => {
            const folderId = file.folder?.id ?? file.folder
            const folderPrefix = folderId != null && folderName.has(String(folderId))
                ? `/${folderName.get(String(folderId))}`
                : ''
            const name = file.filename_download || file.title || `file-${file.id}`
            const id = `${folderPrefix}/${name}`
            pathToId.set(id, file.id)
            entities.push({
                id,
                type: 'file',
                size: Number(file.filesize || file.size || 0),
                date: file.date_created ? new Date(file.date_created) : new Date(),
                // extra metadata kept on the entity for previews/extraInfo
                title: file.title || name,
                mime: file.mime_type || file.type || '',
            })
        })

        rawdata.value = entities
        const used = entities
            .filter((e) => e.type === 'file')
            .reduce((sum, e) => sum + (Number(e.size) || 0), 0)
        drive.value = {
            used,
            total: QUOTA || undefined,
        }
    }

    // ---- File Manager helpers ---------------------------------------------

    // Thumbnail / preview for image files.
    function previews(file: any) {
        if (file?.type !== 'file') return null
        const id = pathToId.get(file.id)
        const url = getAssetURL(id ?? file.id)
        const mime = String(file.mime || '').toLowerCase()
        if (url && mime.startsWith('image/')) return url
        return null
    }

    function icons(file: any) {
        const mime = String(file?.mime || '').toLowerCase()
        if (mime.startsWith('image/')) return 'wxi-image'
        if (mime.startsWith('video/')) return 'wxi-video'
        if (mime.startsWith('audio/')) return 'wxi-audio'
        if (mime.startsWith('folder')) return 'wxi-folder'
        return 'wxi-file'
    }

    // Side panel with extra file metadata. IExtraInfo requires `Size` + `Count`.
    function extraInfo(file: any) {
        const id = pathToId.get(file.id)
        const url = getAssetURL(id ?? file.id)
        const isFolder = file.type === 'folder'
        return {
            Size: file.size ? `${Math.round(file.size / 1024)} KB` : '—',
            Count: isFolder ? 'folder' : (file.mime || 'file'),
            Preview: url ? `<img src="${url}" style="max-width:100%"/>` : '—',
            Type: file.mime || '—',
            Modified: file.date ? new Date(file.date).toLocaleString() : '—',
            Link: url || '—',
        }
    }

    // Context menu options.
    function menuOptions() {
        return [
            { id: 'open', text: 'Open', icon: 'wxi-eye', hotkey: 'Enter' },
            { id: 'download', text: 'Download', icon: 'wxi-download', hotkey: 'Ctrl+D' },
            { id: 'rename', text: 'Rename', icon: 'wxi-edit', hotkey: 'F2' },
            { id: 'delete', text: 'Delete', icon: 'wxi-trash', hotkey: 'Delete' },
        ]
    }

    function assetLink(idOrPath: any, download = false) {
        const id = pathToId.get(idOrPath) ?? idOrPath
        const url = getAssetURL(id)
        if (!url) return ''
        return download ? `${url}?download` : url
    }

    // ---- Instance API lifecycle -------------------------------------------

    function init(apiInstance: any) {
        api.value = apiInstance

        // Lazy data is already loaded; acknowledge request-data.
        apiInstance.on('request-data', ({ id }: any) => {
            const items = rawdata.value.filter((e) => {
                const parent = id === '/' ? '' : id
                const dir = e.id.substring(0, e.id.lastIndexOf('/'))
                return dir === parent
            })
            apiInstance.exec('provide-data', { id, data: items })
        })

        apiInstance.on('open-file', (ev: any) => {
            const link = assetLink(ev.id)
            if (link) window.open(link, '_blank')
        })

        apiInstance.on('download-file', (ev: any) => {
            const link = assetLink(ev.id, true)
            if (link) window.open(link, '_self')
        })

        apiInstance.on('rename-file', async (ev: any) => {
            const id = pathToId.get(ev.id)
            if (!id) return
            const name = String(ev.name || '').split('/').pop()
            await $directus.request($updateItem('media', id, { title: name }))
            await loadData()
        })

        apiInstance.on('delete-files', async (ev: any) => {
            const ids = Array.isArray(ev.id) ? ev.id : [ev.id]
            for (const pathId of ids) {
                const id = pathToId.get(pathId)
                if (id) await $directus.request($deleteItem('media', id))
            }
            await loadData()
        })

        apiInstance.on('move-files', async (ev: any) => {
            const ids = Array.isArray(ev.id) ? ev.id : [ev.id]
            const targetFolder = parseFolderName(ev.target)
            for (const pathId of ids) {
                const id = pathToId.get(pathId)
                if (!id) continue
                const folder = targetFolder
                    ? await ensureFolder(targetFolder)
                    : null
                await $directus.request($updateItem('media', id, { folder }))
            }
            await loadData()
        })

        apiInstance.on('copy-files', async (ev: any) => {
            // Directus does not duplicate files cheaply; re-upload is the
            // reliable path. We mirror the move behavior for now.
            const ids = Array.isArray(ev.id) ? ev.id : [ev.id]
            const targetFolder = parseFolderName(ev.target)
            for (const pathId of ids) {
                const id = pathToId.get(pathId)
                if (!id) continue
                const folder = targetFolder ? await ensureFolder(targetFolder) : null
                await $directus.request($updateItem('media', id, { folder }))
            }
            await loadData()
        })

        apiInstance.on('upload-file', async (ev: any) => {
            const formData = new FormData()
            const files = Array.isArray(ev?.file) ? ev.file : [ev?.file]
            files.forEach((f: any) => f && formData.append('file', f))
            if (!formData.has('file')) return
            const targetFolder = parseFolderName(ev?.target)
            if (targetFolder) {
                const folder = await ensureFolder(targetFolder)
                formData.append('folder', String(folder))
            }
            await $directus.request($uploadFiles(formData))
            await loadData()
        })
    }

    // ---- Folder helpers ---------------------------------------------------

    function parseFolderName(path?: string): string | null {
        if (!path || path === '/' || path === '') return null
        return String(path).replace(/^\//, '').split('/')[0] || null
    }

    async function ensureFolder(name: string): Promise<string | number | null> {
        const existing = await $directus.request(
            $readItems('media_folders', { filter: { name: { _eq: name } }, limit: 1 })
        )
        if (Array.isArray(existing) && existing.length) return existing[0].id
        const created = await $directus.request($createItem('media_folders', { name }))
        return created?.id ?? null
    }

    // ---- Upload (toolbar button) ------------------------------------------

    function triggerUpload() {
        fileInput.value?.click()
    }

    async function onFilePicked(e: Event) {
        const target = e.target as HTMLInputElement
        const files = target.files
        if (!files || !files.length) return
        const formData = new FormData()
        Array.from(files).forEach((f) => formData.append('file', f))
        await $directus.request($uploadFiles(formData))
        await loadData()
        target.value = ''
    }

    const isAuthenticated = computed(() => Boolean($directus))

    onMounted(async () => {
        if (isAuthenticated.value) {
            await loadData().catch(() => null)
        }
    })

    onBeforeUnmount(() => {
        if (api.value) api.value.detach?.('request-data')
    })

    useHead({
        title: 'Media Center',
    })
</script>
