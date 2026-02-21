import { computed } from "vue"
import { defineNuxtRouteMiddleware, useRuntimeConfig } from "nuxt/app"
import { useAuth } from "../composables/useAuth"
import { currentUser, currentServer, loginTo } from "../composables/users"
import { useMasto } from "../composables/masto"

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server)
    return

  if (!('server' in to.params))
    return

  const server = to.params.server as string || currentServer.value

  // Ensure BetterAuth session is loaded so we can rely on the shared
  // `currentUser` / `currentServer` state provided by the app.
  try {
    const auth: any = typeof useAuth !== 'undefined' ? useAuth() : null
    if (auth && typeof auth.fetchSession === 'function')
      await auth.fetchSession()
  }
  catch (e) {
    // ignore; best-effort
  }

  const user = currentUser.value
  const masto = typeof useMasto !== 'undefined' ? useMasto() : null
  if (!user) {
    const fromServer = from.params.server || currentServer.value
    if (fromServer !== server && typeof loginTo === 'function' && masto)
      await loginTo(masto, { server })
    return
  }

  // No need to additionally resolve an id if we're already logged in
  if (user.server === server)
    return

  // Tags don't need to be redirected to a local id
  if (to.params.tag)
    return

  // Handle redirecting to new permalink structure for users with old links
  if (!useRuntimeConfig().public.singleInstance && !to.params.server) {
    return {
      ...to,
      params: {
        ...to.params,
        server: user.server,
      },
    }
  }

  try {
    // If we're already on an account page, we can search for this on the new instance
    if (to.params.account && to.name !== 'status' && to.params.account.includes('@')) {
      const account = await fetchAccountByHandle(to.params.account as string)
      if (account)
        return getAccountRoute(account)
    }

    // If we're logged in, search for the local id the account or status corresponds to
    const paginator = masto.client.value.v2.search.list({ q: `https:/${to.fullPath}`, resolve: true, limit: 1 })
    const result = await paginator.values().next()
    const { accounts, statuses } = result.value ?? { accounts: [], statuses: [] }

    if (statuses[0])
      return getStatusRoute(statuses[0])

    if (accounts[0])
      return getAccountRoute(accounts[0])
  }
  catch (err) {
    console.error(err)
  }

  return '/home'
})

function getStatusRoute(status: any) {
  return {
    name: 'status',
    params: {
      server: currentServer.value,
      account: status.account.acct,
      status: status.id,
    },
  }
}

function getAccountRoute(account: any) {
  return {
    name: 'account',
    params: {
      server: currentServer.value,
      account: account.acct,
    },
  }
}

async function fetchAccountByHandle(handle: string) {
  const masto = typeof useMasto !== 'undefined' ? useMasto() : null
  if (!masto)
    return null

  const paginator = masto.client.value.v2.search.list({
    q: handle,
    resolve: true,
    limit: 1,
  })
  const result = await paginator.values().next()
  const { accounts } = result.value ?? { accounts: [], statuses: [] }
  return accounts[0] ?? null
}

