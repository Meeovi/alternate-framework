import type { mastodon } from 'masto'
import { useState } from 'nuxt/app'

type CachedAccount = mastodon.v1.Account | mastodon.v1.AccountCredentials

function useAccountCache() {
  return useState<Record<string, CachedAccount>>('social-account-cache', () => ({}))
}

export function cacheAccount(account: CachedAccount, server?: string, includeAcctAliases = false): void {
  const cache = useAccountCache()
  const keys = new Set<string>([account.id])

  if (account.acct) {
    keys.add(account.acct)
    if (server)
      keys.add(`${account.acct}@${server}`)
  }

  if (includeAcctAliases && account.url) {
    try {
      const url = new URL(account.url)
      keys.add(`${account.username}@${url.hostname}`)
    }
    catch {
      // Ignore malformed profile URLs when populating cache aliases.
    }
  }

  for (const key of keys)
    cache.value[key] = account
}

export async function fetchAccountInfo(id: string): Promise<CachedAccount | null> {
  return useAccountCache().value[id] ?? null
}
