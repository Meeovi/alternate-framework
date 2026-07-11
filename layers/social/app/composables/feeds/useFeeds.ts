import type { SocialDriverContract, Post, Notification } from '@mframework/alternate-sdk/contracts/social'

const useSocialDriver = (): SocialDriverContract => {
  const nuxtApp = useNuxtApp()
  return nuxtApp?.$sdk?.social ?? {} as SocialDriverContract
}

export const useFeeds = () => {
  const social = useSocialDriver()

  const getFeed = async (type: string, opts?: { limit?: number; offset?: number }): Promise<Post[]> => {
    return social.getFeed?.(type, opts) ?? []
  }

  const getUserFeed = async (userId: string | number, opts?: { limit?: number; offset?: number }): Promise<Post[]> => {
    return social.getUserFeed?.(String(userId), opts) ?? []
  }

  const getNotifications = async (opts?: { limit?: number; offset?: number; unreadOnly?: boolean }): Promise<Notification[]> => {
    return social.getNotifications?.(opts) ?? []
  }

  const markNotificationRead = async (notificationId: string | number): Promise<{ success: boolean }> => {
    return social.markNotificationRead?.(String(notificationId)) ?? { success: false }
  }

  return {
    getFeed,
    getUserFeed,
    getNotifications,
    markNotificationRead
  }
}