type OperationMap = Record<string, any>

const queries: OperationMap = {}
const mutations: OperationMap = {}
const subscriptions: OperationMap = {}

function setNested(map: OperationMap, ns: string, value: any) {
  const parts = ns.split('.')
  let current = map

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    current[part] = current[part] || {}
    current = current[part]
  }

  current[parts[parts.length - 1]] = value
}

function getNested(map: OperationMap, ns: string) {
  const parts = ns.split('.')
  let current: any = map

  for (const part of parts) {
    current = current?.[part]
    if (!current) return undefined
  }

  return current
}

export function registerNamespacedQuery(namespace: string, name: string, op: any) {
  setNested(queries, `${namespace}.${name}`, op)
}

export function registerNamespacedMutation(namespace: string, name: string, op: any) {
  setNested(mutations, `${namespace}.${name}`, op)
}

export function registerNamespacedSubscription(namespace: string, name: string, op: any) {
  setNested(subscriptions, `${namespace}.${name}`, op)
}

export function getQuery(ns: string) {
  return getNested(queries, ns)
}

export function getMutation(ns: string) {
  return getNested(mutations, ns)
}

export function getSubscription(ns: string) {
  return getNested(subscriptions, ns)
}
