// Local route helper for lists layer
import type { mastodon } from 'masto'

export function getAccountRoute(account: mastodon.v1.Account) {
  // Simple fallback route generation
  // Parent app can override this by providing proper router context
  const handle = account.acct || account.username
  return {
    name: 'account',
    params: { account: handle },
    href: `/account/${handle}`
  }
}
