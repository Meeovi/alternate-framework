import { computed, ref, watch, type Ref } from 'vue'
import type { mastodon } from '../../clients/mastodon'

export interface PublishDraftPoll {
  options: string[]
  [key: string]: unknown
}

export interface PublishDraftParams {
  sensitive?: boolean
  spoilerText?: string
  status?: string
  poll?: PublishDraftPoll | null
  scheduledAt?: string | Date | null
  inReplyToId?: string | null
  language?: string | null
  quotedStatusId?: string | null
  quoteApprovalPolicy?: string | null
  [key: string]: unknown
}

export interface PublishDraftAttachment {
  id: string
  description?: string
}

export interface PublishDraftItem {
  params: PublishDraftParams
  mentions?: string[]
  attachments: PublishDraftAttachment[]
  editingStatus?: { id: string } | null
}

export interface PublishToolsOptions<TDraftItem extends PublishDraftItem = PublishDraftItem> {
  draftItem: Ref<TDraftItem>
  expanded: Ref<boolean>
  isUploading: Ref<boolean>
  isPartOfThread: boolean
  initialDraft: () => TDraftItem
}

export interface PublishToolsDeps {
  useFederation: () => { client: Ref<mastodon.rest.Client> }
  useUserSettings: () => { value?: { language?: string } | null }
  getCurrentUserLanguage: () => string | undefined
  isGlitchEdition: () => boolean
  currentInstance: () => {
    configuration?: {
      polls?: { maxOptions?: number, maxCharactersPerOption?: number }
    }
  } | null | undefined
  htmlToText: (input: string) => string
  isEmptyDraft: <TDraftItem extends PublishDraftItem = PublishDraftItem>(drafts: TDraftItem[]) => boolean
  navigateToStatus: (payload: { status: mastodon.v1.Status }) => void
  isDev: boolean
  logPayload?: (payload: Record<string, unknown>) => void
  confirmPublish?: () => boolean
  onError?: (error: unknown) => void
}

export function createPublishTools(deps: PublishToolsDeps) {
  function usePublish<TDraftItem extends PublishDraftItem = PublishDraftItem>(options: PublishToolsOptions<TDraftItem>) {
    const { draftItem } = options

    const isEmpty = computed(() => deps.isEmptyDraft([draftItem.value]))

    const { client } = deps.useFederation()
    const settings = deps.useUserSettings()

    const preferredLanguage = computed(() => {
      const currentUserLanguage = deps.getCurrentUserLanguage()
      const settingsLanguage = settings?.value?.language
      return (currentUserLanguage || settingsLanguage || 'en').split('-')[0]
    })

    const isSending = ref(false)
    const isExpanded = ref(false)
    const failedMessages = ref<string[]>([])

    const publishSpoilerText = computed({
      get() {
        return draftItem.value.params.sensitive ? String(draftItem.value.params.spoilerText || '') : ''
      },
      set(val) {
        if (!draftItem.value.params.sensitive)
          return
        draftItem.value.params.spoilerText = val
      },
    })

    const shouldExpanded = computed(() => options.expanded.value || isExpanded.value || !isEmpty.value)

    const isPublishDisabled = computed(() => {
      const { params, attachments } = draftItem.value
      const pollOptions = params.poll?.options || []
      const firstEmptyInputIndex = pollOptions.findIndex(option => option.trim().length === 0)
      const instancePollConfig = deps.currentInstance()?.configuration?.polls

      return isEmpty.value
        || options.isUploading.value
        || isSending.value
        || (attachments.length === 0 && !params.status)
        || failedMessages.value.length > 0
        || (attachments.length > 0 && params.poll !== null && params.poll !== undefined)
        || ((params.poll !== null && params.poll !== undefined)
          && (
            (firstEmptyInputIndex !== -1 && firstEmptyInputIndex !== pollOptions.length - 1)
            || pollOptions.findLastIndex(option => option.trim().length > 0) + 1 < 2
            || (new Set(pollOptions).size !== pollOptions.length)
            || (instancePollConfig?.maxCharactersPerOption !== undefined
              && pollOptions.find(option => option.length > instancePollConfig.maxCharactersPerOption!) !== undefined)
          ))
    })

    watch(draftItem, () => {
      if (failedMessages.value.length > 0)
        failedMessages.value.length = 0
    }, { deep: true })

    async function publishDraft(): Promise<mastodon.v1.Status | undefined> {
      if (isPublishDisabled.value)
        return

      let content = deps.htmlToText(String(draftItem.value.params.status || ''))
      if (draftItem.value.mentions?.length)
        content = `${draftItem.value.mentions.map(i => `@${i}`).join(' ')} ${content}`

      let poll
      if (draftItem.value.params.poll) {
        let options = draftItem.value.params.poll.options
        const pollConfig = deps.currentInstance()?.configuration?.polls

        if (pollConfig !== undefined
          && (
            (pollConfig.maxOptions !== undefined && options.length < pollConfig.maxOptions)
            || options[options.length - 1]?.trim().length === 0
          )) {
          options = options.slice(0, options.length - 1)
        }

        poll = { ...draftItem.value.params.poll, options }
      }

      let scheduledAt
      if (draftItem.value.params.scheduledAt)
        scheduledAt = new Date(draftItem.value.params.scheduledAt).toISOString()

      const payload = {
        ...draftItem.value.params,
        spoilerText: publishSpoilerText.value,
        status: content,
        mediaIds: draftItem.value.attachments.map(a => a.id),
        language: draftItem.value.params.language || preferredLanguage.value,
        poll,
        scheduledAt,
        quotedStatusId: draftItem.value.params.quotedStatusId,
        quoteApprovalPolicy: draftItem.value.params.quoteApprovalPolicy,
        ...(deps.isGlitchEdition() ? { 'content-type': 'text/markdown' } : {}),
      } as mastodon.rest.v1.CreateScheduledStatusParams

      if (deps.isDev) {
        deps.logPayload?.({
          raw: draftItem.value.params.status,
          ...payload,
        })
        const result = deps.confirmPublish ? deps.confirmPublish() : true
        if (!result)
          return
      }

      try {
        isSending.value = true

        let status: mastodon.v1.Status
        if (!draftItem.value.editingStatus) {
          status = await client.value.v1.statuses.create(payload)
        }
        else {
          status = await client.value.v1.statuses.$select(draftItem.value.editingStatus.id).update({
            ...payload,
            mediaAttributes: draftItem.value.attachments.map(media => ({
              id: media.id,
              description: media.description,
            })),
          })
        }

        if (draftItem.value.params.inReplyToId && !options.isPartOfThread)
          deps.navigateToStatus({ status })

        draftItem.value = options.initialDraft()

        if ('scheduled_at' in (status as any))
          return

        return status
      }
      catch (error) {
        deps.onError?.(error)
        failedMessages.value.push((error as Error).message)
      }
      finally {
        isSending.value = false
      }
    }

    return {
      isSending,
      isExpanded,
      shouldExpanded,
      isPublishDisabled,
      failedMessages,
      preferredLanguage,
      publishSpoilerText,
      publishDraft,
    }
  }

  return {
    usePublish,
  }
}
