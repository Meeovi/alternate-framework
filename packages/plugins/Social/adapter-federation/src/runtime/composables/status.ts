import { computed, ref, watch, type Ref } from 'vue'
import type { mastodon } from '../../clients/mastodon'

type Action = 'reblogged' | 'favourited' | 'bookmarked' | 'pinned' | 'muted'
type CountField = 'reblogsCount' | 'favouritesCount' | 'quotesCount'

export interface StatusActionsProps {
  status: mastodon.v1.Status
}

export interface StatusActionToolsDeps {
  checkLogin: () => boolean
  currentUser: { value: { account?: { id?: string } } | null | undefined }
  useFederation: () => { client: Ref<mastodon.rest.Client> }
  cacheStatus: (status: mastodon.v1.Status, server?: string, override?: boolean) => void
  navigateTo: (to: string) => unknown
}

export function createStatusActionTools(deps: StatusActionToolsDeps) {
  function useStatusActions(props: StatusActionsProps) {
    const status = ref<mastodon.v1.Status>({ ...props.status })
    const { client } = deps.useFederation()

    watch(
      () => props.status,
      val => status.value = { ...val },
      { deep: true, immediate: true },
    )

    const isLoading = ref({
      reblogged: false,
      favourited: false,
      bookmarked: false,
      pinned: false,
      translation: false,
      muted: false,
    })

    async function toggleStatusAction(action: Action, fetchNewStatus: () => Promise<mastodon.v1.Status>, countField?: CountField) {
      if (!deps.checkLogin())
        return

      const prevCount = countField ? status.value[countField] : undefined

      isLoading.value[action] = true
      const isCancel = status.value[action]
      void fetchNewStatus().then((newStatus) => {
        if (isCancel && countField && prevCount === newStatus[countField])
          newStatus[countField] -= 1

        Object.assign(status.value, newStatus)
        deps.cacheStatus(newStatus, undefined, true)
      }).finally(() => {
        isLoading.value[action] = false
      })

      status.value[action] = !status.value[action]
      deps.cacheStatus(status.value, undefined, true)
      if (countField)
        status.value[countField] += status.value[action] ? 1 : -1
    }

    const toggleFavourite = () => toggleStatusAction(
      'favourited',
      () => client.value.v1.statuses.$select(status.value.id)[status.value.favourited ? 'unfavourite' : 'favourite'](),
      'favouritesCount',
    )

    const canReblog = computed(() =>
      status.value.visibility !== 'direct'
      && (status.value.visibility !== 'private' || status.value.account.id === deps.currentUser.value?.account?.id),
    )

    const toggleReblog = () => toggleStatusAction(
      'reblogged',
      () => client.value.v1.statuses.$select(status.value.id)[status.value.reblogged ? 'unreblog' : 'reblog']().then((res) => {
        if (status.value.reblogged)
          return res.reblog!
        return res
      }),
      'reblogsCount',
    )

    const canQuote = computed(() => {
      if (status.value.visibility === 'private' || status.value.visibility === 'direct')
        return false

      return status.value.quoteApproval?.currentUser === 'automatic' || status.value.quoteApproval?.currentUser === 'manual'
    })

    const composeWithQuote = () => deps.navigateTo(`/compose?quote=${status.value.id}`)

    const toggleBookmark = () => toggleStatusAction(
      'bookmarked',
      () => client.value.v1.statuses.$select(status.value.id)[status.value.bookmarked ? 'unbookmark' : 'bookmark'](),
    )

    const togglePin = async () => toggleStatusAction(
      'pinned',
      () => client.value.v1.statuses.$select(status.value.id)[status.value.pinned ? 'unpin' : 'pin'](),
    )

    const toggleMute = async () => toggleStatusAction(
      'muted',
      () => client.value.v1.statuses.$select(status.value.id)[status.value.muted ? 'unmute' : 'mute'](),
    )

    return {
      status,
      isLoading,
      canQuote,
      canReblog,
      toggleMute,
      toggleReblog,
      toggleFavourite,
      toggleBookmark,
      togglePin,
      composeWithQuote,
    }
  }

  return {
    useStatusActions,
  }
}
