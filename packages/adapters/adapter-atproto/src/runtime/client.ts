import { AtpAgent } from '@atproto/api'

let agent: any = null

export function createAtprotoAgent(service?: string) {
  if (agent) return agent
  agent = new AtpAgent({ service: service || 'https://bsky.social' })
  return agent
}

export function getAtprotoAgent() {
  return agent
}

export function wrapAgent(agentInstance: any) {
  return {
    login: (...args: any[]) => agentInstance.login?.(...args),
    createAccount: (...args: any[]) => agentInstance.createAccount?.(...args),
    post: (...args: any[]) => agentInstance.post?.(...args),
    getTimeline: (...args: any[]) => agentInstance.getTimeline?.(...args),
    sessionManager: agentInstance.sessionManager
  }
}
