import { getMediaConfig } from './config'
import { getMediaProvider } from './registry'

export function useMedia() {
  const { mediaProvider } = getMediaConfig()
  const provider = getMediaProvider(mediaProvider)

  return {
    upload: (...args: any[]) => {
      if (typeof (provider as any).upload === 'function') {
        return (provider as any).upload(...args)
      }
      throw new Error('Upload not supported by media provider')
    },
    getUrl: (...args: any[]) => {
      if (typeof (provider as any).getUrl === 'function') {
        return (provider as any).getUrl(...args)
      }
      throw new Error('getUrl not supported by media provider')
    }
  }
}
