import { ofetch } from 'ofetch'

let client: any = null

export function createActivitypubClient(baseURL?: string) {
  if (client) return client
  client = ofetch.create({
    baseURL: baseURL || '/',
    headers: { 'Accept': 'application/activity+json' }
  })
  return client
}

export function getActivitypubClient() {
  return client
}
