import { computed, ref, type Ref } from 'vue'
import type { mastodon } from '../../clients/mastodon'
import type { PublishDraftItem } from './publish'

export type MediaAttachmentUploadError = [filename: string, message: string]

export interface UploadMediaAttachmentOptions<TDraftItem extends PublishDraftItem = PublishDraftItem> {
  draftItem: Ref<TDraftItem>
}

export interface UploadMediaAttachmentToolsDeps {
  useFederation: () => { client: Ref<mastodon.rest.Client> }
  currentInstance: () => {
    configuration?: {
      statuses?: { maxMediaAttachments?: number }
      mediaAttachments?: {
        imageMatrixLimit?: number
        videoSizeLimit?: number
        imageSizeLimit?: number
      }
    }
  } | null | undefined
  t: (key: string, args?: unknown[]) => string
  onError?: (error: unknown) => void
}

function formatFileSize(size: number) {
  if (!size || size <= 0)
    return '0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  let value = size
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value >= 10 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`
}

export function createUploadMediaAttachmentTools(deps: UploadMediaAttachmentToolsDeps) {
  function useUploadMediaAttachment<TDraftItem extends PublishDraftItem = PublishDraftItem>(options: UploadMediaAttachmentOptions<TDraftItem>) {
    const { client } = deps.useFederation()

    const isUploading = ref<boolean>(false)
    const isExceedingAttachmentLimit = ref<boolean>(false)
    const failedAttachments = ref<MediaAttachmentUploadError[]>([])

    const maxPixels = computed(() => {
      return deps.currentInstance()?.configuration?.mediaAttachments?.imageMatrixLimit ?? 4096 ** 2
    })

    const loadImage = (inputFile: Blob) => new Promise<HTMLImageElement>((resolve, reject) => {
      const url = URL.createObjectURL(inputFile)
      const img = new Image()

      img.onerror = err => reject(err)
      img.onload = () => resolve(img)

      img.src = url
    })

    function resizeImage(img: HTMLImageElement, type = 'image/png'): Promise<Blob | null> {
      const { width, height } = img
      const aspectRatio = width / height

      const canvas = document.createElement('canvas')
      const resizedWidth = canvas.width = Math.round(Math.sqrt(maxPixels.value * aspectRatio))
      const resizedHeight = canvas.height = Math.round(Math.sqrt(maxPixels.value / aspectRatio))

      const context = canvas.getContext('2d')
      context?.drawImage(img, 0, 0, resizedWidth, resizedHeight)

      return new Promise((resolve) => {
        canvas.toBlob(resolve, type)
      })
    }

    async function processImageFile(file: File) {
      try {
        const image = await loadImage(file) as HTMLImageElement

        if (image.width * image.height > maxPixels.value)
          file = await resizeImage(image, file.type) as File

        return file
      }
      catch (error) {
        deps.onError?.(error)
        return file
      }
    }

    async function processFile(file: File) {
      if (file.type.startsWith('image/'))
        return await processImageFile(file)

      return file
    }

    async function uploadAttachments(files: File[]) {
      const draft = options.draftItem.value

      isUploading.value = true
      failedAttachments.value = []

      const limit = deps.currentInstance()?.configuration?.statuses?.maxMediaAttachments || 4
      const maxVideoSize = deps.currentInstance()?.configuration?.mediaAttachments?.videoSizeLimit || 0
      const maxImageSize = deps.currentInstance()?.configuration?.mediaAttachments?.imageSizeLimit || 0

      for (const file of files.slice(0, limit)) {
        if (draft.attachments.length < limit) {
          if (file.type.startsWith('image/')) {
            if (maxImageSize > 0 && file.size > maxImageSize) {
              failedAttachments.value = [
                ...failedAttachments.value,
                [file.name, deps.t('state.attachments_limit_image_error', [formatFileSize(maxImageSize)])],
              ]
              continue
            }
          }
          else {
            if (maxVideoSize > 0 && file.size > maxVideoSize) {
              const key
                = file.type.startsWith('audio/')
                  ? 'state.attachments_limit_audio_error'
                  : file.type.startsWith('video/')
                    ? 'state.attachments_limit_video_error'
                    : 'state.attachments_limit_unknown_error'

              const errorMessage = deps.t(key, [formatFileSize(maxVideoSize)])
              failedAttachments.value = [
                ...failedAttachments.value,
                [file.name, errorMessage],
              ]
              continue
            }
          }

          isExceedingAttachmentLimit.value = false

          try {
            const attachment = await client.value.v1.media.create({
              file: await processFile(file),
            })
            draft.attachments.push(attachment)
          }
          catch (error) {
            deps.onError?.(error)
            failedAttachments.value = [...failedAttachments.value, [file.name, (error as Error).message]]
          }
        }
        else {
          isExceedingAttachmentLimit.value = true
          failedAttachments.value = [...failedAttachments.value, [file.name, deps.t('state.attachments_limit_error')]]
        }
      }

      isUploading.value = false
    }

    async function setDescription(att: mastodon.v1.MediaAttachment, description: string) {
      const draft = options.draftItem.value

      att.description = description
      if (!draft.editingStatus)
        await client.value.v1.media.$select(att.id).update({ description: att.description })
    }

    function removeAttachment(index: number) {
      options.draftItem.value.attachments.splice(index, 1)
    }

    return {
      isUploading,
      isExceedingAttachmentLimit,
      failedAttachments,
      uploadAttachments,
      setDescription,
      removeAttachment,
    }
  }

  return {
    useUploadMediaAttachment,
  }
}
