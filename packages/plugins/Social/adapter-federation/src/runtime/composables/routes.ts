import type { mastodon } from '../../clients/mastodon'

export interface RouteToolsDeps {
  resolveRoute: (location: { name: string, params: Record<string, unknown> }) => { href: string }
  currentServer: () => string | undefined
  currentUserServer: () => string | undefined
  extractAccountHandle: (account: mastodon.v1.Account) => string
  navigateTo: (payload: { path: string, state?: Record<string, unknown> }) => unknown
}

export function createRouteTools(deps: RouteToolsDeps) {
  function getAccountRoute(account: mastodon.v1.Account) {
    return deps.resolveRoute({
      name: 'account-index',
      params: {
        server: deps.currentServer(),
        account: deps.extractAccountHandle(account),
      },
    })
  }

  function getAccountFollowingRoute(account: mastodon.v1.Account) {
    return deps.resolveRoute({
      name: 'account-following',
      params: {
        server: deps.currentServer(),
        account: deps.extractAccountHandle(account),
      },
    })
  }

  function getAccountFollowersRoute(account: mastodon.v1.Account) {
    return deps.resolveRoute({
      name: 'account-followers',
      params: {
        server: deps.currentServer(),
        account: deps.extractAccountHandle(account),
      },
    })
  }

  function getReportRoute(id: string | number) {
    return `https://${deps.currentUserServer()}/admin/reports/${encodeURIComponent(id)}`
  }

  function getStatusRoute(status: mastodon.v1.Status) {
    return deps.resolveRoute({
      name: 'status',
      params: {
        server: deps.currentServer(),
        account: deps.extractAccountHandle(status.account),
        status: status.id,
      },
    })
  }

  function getTagRoute(tag: string) {
    return deps.resolveRoute({
      name: 'tag',
      params: {
        server: deps.currentServer(),
        tag,
      },
    })
  }

  function getStatusPermalinkRoute(status: mastodon.v1.Status) {
    return status.url ? status.url.replace(/^[a-z]+:\/\//i, '') : null
  }

  function getStatusInReplyToRoute(status: mastodon.v1.Status) {
    return deps.resolveRoute({
      name: 'status-by-id',
      params: {
        server: deps.currentServer(),
        status: status.inReplyToId,
      },
    })
  }

  function navigateToStatus({ status, focusReply = false }: { status: mastodon.v1.Status, focusReply?: boolean }) {
    return deps.navigateTo({
      path: getStatusRoute(status).href,
      state: { focusReply },
    })
  }

  return {
    getAccountRoute,
    getAccountFollowingRoute,
    getAccountFollowersRoute,
    getReportRoute,
    getStatusRoute,
    getTagRoute,
    getStatusPermalinkRoute,
    getStatusInReplyToRoute,
    navigateToStatus,
  }
}