import { RestEndpoint } from "./types"

const restEndpoints: Record<string, RestEndpoint> = {}

export function registerRestEndpoint(name: string, endpoint: RestEndpoint) {
  restEndpoints[name] = endpoint
}

export function getRestEndpoint(name: string): RestEndpoint | undefined {
  return restEndpoints[name]
}
