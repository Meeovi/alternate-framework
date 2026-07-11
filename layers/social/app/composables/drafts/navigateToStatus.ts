import type { mastodon } from 'masto'

export function navigateToStatus({ status, focusReply = false }: { status: mastodon.v1.Status, focusReply?: boolean }) {
  const route = useRouter()
  const currentServer = useCookie<string | undefined>('current-server')

  const statusPath = `/@${status.account.acct}/posts/${status.id}`
  return route.push({
    path: statusPath,
    state: { focusReply },
  })
}