import { useStorage, type RemovableRef } from '@vueuse/core'
import type { mastodon } from 'masto'
import type { DraftItem, DraftKey } from '#social/types'

const defaultDraftItems: DraftItem[] = []

export function useDraft(draftKey: DraftKey, initial?: () => DraftItem): { draftItems: RemovableRef<DraftItem[]> } {
  const draftItems = useStorage<DraftItem[]>(`social:draft:${String(draftKey)}`, defaultDraftItems, localStorage)

  if (!draftItems.value || draftItems.value.length === 0) {
    draftItems.value = initial ? [initial()] : [{ ...getDefaultDraftItem() }]
  }

  return { draftItems }
}

export function getDefaultDraftItem(options: Partial<mastodon.rest.v1.CreateScheduledStatusParams & { draftKey?: DraftKey }> = {}): DraftItem {
  const {
    attachments = [],
    status = '',
    inReplyToId,
    visibility,
    sensitive,
    spoilerText,
    language,
    mentions,
    poll,
    scheduledAt,
    quotedStatusId,
  } = options

  const effectiveVisibility = visibility || 'public'
  const effectiveLanguage = language || ''
  const effectiveSensitive = sensitive ?? false
  const effectiveSpoilerText = spoilerText || ''

  return {
    attachments,
    initialText: '',
    params: {
      status,
      poll,
      scheduledAt,
      inReplyToId,
      quotedStatusId,
      quoteApprovalPolicy: 'public',
      visibility: effectiveVisibility,
      sensitive: effectiveSensitive,
      spoilerText: effectiveSpoilerText,
      language: effectiveLanguage,
    },
    mentions,
    lastUpdated: Date.now(),
  }
}