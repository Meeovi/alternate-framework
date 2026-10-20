#!/usr/bin/env node
/**
 * Auth plugins (layers/auth server/utils/plugins) through the real app:
 * the site switch, settings and the sandboxed @mframework/auth-email-domains
 * plugin, from the integrations catalog to a refused account.
 *
 * Side effects, all undone at the end: switches auth-email-domains on for
 * the site with a block list of one made-up domain
 * (meeovi-plugin-test.invalid), so only that domain is refused while it
 * runs; tries to create one account at that domain — only after the
 * plugin's endpoint confirms it refuses it, because a created account would
 * also get a Stripe and a Magento customer. Then switches the plugin off and
 * removes its state and data.
 *
 *   node auth-plugins.mjs                 (against PROD_TEST_BASE_URL)
 */
import { BASE, blocked, expect, finish, loadAccounts, req, section, signInJar, test, withDb } from './lib.mjs'

const PLUGIN = '@mframework/auth-email-domains'
const SLUG = 'auth-email-domains'
const DOMAIN = 'meeovi-plugin-test.invalid'
const accounts = loadAccounts()
let admin
let user

async function cleanup() {
  await withDb(async (db) => {
    await db.query('delete from auth_plugins.plugins where package = $1', [PLUGIN])
    await db.query('delete from auth_plugins.kv where package = $1', [PLUGIN])
    // Only if the refusal failed: never leave a test account behind.
    await db.query('delete from users where email like $1', [`%@${DOMAIN}`])
  })
}

section(`Auth plugins — ${BASE}`)
await cleanup()

await test('AP1', 'sandboxed plugins start off: not listed as on, endpoints 404', async () => {
  const enabled = await req('GET', '/api/auth/plugin/enabled')
  expect(enabled.status === 200, `enabled list ${enabled.status}`)
  expect(!enabled.body.plugins.includes('email-domains'), `listed as on: ${enabled.text}`)
  const check = await req('GET', `/api/auth/plugin/email-domains/check?email=a@${DOMAIN}`)
  expect(check.status === 404, `check while off: ${check.status}`)
})

await test('AP2', 'site plugins are hidden from non-admins', async () => {
  user = await signInJar(accounts.user)
  const item = await req('GET', `/api/integrations/${SLUG}`, { jar: user })
  expect(item.status === 404, `user sees it: ${item.status}`)
  const catalog = await req('GET', '/api/integrations', { jar: user })
  expect(!catalog.body.items.some((i) => i.slug === SLUG), 'listed for a user')
  const settings = await req('PUT', `/api/integrations/${SLUG}/settings`, { jar: user, json: { mode: 'allow' } })
  expect(settings.status === 404, `user saved settings: ${settings.status}`)
  const install = await req('POST', `/api/integrations/${SLUG}/install`, { jar: user })
  expect(install.status === 404, `user installed it: ${install.status}`)
})

await test('AP3', 'admins see what it can do, and its settings', async () => {
  admin = await signInJar(accounts.admin)
  const { status, body } = await req('GET', `/api/integrations/${SLUG}`, { jar: admin })
  expect(status === 200, `item ${status}`)
  const item = body.item
  expect(item.scope === 'site' && item.sandboxed && item.state === 'available', `item ${JSON.stringify({ scope: item.scope, sandboxed: item.sandboxed, state: item.state })}`)
  expect(item.permissions.some((p) => p.includes('Checks every new account')), `permissions ${JSON.stringify(item.permissions)}`)
  expect(item.permissions.some((p) => p.includes('fails closed')), 'fail mode not shown')
  expect(Object.keys(item.settings).join() === 'mode,domains,message', `settings ${Object.keys(item.settings)}`)
})

await test('AP4', 'settings are validated, then saved', async () => {
  const bad = await req('PUT', `/api/integrations/${SLUG}/settings`, { jar: admin, json: { mode: 'sometimes' } })
  expect(bad.status === 400 && /Mode: must be one of block, allow/.test(bad.text), `bad mode: ${bad.status} ${bad.text.slice(0, 200)}`)
  const unknown = await req('PUT', `/api/integrations/${SLUG}/settings`, { jar: admin, json: { colour: 'red' } })
  expect(unknown.status === 400, `unknown key: ${unknown.status}`)
  const ok = await req('PUT', `/api/integrations/${SLUG}/settings`, { jar: admin, json: { mode: 'block', domains: [DOMAIN], message: 'Test domain refused.' } })
  expect(ok.status === 200 && ok.body.values.domains[0] === DOMAIN, `save: ${ok.status} ${ok.text.slice(0, 200)}`)
})

