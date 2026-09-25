import { ref } from 'vue'

/**
 * Client side of the centralized upload path: every user-uploaded file in
 * Meeovi goes to Pixanomy (app.pixanomy.com, Nextcloud) through
 * POST /api/assets/upload (server/api/assets/upload.post.ts). Store the
 * returned `url` on the content record — getAssetURL() renders full URLs
 * as-is, so no Directus asset id is involved.
 *
 * ```ts
 * const { upload, uploading } = useAssetUpload()
 * const asset = await upload(file, { category: 'posts' })
 * post.image = asset.url
 * ```
 */
export interface UploadedAsset {
  url: string
  shareUrl: string
  path: string
  fileId: string | null
  filename: string
  contentType: string
  size: number
}

export interface AssetUploadOptions {
  /** Folder grouping under the user's Pixanomy folder, e.g. "posts". */
  category?: string
}

export function useAssetUpload() {
  const uploading = ref(false)
  const error = ref('')

  async function uploadMany(files: File[], options: AssetUploadOptions = {}): Promise<UploadedAsset[]> {
    if (!files.length) return []
    const body = new FormData()
    if (options.category) body.append('category', options.category)
    for (const file of files) body.append('file', file, file.name)

    uploading.value = true
    error.value = ''
    try {
      const res = await $fetch<{ assets: UploadedAsset[] }>('/api/assets/upload', {
        method: 'POST',
        body,
      })
      return res.assets
    } catch (e: any) {
      error.value = e?.data?.statusMessage || e?.statusMessage || e?.message || 'Upload failed'
      throw e
    } finally {
      uploading.value = false
    }
  }

  async function upload(file: File, options: AssetUploadOptions = {}): Promise<UploadedAsset> {
    const [asset] = await uploadMany([file], options)
    return asset!
  }

  return { upload, uploadMany, uploading, error }
}

export default useAssetUpload
