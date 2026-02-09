import { getMediaConfig } from './config'
import { getMediaProvider } from './registry'
import setupAutoAttach, { PluginSpec } from './autoAttach'

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

// Auto attach media players on the client. The plugin list can be provided in
// `window.MFRAMEWORK_MEDIA_PLUGINS` as an array of plugin names or specs.
if (typeof window !== 'undefined') {
  try {
    const globalPlugins = (window as any).MFRAMEWORK_MEDIA_PLUGINS as PluginSpec[] | undefined
    const globalPluginsMap = (window as any).MFRAMEWORK_MEDIA_PLUGINS_MAP as Record<string, PluginSpec> | undefined
    // run after DOMContentLoaded
    const run = () => setupAutoAttach({ plugins: globalPlugins ?? [], pluginsMap: globalPluginsMap })
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', run, { once: true })
    } else {
      run()
    }
  } catch (e) {
    // ignore
  }
}

export { setupAutoAttach }
