import type { SocialDriverContract, Post, Notification } from 'alternate-sdk/contracts'
import { useSocialDriver } from '../useSocialDriver'

export const useFeeds = () => {
  const social = useSocialDriver()

  const getFeed = async (type: string, opts?: { limit?: number; offset?: number }): Promise<Post[]> => {
    return social.feed.getFeed?.(type, opts) ?? []
  }

  const getUserFeed = async (userId: string | number, opts?: { limit?: number; offset?: number }): Promise<Post[]> => {
    return social.feed.getUserFeed?.(String(userId), opts) ?? []
  }

  const getNotifications = async (opts?: { limit?: number; offset?: number; unreadOnly?: boolean }): Promise<Notification[]> => {
    return social.feed.getNotifications?.(opts) ?? []
  }

  const markNotificationRead = async (notificationId: string | number): Promise<{ success: boolean }> => {
    return social.feed.markNotificationRead?.(String(notificationId)) ?? { success: false }
  }

  return {
    getFeed,
    getUserFeed,
    getNotifications,
    markNotificationRead
  }
}
