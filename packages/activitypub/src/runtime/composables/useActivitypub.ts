export const useActivitypub = () => {
  const { $activitypub } = useNuxtApp()

  const getInbox = async () => {
    return await $activitypub('/inbox')
  }

  const getOutbox = async () => {
    return await $activitypub('/outbox')
  }

  const postActivity = async (activity: Record<string, any>) => {
    return await $activitypub('/outbox', {
      method: 'POST',
      body: activity
    })
  }

  return { getInbox, getOutbox, postActivity }
}
