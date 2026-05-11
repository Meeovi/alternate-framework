import type { DraftItem, DraftKey, DraftMap } from '../../../../../shared/shared/types'
import {
  createStatusDraftTools,
  type StatusDraftItem,
  type mastodon,
} from '@mframework/adapter-federation'
import type { ComputedRef, Ref } from 'vue'
import { computed, nextTick, onUnmounted, ref } from 'vue'
import { STORAGE_KEY_DRAFTS } from '~/constants'
import { currentUser, useUserLocalStorage } from '../../contacts/users'
import { convertMastodonHTML, htmlToText } from '../../core/content-parse'
import { openPublishDialog } from '../../core/dialog'

const statusDraftTools = createStatusDraftTools<DraftItem & StatusDraftItem>({
  getCurrentUser: () => currentUser.value as any,
  convertMastodonHTML: async (html: string) => convertMastodonHTML(html),
  htmlToText,
} as any)

export const currentUserDrafts = (import.meta.server || process.test)
  ? ref<DraftMap>({ home: [], dialog: [], intent: [], quote: [] })
  : useUserLocalStorage<DraftMap>(STORAGE_KEY_DRAFTS, () => ({ home: [], dialog: [], intent: [], quote: [] }))

export function getDefaultDraftItem(options: Record<string, unknown> = {}): DraftItem {
  return statusDraftTools.getDefaultDraftItem(options as any)
}

export async function getDraftFromStatus(status: mastodon.v1.Status): Promise<DraftItem> {
  return await statusDraftTools.getDraftFromStatus(status)
}

export function getReplyDraft(status: mastodon.v1.Status) {
  return statusDraftTools.getReplyDraft(status) as { key: DraftKey, draft: () => DraftItem }
}

export function isEmptyDraft(drafts: Array<DraftItem> | DraftItem | null | undefined) {
  return statusDraftTools.isEmptyDraft(drafts as any)
}

export interface UseDraft {
  draftItems: Ref<Array<DraftItem>>
  isEmpty: ComputedRef<boolean> | Ref<boolean>
}

export function useDraft(
  draftKey: DraftKey,
  initial: () => DraftItem = () => getDefaultDraftItem({}),
): UseDraft {
  const draftItems = computed({
    get() {
      if (!currentUserDrafts.value[draftKey])
        currentUserDrafts.value[draftKey] = [initial()]
      const drafts = currentUserDrafts.value[draftKey]
      if (Array.isArray(drafts))
        return drafts
      return [drafts]
    },
    set(val) {
      currentUserDrafts.value[draftKey] = val
    },
  })

  const isEmpty = computed(() => isEmptyDraft(draftItems.value))

  onUnmounted(async () => {
    // Remove draft if it's empty
    if (isEmpty.value && draftKey) {
      await nextTick()
      delete currentUserDrafts.value[draftKey]
    }
  })

  return { draftItems, isEmpty }
}

export function mentionUser(account: mastodon.v1.Account) {
  openPublishDialog('dialog', getDefaultDraftItem({
    status: `@${account.acct} `,
  }))
}

export function privateMentionUser(account: mastodon.v1.Account) {
  openPublishDialog('dialog', getDefaultDraftItem({
    status: `@${account.acct} `,
    visibility: 'direct',
  }))
}

export const builtinDraftKeys = statusDraftTools.builtinDraftKeys

export function clearEmptyDrafts() {
  for (const key in currentUserDrafts.value) {
    if (isDraftKey(key)) {
      if (builtinDraftKeys.includes(key as any) && !isEmptyDraft(currentUserDrafts.value[key]))
        continue
      if (isEmptyDraft(currentUserDrafts.value[key]))
        delete currentUserDrafts.value[key]
    }
  }
}

export function isDraftKey(key: string | number): key is DraftKey {
  return statusDraftTools.isDraftKey(key)
}
