import { createAccountHandleTools, type mastodon } from '@mframework/adapter-federation'
import { getInstanceDomain } from '../../contacts/users'
import { currentInstance, currentServer, currentUser } from '../../contacts/users'

const accountHandleTools = createAccountHandleTools({
  currentInstance: () => currentInstance.value,
  currentServer: () => currentServer.value,
  currentUser: () => currentUser.value,
  getInstanceDomain: () => getInstanceDomain(),
})

export function getDisplayName(account: mastodon.v1.Account, options?: { rich?: boolean }) {
  return accountHandleTools.getDisplayName(account, options)
}

export function accountToShortHandle(acct: string) {
  return accountHandleTools.accountToShortHandle(acct)
}

export function getShortHandle({ acct }: mastodon.v1.Account) {
  return accountHandleTools.getShortHandle({ acct })
}

export function getServerName(account: mastodon.v1.Account) {
  return accountHandleTools.getServerName(account)
}

export function getFullHandle(account: mastodon.v1.Account) {
  return accountHandleTools.getFullHandle(account)
}

export function toShortHandle(fullHandle: string) {
  return accountHandleTools.toShortHandle(fullHandle)
}

export function extractAccountHandle(account: mastodon.v1.Account) {
  return accountHandleTools.extractAccountHandle(account)
}

export function useAccountHandle(account: mastodon.v1.Account, fullServer = true) {
  return accountHandleTools.useAccountHandle(account, fullServer)
}
