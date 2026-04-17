import { ref } from 'vue'
import useContentRequest from '../useContentRequest'

type MediaItem = Record<string, any>

function toList(value: any): MediaItem[] {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.items)) return value.items
  return []
}

function mediaType(item: MediaItem) {
  const mime = String(item?.mime_type || item?.type || item?.file?.type || '').toLowerCase()
  const ext = String(item?.file?.filename_disk || item?.filename_disk || item?.extension || '').toLowerCase()

  if (mime.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(ext)) return 'image'
  if (mime.startsWith('video/') || /\.(mp4|webm|mov|mkv|avi|m3u8)$/i.test(ext)) return 'video'
  if (mime.startsWith('audio/') || /\.(mp3|wav|ogg|aac|flac)$/i.test(ext)) return 'audio'
  return 'other'
}

function includesToken(item: MediaItem, token: string) {
  const haystack = [
    item?.title,
    item?.name,
    item?.description,
    item?.alt,
    item?.filename_download,
    item?.filename_disk,
    item?.tags,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(token)
}

export function useMediaCenter() {
  const request = useContentRequest()
  const allMedia = ref<MediaItem[]>([])
  const imageMedia = ref<MediaItem[]>([])
  const videoMedia = ref<MediaItem[]>([])
  const audioMedia = ref<MediaItem[]>([])
  const searchResults = ref<MediaItem[]>([])
  const sharedWithMe = ref<MediaItem[]>([])
  const folders = ref<MediaItem[]>([])
  const smartAlbums = ref<Array<{ id: string; label: string; items: MediaItem[] }>>([])

  async function loadMedia() {
    const list = toList(await request.readItems('media', { sort: ['-date_created'] }))
    allMedia.value = list
    imageMedia.value = list.filter((item) => mediaType(item) === 'image')
    videoMedia.value = list.filter((item) => mediaType(item) === 'video')
    audioMedia.value = list.filter((item) => mediaType(item) === 'audio')
    sharedWithMe.value = list.filter((item) => Boolean(item?.is_shared || item?.shared || item?.shared_with_me))

    smartAlbums.value = [
      { id: 'recent', label: 'Recently Added', items: list.slice(0, 20) },
      { id: 'images', label: 'Images', items: imageMedia.value.slice(0, 20) },
      { id: 'videos', label: 'Videos', items: videoMedia.value.slice(0, 20) },
      { id: 'audio', label: 'Audio', items: audioMedia.value.slice(0, 20) },
    ]
  }

  async function loadFolders() {
    const list = toList(await request.readItems('media_folders', { sort: ['sort', 'name'] }))
    folders.value = list
  }

  if (process.client) {
    loadMedia().catch(() => {})
    loadFolders().catch(() => {})
  }

  const uploadFiles = async (_files: File[] | FormData) => {
    const formData = _files instanceof FormData
      ? _files
      : (() => {
          const form = new FormData()
          _files.forEach((file) => form.append('file', file))
          return form
        })()

    const uploaded = await request.uploadFiles(formData)
    await loadMedia()
    return uploaded
  }

  const searchMedia = async (_query: string) => {
    const token = String(_query || '').trim().toLowerCase()
    if (!token) {
      searchResults.value = []
      return []
    }

    if (!allMedia.value.length) {
      await loadMedia()
    }

    const matches = allMedia.value.filter((item) => includesToken(item, token))
    searchResults.value = matches
    return matches
  }

  const createFolder = async (_payload: any) => {
    const payload = typeof _payload === 'string' ? { name: _payload } : _payload
    const created = await request.createItem('media_folders', payload)
    await loadFolders()
    return created
  }

  const filterByFolder = (_folderId: string | number | null) => {
    if (!_folderId) {
      return {
        all: allMedia.value,
        images: imageMedia.value,
        videos: videoMedia.value,
        audio: audioMedia.value,
      }
    }

    const inFolder = allMedia.value.filter((item) => {
      const itemFolder = item?.folder || item?.folder_id || item?.media_folder
      if (!itemFolder) return false
      if (typeof itemFolder === 'object') return String(itemFolder.id) === String(_folderId)
      return String(itemFolder) === String(_folderId)
    })

    return {
      all: inFolder,
      images: inFolder.filter((item) => mediaType(item) === 'image'),
      videos: inFolder.filter((item) => mediaType(item) === 'video'),
      audio: inFolder.filter((item) => mediaType(item) === 'audio'),
    }
  }

  const reorderFolders = (_nextOrder: any[]) => {
    folders.value = Array.isArray(_nextOrder) ? _nextOrder : folders.value
    return folders.value
  }

  return {
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
    loadMedia,
    loadFolders,
  }
}

export default useMediaCenter
