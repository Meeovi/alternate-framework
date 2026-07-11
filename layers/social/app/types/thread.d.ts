import type { mastodon } from 'masto'

export type DraftKey = string

export interface DraftParams {
  language: string | null
  sensitive: boolean
  spoilerText: string | null
  visibility: mastodon.v1.StatusVisibility
  inReplyToId: mastodon.v1.Status['id'] | null
}

export interface DraftItem {
  text: string
  mediaIds: string[]
  params: DraftParams
}

export interface ThreadComposer {
  threadItems: Ref<DraftItem[]>
  threadIsActive: ComputedRef<boolean>
  addThreadItem: () => void
  removeThreadItem: (index: number) => void
  publishThread: () => Promise<mastodon.v1.Status | string[] | null>
  threadIsSending: Ref<boolean>
}
