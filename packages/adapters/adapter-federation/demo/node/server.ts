import http from 'node:http'

import {
  createFederationProviders,
} from '../../src/providers/index'
import { createModerationEvent } from '../../src/moderation/events'
import { createOStatusPost } from '../../src/providers/ostatus/provider'
import { mergeProtocolTimelines } from '../../src/sync/timeline'

const port = Number(process.env.PORT ?? 3000)

function buildDemoPayload() {
  const providers = createFederationProviders()

  const ostatusPost = createOStatusPost({
    id: 'ostatus-demo-1',
    author: '@alice@example.social',
    content: 'Hello from OStatus demo post',
  })

  const moderation = createModerationEvent({
    protocol: 'activitypub',
    action: 'flag',
    actor: 'https://example.social/users/mod',
    target: 'https://example.social/posts/123',
    reason: 'demo-report',
  })

  const timeline = mergeProtocolTimelines([
    [{ id: 'ap-1', protocol: 'activitypub', createdAt: '2026-01-01T00:00:00.000Z', payload: { content: 'ap' } }],
    [{ id: 'at-1', protocol: 'atproto', createdAt: '2026-01-02T00:00:00.000Z', payload: { content: 'at' } }],
    [{ id: ostatusPost.id, protocol: 'ostatus', createdAt: ostatusPost.createdAt, payload: ostatusPost }],
  ])

  return {
    providerKeys: Object.keys(providers),
    ostatusPost,
    moderation,
    timeline,
  }
}

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>adapter-federation demo (Node)</title>
  </head>
  <body style="font-family: sans-serif; max-width: 900px; margin: 2rem auto; padding: 0 1rem">
    <h1>adapter-federation demo (Node)</h1>
    <p>
      This route shows a framework-agnostic demo for <code>@mframework/adapter-federation</code>.
      Open <code>/api/federation-demo</code> to inspect protocol helper output.
    </p>
  </body>
</html>`

const server = http.createServer((req, res) => {
  if (!req.url || req.url === '/' || req.url === '/federation-demo') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    res.end(html)
    return
  }

  if (req.url === '/api/federation-demo') {
    const payload = buildDemoPayload()
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify(payload, null, 2))
    return
  }

  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
  res.end('Not found')
})

server.listen(port, () => {
  console.log(`Node demo running on http://localhost:${port}/federation-demo`)
})
