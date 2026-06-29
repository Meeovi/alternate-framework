export const useVibez = () => {
  const nuxtApp = (globalThis as any).__nuxtApp || {}
  const adapter = nuxtApp?.$adapter || (globalThis as any).__adapter || null

  const call = async (method: string, payload: any, fallback: () => Promise<any>) => {
    if (adapter && typeof adapter[method] === 'function') {
      return adapter[method](payload)
    }
    return fallback()
  }

  const getVibez = (opts?: any) =>
    call('getVibez', opts, async () => {
      const params = new URLSearchParams({ ...(opts || {}) })
      const res = await fetch(`/api/social/vibez?${params}`)
      return res.json()
    })

  const uploadVibe = (data: FormData) =>
    call('uploadVibe', data, async () => {
      const res = await fetch(`/api/social/vibez`, {
        method: 'POST',
        body: data
      })
      return res.json()
    })

  const likeVibe = (vibeId: string | number) =>
    call('likeVibe', { vibeId }, async () => {
      const res = await fetch(`/api/social/vibez/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vibeId })
      })
      return res.json()
    })

  const getVibe = (vibeId: string | number) =>
    call('getVibe', { vibeId }, async () => {
      const res = await fetch(`/api/social/vibez/${vibeId}`)
      return res.json()
    })

  const startLive = (opts?: any) =>
    call('startLive', opts, async () => {
      const res = await fetch(`/api/social/vibez/live/start`, { method: 'POST' })
      return res.json()
    })

  const stopLive = (liveId: string | number) =>
    call('stopLive', { liveId }, async () => {
      const res = await fetch(`/api/social/vibez/live/${liveId}/stop`, { method: 'POST' })
      return res.json()
    })

  const getLive = (liveId: string | number) =>
    call('getLive', { liveId }, async () => {
      const res = await fetch(`/api/social/vibez/live/${liveId}`)
      return res.json()
    })

  const getLiveViewers = (liveId: string | number) =>
    call('getLiveViewers', { liveId }, async () => {
      const res = await fetch(`/api/social/vibez/live/${liveId}/viewers`)
      return res.json()
    })

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
