import { getActivitypubClient } from '../client'

export const useActivitypub = () => {
  const client = getActivitypubClient() || (globalThis as any).__meeovi_activitypub_client

  const getInbox = async () => {
    return await client('/inbox')
  }

  const getOutbox = async () => {
    return await client('/outbox')
  }

  const postActivity = async (activity: Record<string, any>) => {
    return await client('/outbox', {
      method: 'POST',
      body: activity
    })
  }

  return { getInbox, getOutbox, postActivity }
}
