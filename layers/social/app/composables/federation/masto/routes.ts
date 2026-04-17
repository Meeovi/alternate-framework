import { createRouteTools, type mastodon } from '@mframework/adapter-federation'

const routeTools = createRouteTools({
  resolveRoute: location => useRouter().resolve(location as any),
  currentServer: () => currentServer.value,
  currentUserServer: () => currentUser.value?.server,
  extractAccountHandle,
  navigateTo: payload => navigateTo(payload),
})

export function getAccountRoute(account: mastodon.v1.Account) {
  return routeTools.getAccountRoute(account)
}
export function getAccountFollowingRoute(account: mastodon.v1.Account) {
  return routeTools.getAccountFollowingRoute(account)
}
export function getAccountFollowersRoute(account: mastodon.v1.Account) {
  return routeTools.getAccountFollowersRoute(account)
}

export function getReportRoute(id: string | number) {
  return routeTools.getReportRoute(id)
}

export function getStatusRoute(status: mastodon.v1.Status) {
  return routeTools.getStatusRoute(status)
}

export function getTagRoute(tag: string) {
  return routeTools.getTagRoute(tag)
}

export function getStatusPermalinkRoute(status: mastodon.v1.Status) {
  return routeTools.getStatusPermalinkRoute(status)
}

export function getStatusInReplyToRoute(status: mastodon.v1.Status) {
  return routeTools.getStatusInReplyToRoute(status)
}

export function navigateToStatus({ status, focusReply = false }: {
  status: mastodon.v1.Status
  focusReply?: boolean
}) {
  return routeTools.navigateToStatus({ status, focusReply })
}
