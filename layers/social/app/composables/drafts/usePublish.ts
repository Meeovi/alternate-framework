import { ref, computed } from 'vue'
import type { mastodon } from 'masto'
import type { PublishDraftItem, PublishToolsOptions } from '@mframework/adapter-federation'
import { useUserSettings } from '../settings/storage'

/**
 * Publish a draft to a federated service (e.g., Mastodon).
 *
 * Previously this composable accessed `globalThis.__mastoClient` — a
 * server-injected global that is not available in the browser. The
 * publish call is now delegated to the server endpoint
 * `POST /api/social/publish`, which has access to the Mastodon client.
 */
export function usePublish<TDraftItem extends PublishDraftItem = PublishDraftItem>(options: PublishToolsOptions<TDraftItem>) {
  const { draftItem, expanded, isUploading, isPartOfThread } = options
  const settings = useUserSettings()

  const isEmpty = computed(() => {
    const status = draftItem.value.params.status ?? ''
    return status.trim().length === 0 && draftItem.value.attachments.length === 0
  })

  const isSending = ref(false)
  const isExpanded = ref(false)
  const failedMessages = ref<string[]>([])

  const publishSpoilerText = computed({
    get() {
      return draftItem.value.params.sensitive ? String(draftItem.value.params.spoilerText || '') : ''
    },
    set(val: string) {
      if (!draftItem.value.params.sensitive) return
      draftItem.value.params.spoilerText = val
    },
  })

  const shouldExpanded = computed(() => expanded.value || isExpanded.value || !isEmpty.value)

  const isPublishDisabled = computed(() => {
    const { params, attachments } = draftItem.value
    const pollOptions = params.poll?.options || []
    const firstEmptyInputIndex = pollOptions.findIndex(option => option.trim().length === 0)

    return isEmpty.value
      || isSending.value
      || (attachments.length === 0 && !params.status)
      || failedMessages.value.length > 0
      || (attachments.length > 0 && params.poll !== null && params.poll !== undefined)
  })

  async function publishDraft(): Promise<mastodon.v1.Status | undefined> {
    if (isPublishDisabled.value) return

    isSending.value = true

    const preferredLanguage = (settings?.value?.language || 'en').split('-')[0]

    let content = String(draftItem.value.params.status || '')
    if (draftItem.value.mentions?.length) {
      content = `${draftItem.value.mentions.map(i => `@${i}`).join(' ')} ${content}`
    }

    try {
      const payload = {
        ...draftItem.value.params,
        spoilerText: publishSpoilerText.value,
        status: content,
        mediaIds: draftItem.value.attachments.map(a => a.id),
        language: draftItem.value.params.language || preferredLanguage,
        poll: draftItem.value.params.poll ? { ...draftItem.value.params.poll } : undefined,
        scheduledAt: draftItem.value.params.scheduledAt,
        quotedStatusId: draftItem.value.params.quotedStatusId,
        quoteApprovalPolicy: draftItem.value.params.quoteApprovalPolicy,
      }

      const status = await $fetch('/api/social/publish', {
        method: 'POST',
        body: { payload },
      })

      return status as mastodon.v1.Status
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      failedMessages.value.push(message)
    } finally {
      isSending.value = false
    }
  }

  return {
    isSending,
    isExpanded,
    shouldExpanded,
    isPublishDisabled,
    failedMessages,
    publishSpoilerText,
    publishDraft,
  }
}
