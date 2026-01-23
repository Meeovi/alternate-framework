const queries: Record<string, any> = {}
const mutations: Record<string, any> = {}
const subscriptions: Record<string, any> = {}

export function registerQuery(name: string, operation: any) {
  queries[name] = operation
}

export function registerMutation(name: string, operation: any) {
  mutations[name] = operation
}

export function registerSubscription(name: string, operation: any) {
  subscriptions[name] = operation
}

export function getQuery(name: string) {
  return queries[name]
}

export function getMutation(name: string) {
  return mutations[name]
}

export function getSubscription(name: string) {
  return subscriptions[name]
}
