import type { SocialDriverContract, Vibe, LiveStream } from '@mframework/alternate-sdk/contracts/social'
import { useSocialDriver } from '../useSocialDriver'

export const useVibez = () => {
  const social = useSocialDriver()

  const getVibez = async (opts?: { limit?: number }): Promise<Vibe[]> => {
    return social.getVibez?.(opts) ?? []
  }

  const uploadVibe = async (data: FormData): Promise<Vibe> => {
    return social.uploadVibe?.(data) ?? { id: '', url: '' }
  }

  const likeVibe = async (vibeId: string | number): Promise<{ success: boolean }> => {
    return social.likeVibe?.(String(vibeId)) ?? { success: false }
  }

  const getVibe = async (vibeId: string | number): Promise<Vibe | null> => {
    return social.getVibe?.(String(vibeId)) ?? null
  }

  const startLive = async (opts?: { title?: string }): Promise<LiveStream> => {
    return social.startLive?.(opts) ?? { id: '', isLive: false }
  }

  const stopLive = async (liveId: string | number): Promise<{ success: boolean }> => {
    return social.stopLive?.(String(liveId)) ?? { success: false }
  }

  const getLive = async (liveId: string | number): Promise<LiveStream | null> => {
    return social.getLive?.(String(liveId)) ?? null
  }

  const getLiveViewers = async (liveId: string | number): Promise<{ count: number }> => {
    return social.getLiveViewers?.(String(liveId)) ?? { count: 0 }
  }

  return {
    getVibez,
    uploadVibe,
    likeVibe,
    getVibe,
    startLive,
    stopLive,
    getLive,
    getLiveViewers
  }
}
