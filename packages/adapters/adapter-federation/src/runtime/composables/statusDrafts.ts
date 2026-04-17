import type { mastodon } from '../../clients/mastodon'
import type { PublishDraftItem } from './publish'

export interface StatusDraftItem extends PublishDraftItem {
  initialText?: string
  lastUpdated?: number
}

export interface StatusDraftReplyDefinition<TDraft extends StatusDraftItem = StatusDraftItem> {
  key: string
  draft: () => TDraft
}

export interface StatusDraftToolsDeps {
  getCurrentUser: () => {
    account?: {
      id?: string
      source?: {
        privacy?: mastodon.v1.StatusVisibility
        quotePolicy?: mastodon.rest.v1.QuoteApprovalPolicy
      }
    }
  } | null | undefined
  convertMastodonHTML: (html: string) => Promise<string>
  htmlToText: (html: string) => string
}

const ALL_VISIBILITY: readonly mastodon.v1.StatusVisibility[] = ['public', 'unlisted', 'private', 'direct'] as const
const ALL_QUOTE_APPROVAL_POLICY: readonly mastodon.rest.v1.QuoteApprovalPolicy[] = ['public', 'followers', 'nobody'] as const

export function createStatusDraftTools<TDraft extends StatusDraftItem = StatusDraftItem>(deps: StatusDraftToolsDeps) {
  function getDefaultVisibility(currentVisibility: mastodon.v1.StatusVisibility) {
    const preferredVisibility = deps.getCurrentUser()?.account?.source?.privacy || 'public'
    return ALL_VISIBILITY.indexOf(currentVisibility) > ALL_VISIBILITY.indexOf(preferredVisibility)
      ? currentVisibility
      : preferredVisibility
  }

  function getDefaultQuoteApprovalPolicy(currentQuoteApprovalPolicy: mastodon.rest.v1.QuoteApprovalPolicy) {
    const preferredQuoteApprovalPolicy = deps.getCurrentUser()?.account?.source?.quotePolicy || 'public'
    return ALL_QUOTE_APPROVAL_POLICY.indexOf(currentQuoteApprovalPolicy) > ALL_QUOTE_APPROVAL_POLICY.indexOf(preferredQuoteApprovalPolicy)
      ? currentQuoteApprovalPolicy
      : preferredQuoteApprovalPolicy
  }

  function getDefaultDraftItem(options: Partial<mastodon.rest.v1.CreateScheduledStatusParams & Omit<TDraft, 'params'>> = {}): TDraft {
    const {
      attachments = [],
      initialText = '',
      status,
      inReplyToId,
      visibility,
      sensitive,
      spoilerText,
      language,
      mentions,
      poll,
      scheduledAt,
      quotedStatusId,
      quoteApprovalPolicy,
    } = options

    return {
      attachments,
      initialText,
      params: {
        status: status || '',
        poll,
        scheduledAt,
        inReplyToId,
        quotedStatusId,
        quoteApprovalPolicy: getDefaultQuoteApprovalPolicy(quoteApprovalPolicy || 'public'),
        visibility: getDefaultVisibility(visibility || 'public'),
        sensitive: sensitive ?? false,
        spoilerText: spoilerText || '',
        language: language || '',
      },
      mentions,
      lastUpdated: Date.now(),
    } as TDraft
  }

  async function getDraftFromStatus(status: mastodon.v1.Status): Promise<TDraft> {
    const info = {
      status: await deps.convertMastodonHTML(status.content),
      visibility: status.visibility,
      attachments: status.mediaAttachments,
      sensitive: status.sensitive,
      spoilerText: status.spoilerText,
      language: status.language,
      inReplyToId: status.inReplyToId,
    }

    return getDefaultDraftItem((status.mediaAttachments !== undefined && status.mediaAttachments.length > 0)
      ? { ...info, mediaIds: status.mediaAttachments.map(att => att.id) }
      : {
          ...info,
          poll: status.poll
            ? {
                expiresIn: Math.abs(new Date().getTime() - new Date(status.poll.expiresAt!).getTime()) / 1000,
                options: [...status.poll.options.map(({ title }) => title), ''],
                multiple: status.poll.multiple,
                hideTotals: status.poll.options[0]?.votesCount === null,
              }
            : undefined,
        })
  }

  function getAccountsToMention(status: mastodon.v1.Status) {
    const userId = deps.getCurrentUser()?.account?.id
    const accountsToMention = new Set<string>()

    if (status.account.id !== userId)
      accountsToMention.add(status.account.acct)

    status.mentions
      .filter(mention => mention.id !== userId)
      .map(mention => mention.acct)
      .forEach(acct => accountsToMention.add(acct))

    return Array.from(accountsToMention)
  }

  function getReplyDraft(status: mastodon.v1.Status): StatusDraftReplyDefinition<TDraft> {
    const accountsToMention = getAccountsToMention(status)

    return {
      key: `reply-${status.id}`,
      draft: () => getDefaultDraftItem({
        initialText: '',
        inReplyToId: status.id,
        sensitive: status.sensitive,
        spoilerText: status.spoilerText,
        visibility: status.visibility,
        mentions: accountsToMention,
        language: status.language,
      }),
    }
  }

  function isEmptyDraft(drafts: Array<TDraft> | TDraft | null | undefined) {
    if (!drafts)
      return true

    const draftsArray: Array<TDraft> = Array.isArray(drafts) ? drafts : [drafts]
    if (draftsArray.length === 0)
      return true

    const anyDraftHasContent = draftsArray.some((draft) => {
      const { params, attachments } = draft
      const status = params.status ?? ''
      const text = deps.htmlToText(status).trim().replace(/^(@\S+\s?)+/, '').replaceAll(/```/g, '').trim()
      const hasQuote = !!params.quotedStatusId

      return text.length > 0 || attachments.length > 0 || hasQuote
    })

    return !anyDraftHasContent
  }

  const builtinDraftKeys = ['home', 'dialog', 'intent', 'quote'] as const

  function isDraftKey(key: string | number): key is string {
    return builtinDraftKeys.includes(String(key) as any) || (typeof key === 'string' && key.startsWith('reply-'))
  }

  return {
    getDefaultDraftItem,
    getDraftFromStatus,
    getReplyDraft,
    isEmptyDraft,
    builtinDraftKeys,
    isDraftKey,
  }
}