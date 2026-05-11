import type { DraftItem } from '../../../../../shared/shared/types'
import { useLocate } from 'alternate-gateway/locate/adapters/vue/composable'
import {
  createPublishTools,
  createUploadMediaAttachmentTools,
} from '@mframework/adapter-federation'
import type { Ref } from 'vue'
import { currentInstance, currentUser, isGlitchEdition } from '../../contacts/users'
import { htmlToText } from '../../core/content-parse'
import { isEmptyDraft } from './statusDrafts'
import { ref } from 'vue'
import { useDropZone } from '@vueuse/core'
import { useFederation } from './masto'
import { useMastoClient } from './masto'
import { useUserSettings } from '../../settings/storage'
import { navigateToStatus } from './routes'

export function usePublish(options: {
  draftItem: Ref<DraftItem>
  expanded: Ref<boolean>
  isUploading: Ref<boolean>
  isPartOfThread: boolean
  initialDraft: () => DraftItem
}) {
  const publishTools = createPublishTools({
    useFederation: () => ({ client: { value: useMastoClient() } }),
    useUserSettings,
    getCurrentUserLanguage: () => currentUser.value?.account.source.language || undefined,
    isGlitchEdition: () => isGlitchEdition.value,
    currentInstance: () => currentInstance.value,
    htmlToText,
    isEmptyDraft: (drafts: unknown) => isEmptyDraft(drafts as any),
    navigateToStatus,
    isDev: import.meta.dev,
    logPayload: (payload: unknown) => console.info(payload),
    confirmPublish: () => confirm('[DEV] Payload logged to console, do you want to publish it?'),
    onError: (error: unknown) => console.error(error),
  } as any)

  return publishTools.usePublish(options as any)
}

export type { MediaAttachmentUploadError } from '@mframework/adapter-federation'

export function useUploadMediaAttachment(draft: Ref<DraftItem>) {
  const { t } = useLocate()
  const dropZoneRef = ref<HTMLDivElement>()
  const uploadTools = createUploadMediaAttachmentTools({
    useFederation: () => ({ client: { value: useMastoClient() } }),
    currentInstance: () => currentInstance.value,
    t,
    onError: (error: unknown) => console.error(error),
  } as any)
  const {
    isUploading,
    isExceedingAttachmentLimit,
    failedAttachments,
    uploadAttachments,
    setDescription,
    removeAttachment,
  } = uploadTools.useUploadMediaAttachment({
    draftItem: draft as any,
  })

  async function pickAttachments() {
    if (import.meta.server)
      return
    const mimeTypes = currentInstance.value!.configuration?.mediaAttachments.supportedMimeTypes
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    if (mimeTypes?.length)
      input.accept = mimeTypes.join(',')
    const files = await new Promise<File[]>((resolve) => {
      input.onchange = () => resolve(Array.from(input.files || []))
      input.click()
    })
    await uploadAttachments(files)
  }

  async function onDrop(files: File[] | null) {
    if (files)
      await uploadAttachments(files)
  }

  const { isOverDropZone } = useDropZone(dropZoneRef, onDrop)

  return {
    isUploading,
    isExceedingAttachmentLimit,
    isOverDropZone,

    failedAttachments,
    dropZoneRef,

    uploadAttachments,
    pickAttachments,
    setDescription,
    removeAttachment,
  }
}
