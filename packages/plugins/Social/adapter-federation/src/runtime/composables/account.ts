import { computed, type ComputedRef } from 'vue'

export interface FederationAccountLike {
  acct: string
  displayName?: string
  username?: string
}

export interface FederationCurrentUserLike {
  server?: string
}

export interface AccountHandleToolsDeps<TInstance = unknown> {
  currentInstance: () => TInstance | null | undefined
  currentServer: () => string | undefined
  currentUser: () => FederationCurrentUserLike | null | undefined
  getInstanceDomain: (instance: TInstance) => string
}

export interface AccountHandleTools {
  getDisplayName: (account: FederationAccountLike, options?: { rich?: boolean }) => string
  accountToShortHandle: (acct: string) => string
  getShortHandle: (account: FederationAccountLike) => string
  getServerName: (account: FederationAccountLike) => string
  getFullHandle: (account: FederationAccountLike) => string
  toShortHandle: (fullHandle: string) => string
  extractAccountHandle: (account: FederationAccountLike) => string
  useAccountHandle: (account: FederationAccountLike, fullServer?: boolean) => ComputedRef<string>
}

export function createAccountHandleTools<TInstance = unknown>(deps: AccountHandleToolsDeps<TInstance>): AccountHandleTools {
  function getDisplayName(account: FederationAccountLike, options?: { rich?: boolean }) {
    const displayName = account.displayName || account.username || account.acct || ''
    if (options?.rich)
      return displayName
    return displayName.replace(/:([\w-]+):/g, '')
  }

  function accountToShortHandle(acct: string) {
    return `@${acct.includes('@') ? acct.split('@')[0] : acct}`
  }

  function getShortHandle(account: FederationAccountLike) {
    if (!account.acct)
      return ''
    return accountToShortHandle(account.acct)
  }

  function getServerName(account: FederationAccountLike) {
    if (account.acct?.includes('@'))
      return account.acct.split('@')[1]

    const instance = deps.currentInstance()
    return instance ? deps.getInstanceDomain(instance) : ''
  }

  function getFullHandle(account: FederationAccountLike) {
    const handle = `@${account.acct}`
    if (!deps.currentUser() || account.acct.includes('@'))
      return handle
    return `${handle}@${getServerName(account)}`
  }

  function toShortHandle(fullHandle: string) {
    const server = deps.currentUser()?.server
    if (!server)
      return fullHandle
    if (fullHandle.endsWith(`@${server}`))
      return fullHandle.slice(0, -server.length - 1)
    return fullHandle
  }

  function extractAccountHandle(account: FederationAccountLike) {
    let handle = getFullHandle(account).slice(1)
    const instance = deps.currentInstance()
    const uri = instance ? deps.getInstanceDomain(instance) : deps.currentServer()
    if (instance && uri && handle.endsWith(`@${uri}`))
      handle = handle.slice(0, -uri.length - 1)

    return handle
  }

  function useAccountHandle(account: FederationAccountLike, fullServer = true) {
    return computed(() => (fullServer ? getFullHandle(account) : getShortHandle(account)))
  }

  return {
    getDisplayName,
    accountToShortHandle,
    getShortHandle,
    getServerName,
    getFullHandle,
    toShortHandle,
    extractAccountHandle,
    useAccountHandle,
  }
}