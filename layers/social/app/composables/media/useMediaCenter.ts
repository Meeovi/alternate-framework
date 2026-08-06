import { getAssetURL } from '#shared/app/utils/get-asset-url'
import { ref, computed, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import {
	Filemanager,
	Willow,
	Tooltip,
	getMenuOptions,
} from '@svar-ui/vue-filemanager'
import '@svar-ui/vue-filemanager/all.css'

export function useMediaCenter() {
	const api = ref<any>(null)
	const rawdata = shallowRef<any[]>([])
	const drive = ref<{ used?: number; total?: number }>({})
	const fileInput = ref<HTMLInputElement | null>(null)
	const currentUserId = ref<string | null>(null)
	const mediaBarData = ref<any>(null)
	const uploadError = ref<string | null>(null)
	const refreshing = ref(false)

	// Maps SVAR virtual path ID back to Directus file/folder primary keys
	const pathToId = new Map<string, string | number>()

	const QUOTA = Number(import.meta.env.NUXT_MEDIA_QUOTA || 0)

	// Panels mode: single root panel.
	const panels = [
		{ path: '/', selected: [] as string[] },
	]

	// ---- Data loading ----------------------------------------------------

	async function loadUserData() {
		try {
			console.log('[MediaCenter] loadUserData: starting')
			if (!currentUserId.value) {
			const session = (await $fetch('/api/auth/get-session')) as any
			currentUserId.value = session?.user?.id || null
				console.log('[MediaCenter] loadUserData: session userId', currentUserId.value)
			}

			if (!currentUserId.value) {
				console.warn('[MediaCenter] loadUserData: no user session')
				return
			}

			const data = await $fetch('/api/media/list') as any
			console.log('[MediaCenter] loadUserData: received', data.files?.length, 'files,', data.folders?.length, 'folders')
			const files = data.files || []
			const folders = data.folders || []

			const folderNameMap = new Map<number | string, string>()
			folders.forEach((f: any) => folderNameMap.set(String(f.id), f.name))

			const entities: any[] = []

			// Root entry — Filemanager generates its own root internally,
			// but we expose one so our `provide-data` for "/" is explicit.
			entities.push({
				id: '/',
				value: 'Root',
				type: 'folder',
				pId: 0,
			})

			// User folders
			folders.forEach((f: any) => {
				const folderPath = `/${f.name}`
				pathToId.set(folderPath, f.id)

				entities.push({
					id: folderPath,
					value: f.name,
					type: 'folder',
					pId: '/',
					size: 0,
					date: f.date_created ? new Date(f.date_created) : new Date(),
				})
			})

			// User media files
			files.forEach((file: any) => {
				const folderId = file.folder?.id ?? file.folder
				const folderName = folderId != null ? folderNameMap.get(String(folderId)) : null

				const parentPath = folderName ? `/${folderName}` : '/'
				const name = file.filename_download || file.title || `file-${file.id}`
				const fullPath = parentPath === '/' ? `/${name}` : `${parentPath}/${name}`

				pathToId.set(fullPath, file.id)

				entities.push({
					id: fullPath,
					value: name,
					type: 'file',
					pId: parentPath,
					size: Number(file.filesize || 0),
					date: file.date_created ? new Date(file.date_created) : new Date(),
					title: file.title || name,
					mime: file.type || '',
					directus_id: file.id,
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
			console.log('[MediaCenter] loadUserData: complete, entities', entities.length, 'used', used)
		} catch (error) {
			console.error('[MediaCenter] loadUserData error:', error)
		}
	}

	// ---- Filemanager helpers ---------------------------------------------

	function menuOptions(mode: string, item?: any) {
		// Start from the built-in defaults so upload/add/paste/copy/move
		// hotkeys and actions keep working.
		const defaults = getMenuOptions(mode as any) as any[]

		if (mode === 'body' || mode === 'multiselect' || mode === 'add') {
			return defaults
		}

		return [
			...defaults,
			{ comp: 'separator' },
			{
				id: 'open-new-tab',
				text: 'Open in new tab',
				icon: 'wxi-external-link',
				hotkey: 'Ctrl+Enter',
				handler: ({ context }: any) => {
					const directusId = pathToId.get(context?.id) || context?.directus_id
					if (directusId) {
						const link = getAssetURL(directusId)
						if (link) window.open(link, '_blank')
					}
				},
			},
		]
	}

	function previews(file: any) {
		if (file?.type !== 'file') return null
		const directusId = pathToId.get(file.id) || file.directus_id
		if (!directusId) return null

		const url = getAssetURL(directusId)
		const mime = String(file.mime || '').toLowerCase()

		if (
			url &&
			(mime.startsWith('image/') ||
				String(file.id).match(/\.(jpg|jpeg|png|webp|gif)$/i))
		) {
			return url
		}
		return null
	}

	function icons(file: any, size: 'big' | 'small' = 'big') {
		const mime = String(file?.mime || '').toLowerCase()
		if (mime.startsWith('image/')) return 'wxi-image'
		if (mime.startsWith('video/')) return 'wxi-video'
		if (mime.startsWith('audio/')) return 'wxi-audio'
		if (file?.type === 'folder') return 'wxi-folder'
		return 'wxi-file'
	}

	function extraInfo(file: any) {
		const directusId = pathToId.get(file.id) || file.directus_id
		const url = directusId ? getAssetURL(directusId) : ''
		const isFolder = file.type === 'folder'

		return {
			Size: file.size ? `${Math.round(file.size / 1024)} KB` : '—',
			Count: isFolder ? 'Folder' : file.mime || 'File',
			Preview:
				url && !isFolder
					? `<img src="${url}" style="max-width:100%; max-height:150px; object-fit:contain;"/>`
					: '—',
			Type: file.mime || (isFolder ? 'Folder' : 'File'),
			Modified: file.date ? new Date(file.date).toLocaleString() : '—',
			Link: url ? `<a href="${url}" target="_blank">View File</a>` : '—',
		}
	}

	// ---- Lifecycle & action handlers -------------------------------------

	function init(apiInstance: any) {
		api.value = apiInstance

		// Lazy-load folder contents from our pre-loaded flat list.
		apiInstance.on('request-data', ({ id }: any) => {
			const targetId = id || '/'
			const items = rawdata.value.filter((e) => e.pId === targetId)

			apiInstance.exec('provide-data', {
				id: targetId,
				data: items,
			})
		})

	// Built-in upload + create-file: persist the file to Directus,
	// then refresh the filemanager view so the new entity appears.
	apiInstance.on('create-file', async ({ file, parent }: any) => {
		if (!file?.file) return

		const targetFolder = parseFolderName(parent)

		const formData = new FormData()
		formData.append('file', file.file)
		if (targetFolder) {
			const folderId = await ensureFolder(targetFolder)
			if (folderId) formData.append('folder', String(folderId))
		}

		try {
			console.log('[MediaCenter] create-file: uploading', file.file.name, 'to', targetFolder || 'root')
			const result = await $fetch('/api/media/upload', {
				method: 'POST',
				body: formData,
			})
			console.log('[MediaCenter] create-file: upload success', result)
			uploadError.value = null
			await loadUserData()
			refreshFilemanagerView()
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Upload failed'
			console.error('[MediaCenter] create-file: upload failed', err)
			uploadError.value = message
		}
	})

		apiInstance.on('rename-file', async (ev: any) => {
			const directusId = pathToId.get(ev.id)
			if (!directusId) return
			const newTitle = String(ev.name || '').split('/').pop()
			try {
				console.log('[MediaCenter] rename-file:', directusId, '→', newTitle)
				await $fetch('/api/media/rename', {
					method: 'PATCH',
					body: { id: directusId, title: newTitle },
				})
				await loadUserData()
				refreshFilemanagerView()
			} catch (err: any) {
				console.error('[MediaCenter] rename-file failed:', err)
			}
		})

		apiInstance.on('delete-files', async (ev: any) => {
			const ids = Array.isArray(ev.id) ? ev.id : [ev.id]
			const directusIds = ids.map((id: string) => pathToId.get(id)).filter(Boolean)
			if (!directusIds.length) return
			try {
				console.log('[MediaCenter] delete-files:', directusIds)
				await $fetch('/api/media/delete', {
					method: 'DELETE',
					body: { ids: directusIds },
				})
				await loadUserData()
				refreshFilemanagerView()
			} catch (err: any) {
				console.error('[MediaCenter] delete-files failed:', err)
			}
		})

		apiInstance.on('move-files', async (ev: any) => {
			const ids = Array.isArray(ev.id) ? ev.id : [ev.id]
			const targetFolder = parseFolderName(ev.target)
			try {
				for (const pathId of ids) {
					const directusId = pathToId.get(pathId)
					if (!directusId) continue
					const folderId = targetFolder ? await ensureFolder(targetFolder) : null
					await $fetch('/api/media/rename', {
						method: 'PATCH',
						body: { id: directusId, folder: folderId },
					})
				}
				await loadUserData()
				refreshFilemanagerView()
			} catch (err: any) {
				console.error('[MediaCenter] move-files failed:', err)
			}
		})

		apiInstance.on('copy-files', async (ev: any) => {
			const ids = Array.isArray(ev.id) ? ev.id : [ev.id]
			const targetFolder = parseFolderName(ev.target)
			try {
				for (const pathId of ids) {
					const directusId = pathToId.get(pathId)
					if (!directusId) continue
					// Re-upload as copy: fetch original, then upload clone to target.
					// For now we refresh the view; a true clone would need a
					// dedicated server endpoint.
					await loadUserData()
					refreshFilemanagerView()
				}
			} catch (err: any) {
				console.error('[MediaCenter] copy-files failed:', err)
			}
		})

		apiInstance.on('open-file', (ev: any) => {
			const directusId = pathToId.get(ev.id) || ev.directus_id
			if (directusId) {
				const link = getAssetURL(directusId)
				if (link) window.open(link, '_blank')
			}
		})

		apiInstance.on('download-file', (ev: any) => {
			const directusId = pathToId.get(ev.id) || ev.directus_id
			if (directusId) {
				const link = `${getAssetURL(directusId)}?download=true`
				if (link) window.open(link, '_self')
			}
		})
	}

	// ---- Upload helpers --------------------------------------------------

	async function handleUpload(fileList: FileList | File | File[], targetFolderPath?: string) {
		const files = Array.isArray(fileList) ? fileList : fileList instanceof FileList ? Array.from(fileList) : [fileList]
		if (!files.length) return

		const targetFolder = parseFolderName(targetFolderPath)

		const formData = new FormData()
		files.forEach((f) => formData.append('file', f))
		if (targetFolder) {
			const folderId = await ensureFolder(targetFolder)
			if (folderId) formData.append('folder', String(folderId))
		}

		try {
			console.log('[MediaCenter] handleUpload: uploading', files.map(f => f.name), 'to', targetFolder || 'root')
			const result = await $fetch('/api/media/upload', {
				method: 'POST',
				body: formData,
			})
			console.log('[MediaCenter] handleUpload: upload success', result)
			uploadError.value = null
			await loadUserData()
			refreshFilemanagerView()
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Upload failed'
			console.error('[MediaCenter] handleUpload: upload failed', err)
			uploadError.value = message
		}
	}

	function triggerUpload() {
		console.log('[MediaCenter] triggerUpload: fileInput is', fileInput.value ? 'ready' : 'NULL')
		fileInput.value?.click()
	}

	async function onFilePicked(e: Event) {
		const target = e.target as HTMLInputElement
		console.log('[MediaCenter] onFilePicked: files count', target.files?.length)
		if (target.files?.length) {
			// Determine the current panel path so uploads land in the right folder.
			const currentPath = api.value?.getState?.()?.panels?.[api.value?.getState?.()?.activePanel ?? 0]?.path || '/'
			console.log('[MediaCenter] onFilePicked: currentPath', currentPath)
			await handleUpload(target.files, currentPath)
			target.value = ''
		}
	}

	function refreshFilemanagerView() {
		if (!api.value || refreshing.value) return
		refreshing.value = true
		const state = api.value.getState?.()
		const activePanel = state?.panels?.[state?.activePanel ?? 0]
		const currentPath = activePanel?.path || '/'
		console.log('[MediaCenter] refreshFilemanagerView: path', currentPath, 'items', rawdata.value.filter((e) => e.pId === currentPath).length)
		api.value.exec('provide-data', {
			id: currentPath,
			data: rawdata.value.filter((e) => e.pId === currentPath),
		})
		// Reset the flag after a short delay to allow the Filemanager to process the data
		// without triggering a recursive request-data → provide-data loop.
		setTimeout(() => { refreshing.value = false }, 100)
	}

	function parseFolderName(path?: string): string | null {
		if (!path || path === '/' || path === '') return null
		return String(path).replace(/^\//, '').split('/')[0] || null
	}

	function clearUploadError() {
		uploadError.value = null
	}

	async function ensureFolder(name: string): Promise<string | number | null> {
		if (!currentUserId.value) return null

		try {
			console.log('[MediaCenter] ensureFolder:', name)
		const created = (await $fetch('/api/media/folders', {
			method: 'POST',
			body: { name },
		})) as any
		console.log('[MediaCenter] ensureFolder: result', created?.id)
		return created?.id ?? null
		} catch (err: any) {
			console.error('[MediaCenter] ensureFolder failed:', err)
			return null
		}
	}

	onMounted(async () => {
		console.log('[MediaCenter] onMounted: starting')
		// Load navigation bar data.
		try {
			const { $directus, $readItem } = useNuxtApp() as any
			mediaBarData.value = await $directus.request(
				$readItem('navigation', '81', {
					filter: {
						menus: {
							active: {
								_eq: 'Active',
							},
						},
					},
				}),
			)
			console.log('[MediaCenter] onMounted: mediaBar loaded')
		} catch (e) {
			console.error('[MediaCenter] onMounted: mediaBar load failed', e)
		}

		await loadUserData()
		refreshFilemanagerView()
		console.log('[MediaCenter] onMounted: complete')
	})

	onBeforeUnmount(() => {
		if (api.value) {
			api.value.detach?.('request-data')
			api.value.detach?.('create-file')
			api.value.detach?.('rename-file')
			api.value.detach?.('delete-files')
			api.value.detach?.('move-files')
			api.value.detach?.('copy-files')
			api.value.detach?.('open-file')
			api.value.detach?.('download-file')
		}
	})

	return {
		api,
		rawdata,
		drive,
		fileInput,
		currentUserId,
		panels,
		mediaBarData,
		uploadError,
		loadUserData,
		menuOptions,
		previews,
		icons,
		extraInfo,
		init,
		handleUpload,
		triggerUpload,
		onFilePicked,
		refreshFilemanagerView,
		parseFolderName,
		ensureFolder,
		clearUploadError,
	}
}
