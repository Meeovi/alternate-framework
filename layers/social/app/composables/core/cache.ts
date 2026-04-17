import {
  createAccountCacheTools,
  type AccountCacheTools,
  type CacheEntry,
  type SocialCache,
} from '@mframework/adapter-federation'
import { useFederationClient as useMastoClient } from '..'

const accountCacheTools: AccountCacheTools = createAccountCacheTools({
  useFederationClient: () => useMastoClient(),
})

export type { CacheEntry, SocialCache }

export const setSocialCache = accountCacheTools.setSocialCache
export const getSocialCache = accountCacheTools.getSocialCache
export const fetchAccountByHandle = accountCacheTools.fetchAccountByHandle
export const fetchAccountById = accountCacheTools.fetchAccountById
