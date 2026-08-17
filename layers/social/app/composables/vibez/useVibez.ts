import type { SocialDriverContract, Vibe, LiveStream } from 'alternate-sdk/contracts'
import { useSocialDriver } from '../useSocialDriver'

export const useVibez = () => {
  const social = useSocialDriver()

  const getVibez = async (opts?: { limit?: number }): Promise<Vibe[]> => {
    return social.vibez.getVibez?.(opts) ?? []
  }

  const uploadVibe = async (data: FormData): Promise<Vibe> => {
    return social.vibez.uploadVibe?.(data) ?? { id: '', url: '' }
  }

  const likeVibe = async (vibeId: string | number): Promise<{ success: boolean }> => {
    return social.vibez.likeVibe?.(String(vibeId)) ?? { success: false }
  }

  const getVibe = async (vibeId: string | number): Promise<Vibe | null> => {
    return social.vibez.getVibe?.(String(vibeId)) ?? null
  }

  const startLive = async (opts?: { title?: string }): Promise<LiveStream> => {
    return social.vibez.startLive?.(opts) ?? { id: '', isLive: false }
  }

  const stopLive = async (liveId: string | number): Promise<{ success: boolean }> => {
    return social.vibez.stopLive?.(String(liveId)) ?? { success: false }
  }

  const getLive = async (liveId: string | number): Promise<LiveStream | null> => {
    return social.vibez.getLive?.(String(liveId)) ?? null
  }

  const getLiveViewers = async (liveId: string | number): Promise<{ count: number }> => {
    return social.vibez.getLiveViewers?.(String(liveId)) ?? { count: 0 }
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
