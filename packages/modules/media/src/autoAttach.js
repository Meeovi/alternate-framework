function parsePluginsAttr(attr) {
    if (!attr)
        return [];
    return attr.split(',').map(s => s.trim()).filter(Boolean);
}
async function loadPluginModule(spec) {
    if (typeof spec === 'string') {
        try {
            return await import(/* @vite-ignore */ spec);
        }
        catch (err) {
            // ignore import error; caller may try global
            return null;
        }
    }
    if (spec.src) {
        try {
            return await import(/* @vite-ignore */ spec.src);
        }
        catch (err) {
            return null;
        }
    }
    return null;
}
async function registerPlugin(videojs, name, mod) {
    if (!mod) {
        // try global
        const g = globalThis[name] || globalThis[`videojs-${name}`];
        if (g) {
            try {
                videojs.registerPlugin?.(name, g);
                return true;
            }
            catch (e) {
                return false;
            }
        }
        return false;
    }
    const plugin = mod.default ?? mod[name] ?? mod;
    try {
        if (typeof plugin === 'function') {
            videojs.registerPlugin?.(name, plugin);
            return true;
        }
    }
    catch (err) {
        return false;
    }
    return false;
}
async function ensurePluginsRegistered(videojs, specs) {
    const registered = [];
    for (const s of specs) {
        const name = typeof s === 'string' ? s : s.name;
        if (!name)
            continue;
        // skip if already registered
        if (videojs.getPlugin && videojs.getPlugin(name)) {
            registered.push(name);
            continue;
        }
        const mod = await loadPluginModule(s).catch(() => null);
        const ok = await registerPlugin(videojs, name, mod);
        if (ok)
            registered.push(name);
    }
    return registered;
}
function parseElementPluginOptions(el) {
    const attr = el.getAttribute('data-plugins');
    const plugins = parsePluginsAttr(attr);
    return plugins;
}
function parseElementPluginOptionsMap(el) {
    const attr = el.getAttribute('data-plugins-options');
    if (!attr)
        return {};
    try {
        return JSON.parse(attr);
    }
    catch (e) {
        return {};
    }
}
async function initElement(videojs, el, defaultPlugins = [], defaultPlayerOptions = {}, pluginsMap) {
    if (el.__mframework_media_initialized)
        return;
    const elementPlugins = parseElementPluginOptions(el);
    const plugins = elementPlugins.length ? elementPlugins.map(p => {
        // resolve via pluginsMap if provided
        if (pluginsMap && pluginsMap[p])
            return pluginsMap[p];
        return p;
    }) : defaultPlugins;
    await ensurePluginsRegistered(videojs, plugins);
    // collect options from data-player-options attr (JSON)
    let playerOptions = defaultPlayerOptions;
    const optsAttr = el.getAttribute('data-player-options');
    if (optsAttr) {
        try {
            playerOptions = { ...playerOptions, ...(JSON.parse(optsAttr) || {}) };
        }
        catch (e) { }
    }
    try {
        // initialize videojs player
        const player = videojs(el, playerOptions);
        el.__mframework_media_initialized = true;
        el.__mframework_media_player = player;
        // attach plugins with merged options
        try {
            await attachPluginsToElement(el, plugins, pluginsMap);
        }
        catch (e) { }
    }
    catch (err) {
        // ignore initialization errors
    }
}
// after player init, attach plugins with merged options
async function attachPluginsToElement(el, plugins, pluginsMap) {
    const player = el.__mframework_media_player;
    if (!player)
        return;
    const elementOptionsMap = parseElementPluginOptionsMap(el);
    for (const p of plugins) {
        const spec = typeof p === 'string' ? (pluginsMap && pluginsMap[p] ? pluginsMap[p] : p) : p;
        const pluginName = typeof spec === 'string' ? spec : spec.name;
        if (!pluginName)
            continue;
        const defaultOptions = typeof spec === 'string' ? undefined : spec.defaultOptions;
        const elementOptions = elementOptionsMap?.[pluginName] || elementOptionsMap?.[pluginName.replace(/-/g, '_')] || {};
        const merged = { ...(defaultOptions || {}), ...(elementOptions || {}) };
        try {
            const fn = player[pluginName];
            if (typeof fn === 'function') {
                // call the plugin initializer with merged options
                fn.call(player, merged);
            }
        }
        catch (e) {
            // ignore plugin init errors
        }
    }
}
export async function setupAutoAttach(opts) {
    if (typeof window === 'undefined')
        return;
    const selector = opts?.selector || 'video:not([data-mframework-media-initialized]), audio:not([data-mframework-media-initialized])';
    let videojs;
    try {
        const mod = await import('video.js');
        videojs = mod?.default ?? mod;
    }
    catch (err) {
        // try global fallback (when video.js is included via CDN)
        const g = globalThis.videojs || globalThis.videoJs || globalThis.VideoJS;
        if (g) {
            videojs = g;
        }
        else {
            return;
        }
    }
    const defaultPlugins = (opts?.plugins || []);
    const pluginsMap = opts?.pluginsMap;
    // initial pass
    const els = Array.from(document.querySelectorAll(selector));
    for (const el of els) {
        // skip if already handled
        if (el.__mframework_media_initialized)
            continue;
        initElement(videojs, el, defaultPlugins, opts?.playerOptions, pluginsMap);
    }
    // observe for dynamically added media elements
    const mo = new MutationObserver(muts => {
        for (const m of muts) {
            for (const node of Array.from(m.addedNodes)) {
                if (!(node instanceof HTMLElement))
                    continue;
                if (node.matches && node.matches(selector)) {
                    initElement(videojs, node, defaultPlugins, opts?.playerOptions, pluginsMap);
                }
                // also scan subtree
                const nested = Array.from(node.querySelectorAll ? node.querySelectorAll(selector) : []);
                for (const el of nested)
                    initElement(videojs, el, defaultPlugins, opts?.playerOptions, pluginsMap);
            }
        }
    });
    mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
    return { videojs, disconnect: () => mo.disconnect() };
}
export default setupAutoAttach;
