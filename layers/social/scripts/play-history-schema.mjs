#!/usr/bin/env node
// Creates Directus's `play_history` collection (per-account "Watch again" /
// "Listen again") and lets the app server's token use it. Safe to run again:
// what already exists is left alone.
//
//   DIRECTUS_URL=https://cms.example.com DIRECTUS_ADMIN_TOKEN=… node scripts/play-history-schema.mjs [--dry-run]
//
// Needs an admin token. Only the app server writes it (server/utils/playHistory.ts);
// the /api/cms proxy keeps it private.

const url = (process.env.DIRECTUS_URL || '').replace(/\/+$/, '')
const token = process.env.DIRECTUS_ADMIN_TOKEN
const policyName = process.env.APP_SERVER_POLICY || 'Meeovi app server'
const dryRun = process.argv.includes('--dry-run')
if (!url || !token) {
  console.error('Set DIRECTUS_URL and DIRECTUS_ADMIN_TOKEN')
  process.exit(1)
}

const COLLECTION = {
  collection: 'play_history',
  meta: {
    icon: 'history',
    note: 'What each account recently watched (vibes) or listened to (radio stations). Written by the app server.',
    sort_field: null,
  },
  schema: {},
  fields: [
    { field: 'id', type: 'integer', meta: { hidden: true, readonly: true, interface: 'input' }, schema: { is_primary_key: true, has_auto_increment: true } },
    { field: 'user_id', type: 'string', meta: { interface: 'input', readonly: true, note: 'The better-auth user id.' }, schema: { is_nullable: false, is_indexed: true } },
    {
      field: 'kind', type: 'string',
      meta: { interface: 'select-dropdown', readonly: true, options: { choices: [{ text: 'Watch', value: 'watch' }, { text: 'Listen', value: 'listen' }] } },
      schema: { is_nullable: false },
    },
    { field: 'item_id', type: 'string', meta: { interface: 'input', readonly: true, note: 'shorts.id (watch) or radios.id (listen).' }, schema: { is_nullable: false } },
    { field: 'played_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true }, schema: { is_nullable: false } },
  ],
}
const ACTIONS = ['read', 'create', 'update', 'delete']

async function api(path, init = {}) {
  const res = await fetch(`${url}${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...init.headers } })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path}: HTTP ${res.status} ${JSON.stringify(body?.errors?.[0]?.message ?? body)}`)
  return body?.data
}
const step = async (label, run) => {
  if (!dryRun) await run()
  console.log(`  + ${label}${dryRun ? ' (dry run)' : ''}`)
}

const collections = new Set((await api('/collections')).map((c) => c.collection))
if (collections.has('play_history')) console.log('  = play_history (already there)')
else await step('collection play_history', () => api('/collections', { method: 'POST', body: JSON.stringify(COLLECTION) }))

const [policy] = await api(`/policies?filter[name][_eq]=${encodeURIComponent(policyName)}&fields=id`)
if (!policy) throw new Error(`No policy named "${policyName}" (set APP_SERVER_POLICY)`)
const granted = new Set((await api(`/permissions?filter[policy][_eq]=${policy.id}&filter[collection][_eq]=play_history&fields=action&limit=-1`)).map((p) => p.action))
for (const action of ACTIONS) {
  if (granted.has(action)) console.log(`  = ${policyName}: ${action} (already there)`)
  else await step(`${policyName}: ${action}`, () => api('/permissions', {
    method: 'POST',
    body: JSON.stringify({ policy: policy.id, collection: 'play_history', action, fields: ['*'], permissions: {}, validation: {} }),
  }))
}