await test('AP5', 'an admin switches it on for the site', async () => {
  const install = await req('POST', `/api/integrations/${SLUG}/install`, { jar: admin })
  expect(install.status === 200, `install ${install.status} ${install.text.slice(0, 200)}`)
  const enabled = await req('GET', '/api/auth/plugin/enabled')
  expect(enabled.body.plugins.includes('email-domains'), `not on: ${enabled.text}`)
  const item = await req('GET', `/api/integrations/${SLUG}`, { jar: admin })
  expect(item.body.item.state === 'installed', `state ${item.body.item.state}`)
})

await test('AP6', 'its endpoint runs in the sandbox with the saved settings', async () => {
  const refused = await req('GET', `/api/auth/plugin/email-domains/check?email=a@${DOMAIN}`)
  expect(refused.status === 200 && refused.body.allowed === false, `blocked domain: ${refused.status} ${refused.text}`)
  const fine = await req('GET', '/api/auth/plugin/email-domains/check?email=a@example.com')
  expect(fine.status === 200 && fine.body.allowed === true, `other domain: ${fine.status} ${fine.text}`)
  const missing = await req('GET', '/api/auth/plugin/email-domains/check')
  expect(missing.status === 400, `no email: ${missing.status}`)
})

await test('AP7', 'its hook refuses an account at a blocked domain', async () => {
  // Creating an account also creates a Stripe customer and a Magento
  // customer (user.create.after hooks): only try once the plugin has shown
  // it will refuse this domain.
  const check = await req('GET', `/api/auth/plugin/email-domains/check?email=probe@${DOMAIN}`)
  if (check.body?.allowed !== false) blocked(`the plugin isn't refusing ${DOMAIN} yet (${check.status} ${check.text.slice(0, 100)}), so no account is attempted`)
  // better-auth only accepts its trusted origins (the site's own URL).
  const origin = process.env.NUXT_PUBLIC_SITE_URL || BASE
  const res = await req('POST', '/api/auth/admin/create-user', { jar: admin, headers: { origin }, json: { email: `probe@${DOMAIN}`, password: `Pw-${Date.now()}-x!Q9`, name: 'Plugin probe' } })
  const created = await withDb((db) => db.query('select id from users where email = $1', [`probe@${DOMAIN}`]))
  expect(!created.rowCount, 'the account was created')
  expect(res.status === 403 && /Test domain refused\./.test(res.text), `create-user: ${res.status} ${res.text.slice(0, 200)}`)
  const kv = await withDb((db) => db.query('select key, value from auth_plugins.kv where package = $1', [PLUGIN]))
  expect(kv.rows.some((r) => r.key.startsWith('refused:') && Number(r.value) >= 1), `store: ${JSON.stringify(kv.rows)}`)
})

await test('AP8', 'switched off, it is gone', async () => {
  const off = await req('DELETE', `/api/integrations/${SLUG}/install`, { jar: admin })
  expect(off.status === 200, `uninstall ${off.status}`)
  const check = await req('GET', `/api/auth/plugin/email-domains/check?email=a@${DOMAIN}`)
  expect(check.status === 404, `check after off: ${check.status}`)
  const enabled = await req('GET', '/api/auth/plugin/enabled')
  expect(!enabled.body.plugins.includes('email-domains'), 'still listed as on')
})

await test('AP9', 'every change is in the audit log', async () => {
  const { rows } = await withDb((db) => db.query(
    `select payload->>'action' as action from auth.audit_log_entries
     where payload->>'category' = 'auth-plugin' and payload->>'targetId' = $1 and created_at > now() - interval '10 minutes'`, [PLUGIN]))
  const actions = rows.map((r) => r.action)
  for (const a of ['plugin_settings_saved', 'plugin_enabled', 'email-domains:sign_up_refused', 'plugin_disabled']) {
    expect(actions.includes(a), `missing ${a} in ${actions}`)
  }
})

for (const jar of [admin, user]) if (jar) await req('POST', '/api/auth/sign-out', { jar, json: {} }).catch(() => {})
await cleanup()
finish()
