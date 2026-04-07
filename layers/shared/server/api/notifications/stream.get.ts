import { defineEventHandler, setResponseHeaders } from 'h3'
import { toWire } from '../../../shared/notifications/schema'
import {
  computeNotificationsEtag,
  getNotificationGateway,
  resolveNotificationUserId,
} from '../../utils/notifications/hub'

const STREAM_SNAPSHOT_LIMIT = 20

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })

  event.node.res.flushHeaders?.()

  const gateway = getNotificationGateway()
  const userId = resolveNotificationUserId(event)

  let closed = false
  let lastEtag = ''

  const sendEvent = (name: string, payload: unknown) => {
    if (closed) return
    event.node.res.write(`event: ${name}\n`)
    event.node.res.write(`data: ${JSON.stringify(payload)}\n\n`)
  }

  const pushSnapshot = async () => {
    if (closed) return
    const notifications = await gateway.list(userId, event)
    const nextEtag = computeNotificationsEtag(notifications)

    if (nextEtag === lastEtag) return
    lastEtag = nextEtag

    const latest = notifications.slice(0, STREAM_SNAPSHOT_LIMIT)

    sendEvent('snapshot', {
      notifications: latest.map(toWire),
      unreadCount: notifications.filter((item) => !item.read).length,
      total: notifications.length,
    })
  }

  const heartbeatTimer = setInterval(() => {
    if (closed) return
    event.node.res.write(': heartbeat\n\n')
  }, 15000)

  const pollTimer = setInterval(async () => {
    await pushSnapshot()
  }, 4000)

  const close = () => {
    if (closed) return
    closed = true
    clearInterval(heartbeatTimer)
    clearInterval(pollTimer)
    try {
      event.node.res.end()
    } catch (_) {
      // ignore socket close errors
    }
  }

  event.node.req.on('close', close)
  event.node.req.on('error', close)

  event.node.res.write('retry: 5000\n\n')
  sendEvent('ready', { ok: true })
  await pushSnapshot()

  await new Promise<void>((resolve) => {
    event.node.req.on('close', () => resolve())
    event.node.req.on('error', () => resolve())
  })
})
