import { createAtprotoAgent, wrapAgent } from './client'

export default (nuxtApp: any) => {
  const config: any = (globalThis as any).__meeovi_runtime_config || {}
  const service = config?.public?.atproto?.service
  const agent = createAtprotoAgent(service)
  const wrapped = wrapAgent(agent)
  if (nuxtApp && typeof nuxtApp.provide === 'function') {
    nuxtApp.provide('atproto', wrapped)
  } else {
    ;(globalThis as any).__meeovi_atproto = wrapped
  }
}
