import type { DraftItem } from 'alternate-gateway/core/shared/types'
import { useLocate } from 'alternate-locate/adapters/vue/composable'
import {
  createPublishTools,
  createUploadMediaAttachmentTools,
} from '@mframework/adapter-federation'
import type { Ref } from 'vue'
import { fileOpen } from 'browser-fs-access'
import { currentInstance, currentUser, isGlitchEdition } from '../../contacts/users'
import { htmlToText } from '../../core/content-parse'
import { isEmptyDraft } from './statusDrafts'

export function usePublish(options: {
  draftItem: Ref<DraftItem>
  expanded: Ref<boolean>
  isUploading: Ref<boolean>
  isPartOfThread: boolean
  initialDraft: () => DraftItem
}) {
  const publishTools = createPublishTools({
    useFederation,
    useUserSettings,
    getCurrentUserLanguage: () => currentUser.value?.account.source.language,
    isGlitchEdition: () => isGlitchEdition.value,
    currentInstance: () => currentInstance.value,
    htmlToText,
    isEmptyDraft: drafts => isEmptyDraft(drafts),
    navigateToStatus,
    isDev: import.meta.dev,
    logPayload: payload => console.info(payload),
    confirmPublish: () => confirm('[DEV] Payload logged to console, do you want to publish it?'),
    onError: error => console.error(error),
  })

  return publishTools.usePublish(options)
}

export type { MediaAttachmentUploadError } from '@mframework/adapter-federation'

export function useUploadMediaAttachment(draft: Ref<DraftItem>) {
  const { t } = useLocate()
  const dropZoneRef = ref<HTMLDivElement>()
  const uploadTools = createUploadMediaAttachmentTools({
    useFederation,
    currentInstance: () => currentInstance.value,
    t,
    onError: error => console.error(error),
  })
  const {
    isUploading,
    isExceedingAttachmentLimit,
    failedAttachments,
    uploadAttachments,
    setDescription,
    removeAttachment,
  } = uploadTools.useUploadMediaAttachment({
    draftItem: draft,
  })

  async function pickAttachments() {
    if (import.meta.server)
      return
    const mimeTypes = currentInstance.value!.configuration?.mediaAttachments.supportedMimeTypes
    const files = await fileOpen({
      description: 'Attachments',
      multiple: true,
      mimeTypes,
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
