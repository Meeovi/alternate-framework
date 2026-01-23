import {
  registerQuery,
  registerMutation,
  registerSubscription
} from './registry'

export function loadGraphQL() {
  // Load queries
  const queryModules = (import.meta as any).glob('../graphql/queries/*.ts', { eager: true })
  for (const path in queryModules) {
    const mod = queryModules[path]
    for (const key in mod) {
      registerQuery(key, mod[key])
    }
  }

  // Load mutations
  const mutationModules = (import.meta as any).glob('../graphql/mutations/*.ts', { eager: true })
  for (const path in mutationModules) {
    const mod = mutationModules[path]
    for (const key in mod) {
      registerMutation(key, mod[key])
    }
  }

  // Load subscriptions
  const subscriptionModules = (import.meta as any).glob('../graphql/subscriptions/*.ts', { eager: true })
  for (const path in subscriptionModules) {
    const mod = subscriptionModules[path]
    for (const key in mod) {
      registerSubscription(key, mod[key])
    }
  }
}
