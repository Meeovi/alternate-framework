// Runs inside a sandboxed auth plugin's own process (see runner.ts), started
// with Node's permission model (no files, child processes, workers, addons
// or inspector), no code generation from strings, an empty environment and
// a small heap. Before the plugin's code loads, this:
//
//  - limits network connections to the plugin's declared hosts (TLS or
//    plain TCP through net.Socket — which fetch, http, https and tls all
//    use), resolving names itself and refusing private / loopback
//    addresses, so an allowed name can't be pointed at this server;
//  - turns off DNS and UDP for plugin code (a lookup is itself a way to
//    send data out);
//  - takes away process.kill and process.send, so the plugin can't signal
//    the app, and talks to it only through the ctx this runner hands it.
//
// The host sends { t: 'init', source, hosts } once, then { t: 'call', ... }
// per hook or endpoint; the plugin reaches its store, settings and the
// audit log only through the ctx it's given (RPC back to the host).
import net from 'node:net'
import dns from 'node:dns'
import dgram from 'node:dgram'
import { syncBuiltinESMExports } from 'node:module'

const send = process.send.bind(process)
const onMessage = (listener) => process.on('message', listener)

// ---------------------------------------------------------------------------
// Network

let allowedHosts = []
const hostAllowed = (name) => allowedHosts.some((h) => (h.startsWith('*.') ? name.endsWith(h.slice(1)) && name.length > h.length - 1 : name === h))
const denied = (what) => Object.assign(new Error(`sandbox: ${what} is not allowed`), { code: 'ERR_SANDBOX_NET' })

const realLookup = dns.lookup
const privateAddress = (ip) => (net.isIPv4(ip)
  ? /^(0|10|127)\.|^169\.254\.|^172\.(1[6-9]|2\d|3[01])\.|^192\.168\.|^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.|^(22[4-9]|2[3-5]\d)\./.test(ip)
  : /^(::1?$|f[cd]|fe[89ab]|::ffff:|64:ff9b:)/i.test(ip))
function safeLookup(host, options, callback) {
  realLookup(host, { family: options?.family, hints: options?.hints, all: false }, (err, address, family) => {
    if (err) return callback(err)
    if (privateAddress(address)) return callback(denied(`${host} resolving to a private address`))
    if (options?.all) return callback(null, [{ address, family }])
    callback(null, address, family)
  })
}

const realConnect = net.Socket.prototype.connect
Object.defineProperty(net.Socket.prototype, 'connect', {
  value: function connect(...args) {
    let options
    let callback
    if (Array.isArray(args[0])) [options, callback] = args[0] // net's internal normalized form
    else if (args[0] !== null && typeof args[0] === 'object') [options, callback] = [args[0], args.find((a, i) => i > 0 && typeof a === 'function')]
    else if (typeof args[0] === 'string' && !/^\d+$/.test(args[0])) throw denied('a local socket')
    else [options, callback] = [{ port: args[0], host: typeof args[1] === 'string' ? args[1] : undefined }, args.find((a, i) => i > 0 && typeof a === 'function')]
    if (!options || options.path) throw denied('a local socket')
    const host = String(options.host ?? 'localhost').toLowerCase().replace(/\.$/, '')
    if (net.isIP(host) || !hostAllowed(host)) throw denied(`connecting to ${host}`)
    return realConnect.call(this, { ...options, host, lookup: safeLookup }, ...(callback ? [callback] : []))
  },
  writable: false,
  configurable: false,
})
const blockAll = (target) => {
  for (const key of Object.keys(target)) {
    if (typeof target[key] === 'function' && !/^[A-Z]/.test(key)) target[key] = () => { throw denied('DNS') }
  }
}
blockAll(dns)
blockAll(dns.promises)
dgram.createSocket = () => { throw denied('UDP') }
syncBuiltinESMExports()

// ---------------------------------------------------------------------------
// Process

// (The channel itself stays: the captured `send` needs it. A plugin that
// finds its way to it can only answer its own calls — the host matches
// answers to calls, and RPC is always scoped to this plugin.)
for (const key of ['kill', '_kill', 'send', 'disconnect']) {
  try {
    Object.defineProperty(process, key, { value: undefined, writable: false, configurable: false })
  } catch {}
}

// ---------------------------------------------------------------------------
// Calls from the host, and RPC back to it

let plugin = null
let rpcSeq = 0
const rpcPending = new Map()

function rpc(method, args) {
  const id = ++rpcSeq
  return new Promise((resolve, reject) => {
    rpcPending.set(id, { resolve, reject })
    send({ t: 'rpc', id, method, args })
  })
}

const plain = (value) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)))

function contextFor(settings) {
  return Object.freeze({
    settings: Object.freeze(structuredClone(settings ?? {})),
    store: Object.freeze({
      get: (key) => rpc('store.get', [String(key)]),
      set: (key, value) => rpc('store.set', [String(key), plain(value)]),
      delete: (key) => rpc('store.delete', [String(key)]),
      list: (prefix = '') => rpc('store.list', [String(prefix)]),
    }),
    log: (...parts) => { void rpc('log', [parts.map((p) => (typeof p === 'string' ? p : JSON.stringify(p))).join(' ').slice(0, 2000)]) },
    audit: (action, details) => rpc('audit', [String(action), plain(details ?? null)]),
  })
}

const errorText = (error) => String(error?.message ?? error).slice(0, 500)

onMessage(async (message) => {
  if (!message || typeof message !== 'object') return
  if (message.t === 'rpc-result') {
    const pending = rpcPending.get(message.id)
    if (!pending) return
    rpcPending.delete(message.id)
    if (message.ok) pending.resolve(message.value)
    else pending.reject(new Error(message.error))
    return
  }
  if (message.t === 'init') {
    allowedHosts = Array.isArray(message.hosts) ? message.hosts.map(String) : []
    try {
      const mod = await import(`data:text/javascript;base64,${Buffer.from(String(message.source)).toString('base64')}`)
      plugin = mod.default
      if (!plugin || typeof plugin !== 'object') throw new Error('the server entry must default-export { hooks, endpoints }')
      const names = (obj) => Object.keys(obj && typeof obj === 'object' ? obj : {}).filter((k) => typeof obj[k] === 'function')
      send({ t: 'ready', hooks: names(plugin.hooks), endpoints: names(plugin.endpoints) })
    } catch (error) {
      send({ t: 'init-error', error: errorText(error) })
    }
    return
  }
  if (message.t === 'call') {
    const { id, kind, name, input, settings } = message
    try {
      const table = kind === 'hook' ? plugin?.hooks : plugin?.endpoints
      const fn = table?.[name]
      if (typeof fn !== 'function') throw new Error(`no ${kind} "${name}"`)
      const value = await fn(input, contextFor(settings))
      send({ t: 'result', id, ok: true, value: plain(value) ?? null })
    } catch (error) {
      send({ t: 'result', id, ok: false, error: errorText(error) })
    }
  }
})
