export type PluginSpec = string | { name: string; src?: string; defaultOptions?: any }
export type PluginsMap = Record<string, PluginSpec>

function parsePluginsAttr(attr?: string): string[] {
  if (!attr) return []
  return attr.split(',').map(s => s.trim()).filter(Boolean)
}

async function loadPluginModule(spec: PluginSpec) {
  if (typeof spec === 'string') {
    try {
      return await import(/* @vite-ignore */ spec)
    } catch (err) {
      // ignore import error; caller may try global
      return null
    }
  }
  if (spec.src) {
    try {
      return await import(/* @vite-ignore */ spec.src)
    } catch (err) {
      return null
    }
  }
  return null
}

async function registerPlugin(videojs: any, name: string, mod: any) {
  if (!mod) {
    // try global
    const g = (globalThis as any)[name] || (globalThis as any)[`videojs-${name}`]
    if (g) {
      try { videojs.registerPlugin?.(name, g); return true } catch (e) { return false }
    }
    return false
  }

  const plugin = mod.default ?? mod[name] ?? mod
  try {
    if (typeof plugin === 'function') {
      videojs.registerPlugin?.(name, plugin)
      return true
    }
  } catch (err) {
    return false
  }
  return false
}

async function ensurePluginsRegistered(videojs: any, specs: PluginSpec[]) {
  const registered: string[] = []
  for (const s of specs) {
    const name = typeof s === 'string' ? s : s.name
    if (!name) continue
    // skip if already registered
    if (videojs.getPlugin && videojs.getPlugin(name)) { registered.push(name); continue }
    const mod = await loadPluginModule(s).catch(() => null)
    const ok = await registerPlugin(videojs, name, mod)
    if (ok) registered.push(name)
  }
  return registered
}

function parseElementPluginOptions(el: Element) {
  const attr = el.getAttribute('data-plugins')
  const plugins = parsePluginsAttr(attr)
  return plugins
}

function parseElementPluginOptionsMap(el: Element) {
  const attr = el.getAttribute('data-plugins-options')
  if (!attr) return {}
  try {
    return JSON.parse(attr)
  } catch (e) {
    return {}
  }
}

async function initElement(videojs: any, el: HTMLMediaElement, defaultPlugins: PluginSpec[] = [], defaultPlayerOptions: any = {}, pluginsMap?: PluginsMap) {
  if ((el as any).__mframework_media_initialized) return
  const elementPlugins = parseElementPluginOptions(el)
  const plugins: PluginSpec[] = elementPlugins.length ? elementPlugins.map(p => {
    // resolve via pluginsMap if provided
    if (pluginsMap && pluginsMap[p]) return pluginsMap[p]
    return p
  }) : defaultPlugins
  await ensurePluginsRegistered(videojs, plugins)
  // collect options from data-player-options attr (JSON)
  let playerOptions = defaultPlayerOptions
  const optsAttr = el.getAttribute('data-player-options')
  if (optsAttr) {
    try { playerOptions = { ...playerOptions, ...(JSON.parse(optsAttr) || {}) } } catch (e) {}
  }
  try {
    // initialize videojs player
    const player = videojs(el as any, playerOptions)
    ;(el as any).__mframework_media_initialized = true
    ;(el as any).__mframework_media_player = player
    // attach plugins with merged options
    try { await attachPluginsToElement(el, plugins, pluginsMap) } catch (e) {}
  } catch (err) {
    // ignore initialization errors
  }
}

  // after player init, attach plugins with merged options
async function attachPluginsToElement(el: HTMLMediaElement, plugins: PluginSpec[], pluginsMap?: PluginsMap) {
  const player = (el as any).__mframework_media_player
  if (!player) return
  const elementOptionsMap = parseElementPluginOptionsMap(el)
  for (const p of plugins) {
    const spec = typeof p === 'string' ? (pluginsMap && pluginsMap[p] ? pluginsMap[p] : p) : p
    const pluginName = typeof spec === 'string' ? spec : spec.name
    if (!pluginName) continue
    const defaultOptions = typeof spec === 'string' ? undefined : spec.defaultOptions
    const elementOptions = elementOptionsMap?.[pluginName] || elementOptionsMap?.[pluginName.replace(/-/g, '_')] || {}
    const merged = { ...(defaultOptions || {}), ...(elementOptions || {}) }
    try {
      const fn = (player as any)[pluginName]
      if (typeof fn === 'function') {
        // call the plugin initializer with merged options
        fn.call(player, merged)
      }
    } catch (e) {
      // ignore plugin init errors
    }
  }
}

export async function setupAutoAttach(opts?: { plugins?: PluginSpec[]; pluginsMap?: PluginsMap; playerOptions?: any; selector?: string }) {
  if (typeof window === 'undefined') return
  const selector = opts?.selector || 'video:not([data-mframework-media-initialized]), audio:not([data-mframework-media-initialized])'
  let videojs: any
  try {
    const mod = await import('video.js')
    videojs = mod?.default ?? mod
  } catch (err) {
    // try global fallback (when video.js is included via CDN)
    const g = (globalThis as any).videojs || (globalThis as any).videoJs || (globalThis as any).VideoJS
    if (g) {
      videojs = g
    } else {
      return
    }
  }

  const defaultPlugins = (opts?.plugins || []) as PluginSpec[]
  const pluginsMap = opts?.pluginsMap
  // initial pass
  const els = Array.from(document.querySelectorAll(selector)) as HTMLMediaElement[]
  for (const el of els) {
    // skip if already handled
    if ((el as any).__mframework_media_initialized) continue
    initElement(videojs, el, defaultPlugins, opts?.playerOptions, pluginsMap)
  }

  // observe for dynamically added media elements
  const mo = new MutationObserver(muts => {
    for (const m of muts) {
      for (const node of Array.from(m.addedNodes)) {
        if (!(node instanceof HTMLElement)) continue
          if (node.matches && node.matches(selector)) {
            initElement(videojs, node as HTMLMediaElement, defaultPlugins, opts?.playerOptions, pluginsMap)
        }
          // also scan subtree
          const nested = Array.from(node.querySelectorAll ? node.querySelectorAll(selector) : []) as HTMLMediaElement[]
        for (const el of nested) initElement(videojs, el, defaultPlugins, opts?.playerOptions, pluginsMap)
      }
    }
  })
  mo.observe(document.documentElement || document.body, { childList: true, subtree: true })
  return { videojs, disconnect: () => mo.disconnect() }
}

export default setupAutoAttach
