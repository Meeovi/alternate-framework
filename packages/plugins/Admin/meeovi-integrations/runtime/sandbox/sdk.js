/*
 * Meeovi integration sandbox SDK — load it in a sandboxed plugin's page:
 *
 *   <script src="__sdk.js"></script>
 *   <script src="app.js"></script>
 *
 * The page runs in <iframe sandbox="allow-scripts"> on an opaque origin, with
 * no cookies, storage, or access to the app. Everything goes through
 * `MeeoviSandbox`, over a private channel the host opens once:
 *
 *   const context = await MeeoviSandbox.ready    // what the host page passed in
 *   await MeeoviSandbox.data.get()                // this user's data for the plugin
 *   await MeeoviSandbox.data.update({ a: 1 })     // shallow-merge  (set: replace)
 *   await MeeoviSandbox.call('list.items')        // a capability the host lent
 *   MeeoviSandbox.ui.notify('Saved')              // host snackbar
 *
 * The frame's height follows the page's content automatically.
 */
(function () {
  'use strict'

  var port = null
  var seq = 0
  var pending = {}
  var resolveReady
  var ready = new Promise(function (resolve) { resolveReady = resolve })

  window.addEventListener('message', function (event) {
    // Only the embedding page, only once, and only with a port.
    if (port || event.source !== window.parent) return
    var msg = event.data
    if (!msg || msg.type !== 'meeovi:init' || !event.ports || !event.ports[0]) return
    port = event.ports[0]
    port.onmessage = function (m) {
      var reply = m.data || {}
      var waiter = pending[reply.id]
      if (!waiter) return
      delete pending[reply.id]
      if (reply.error) waiter.reject(new Error(String(reply.error)))
      else waiter.resolve(reply.result)
    }
    resolveReady(Object.freeze(msg.context || {}))
    watchHeight()
  })

  function call(method, params) {
    return ready.then(function () {
      return new Promise(function (resolve, reject) {
        var id = ++seq
        pending[id] = { resolve: resolve, reject: reject }
        port.postMessage({ id: id, method: String(method), params: params === undefined ? null : params })
      })
    })
  }

  function watchHeight() {
    var last = 0
    function report() {
      var height = Math.ceil(document.documentElement.scrollHeight)
      if (height !== last) {
        last = height
        call('ui.resize', height).catch(function () {})
      }
    }
    if (typeof ResizeObserver === 'function') new ResizeObserver(report).observe(document.documentElement)
    report()
  }

  window.MeeoviSandbox = Object.freeze({
    ready: ready,
    call: call,
    data: Object.freeze({
      get: function () { return call('data.get') },
      set: function (value) { return call('data.set', value) },
      update: function (value) { return call('data.update', value) },
    }),
    ui: Object.freeze({
      notify: function (text) { return call('ui.notify', String(text)) },
    }),
  })
})()
