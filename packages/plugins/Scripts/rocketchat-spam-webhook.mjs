#!/usr/bin/env node
/**
 * Creates (or updates) the Rocket.Chat outgoing webhook that sends every new
 * or edited message — discussion rooms (comments), groups and direct
 * messages — to the app's spam filter (layers/social/server/api/social/
 * discussions/moderate.post.ts), which deletes spam.
 *
 *   node --env-file=<app .env> rocketchat-spam-webhook.mjs https://<site>
 *
 * Reads ROCKETCHAT_URL, ROCKETCHAT_ADMIN_USER_ID, ROCKETCHAT_ADMIN_TOKEN and
 * NUXT_MEEOVI_DISCUSSIONS_MODERATION_TOKEN (the shared secret the webhook
 * sends; set the same value in the app's env). Safe to run again.
 */
const NAME = 'Meeovi spam filter'

const site = (process.argv[2] || '').replace(/\/+$/, '')
const { ROCKETCHAT_URL: rcUrl, ROCKETCHAT_ADMIN_USER_ID: userId, ROCKETCHAT_ADMIN_TOKEN: token, NUXT_MEEOVI_DISCUSSIONS_MODERATION_TOKEN: secret } = process.env
if (!/^https:\/\//.test(site) || !rcUrl || !userId || !token || !secret || secret.length < 32) {
  console.error('Usage: node --env-file=<app .env> rocketchat-spam-webhook.mjs https://<site>\n' +
    'Needs ROCKETCHAT_URL, ROCKETCHAT_ADMIN_USER_ID, ROCKETCHAT_ADMIN_TOKEN and a NUXT_MEEOVI_DISCUSSIONS_MODERATION_TOKEN of 32+ characters.')
  process.exit(1)
}

const rc = async (path, init = {}) => {
  const res = await fetch(`${rcUrl.replace(/\/+$/, '')}/api/v1/${path}`, {
    ...init,
    headers: { 'X-User-Id': userId, 'X-Auth-Token': token, 'content-type': 'application/json', ...init.headers },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.success === false) throw new Error(`${path}: ${data.error || res.status}`)
  return data
}

const integration = {
  type: 'webhook-outgoing',
  name: NAME,
  enabled: true,
  event: 'sendMessage',
  channel: 'all_public_channels,all_private_groups,all_direct_messages',
  urls: [`${site}/api/social/discussions/moderate`],
  token: secret,
  username: 'rocket.cat',
  runOnEdits: true,
  scriptEnabled: false,
  retryFailedCalls: true,
  retryCount: 3,
  retryDelay: 'powers-of-ten',
  triggerWordAnywhere: false,
  impersonateUser: false,
}

const { integrations = [] } = await rc('integrations.list?count=200')
const existing = integrations.find((i) => i.type === 'webhook-outgoing' && i.name === NAME)
if (existing) {
  await rc('integrations.update', { method: 'PUT', body: JSON.stringify({ ...integration, integrationId: existing._id }) })
  console.log(`Updated "${NAME}" → ${integration.urls[0]}`)
} else {
  await rc('integrations.create', { method: 'POST', body: JSON.stringify(integration) })
  console.log(`Created "${NAME}" → ${integration.urls[0]}`)
}
