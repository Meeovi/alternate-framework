// Production tests for the auth layer (layers/auth). See lib.mjs for usage.
// Uses a fixed set of QA accounts (qauser / qaseller / qaadmin) on
// @resend.dev test addresses, created on first run and kept between runs.
import { randomBytes, createHmac } from 'node:crypto'
import {
  BASE, Jar, req, test, section, finish, expect, blocked, withDb, sleep,
  loadAccounts, saveAccounts, requireFromRepo, signInJar } from './lib.mjs'

const QA = [
  { key: 'user', username: 'qauser', name: 'QA User', role: null },
  { key: 'seller', username: 'qaseller', name: 'QA Seller', role: 'user,seller' },
  { key: 'admin', username: 'qaadmin', name: 'QA Admin', role: 'admin' },
]
// Resend's test inbox: accepted and never delivered, so no bounces.
const emailFor = (username) => `delivered+${username}@resend.dev`
const newPassword = () => `Qa!${randomBytes(15).toString('base64url')}9a`

const signIn = (jar, account) =>
  req('POST', '/api/auth/sign-in/email', { jar, json: { email: account.email, password: account.password } })

async function lastEmailAudit(email) {
  return withDb(async (db) => (await db.query(
    `select payload from auth.audit_log_entries
     where payload->>'category' = 'email' and payload->>'targetId' = $1
     order by created_at desc nulls last limit 1`, [email])).rows[0]?.payload ?? null)
}

// ---------------------------------------------------------------------------
// Sign-up, password reset and magic links need a Cloudflare Turnstile token
// (better-auth captcha plugin) — a script can't get one, so checks behind it
// report "blocked" rather than pass. CAP1 checks the gate itself.
const captchaGate = (r) => {
  if (r.status === 400 && /captcha/i.test(r.text)) blocked('CAPTCHA required on this endpoint (Turnstile) — verify in a browser')
}

section(`Setup — QA accounts on ${BASE}`)
const accounts = loadAccounts()
const jars = {}

for (const qa of QA) {
  await test(`SETUP-${qa.key}`, `account ${qa.username} exists`, async () => {
    const existing = await withDb(async (db) => (await db.query(
      `select id from public.users where lower(username) = $1`, [qa.username])).rows[0])
    if (!existing) {
      const password = newPassword()
      const r = await req('POST', '/api/auth/sign-up/email', {
        json: { email: emailFor(qa.username), password, name: qa.name, username: qa.username, callbackURL: '/login?verified=1' },
      })
      captchaGate(r)
      const created = await withDb(async (db) => (await db.query(
        `select id from public.users where lower(username) = $1`, [qa.username])).rows[0])
      expect(created, `sign-up did not create the user (HTTP ${r.status}: ${r.text.slice(0, 160)})`)
      accounts[qa.key] = { id: created.id, username: qa.username, email: emailFor(qa.username), password, signUpStatus: r.status }
      saveAccounts(accounts)
    }
    expect(accounts[qa.key]?.password, `no stored password for ${qa.username} in the accounts file`)
    // Fixture state: roles, and verified so they keep working once
    // requireEmailVerification is switched on at launch. better-auth's role
    // lives in users.auth_role (admin plugin field mapping) — users.role is
    // Supabase's own column (used by RLS) and must not be touched.
    await withDb((db) => db.query(
      `update public.users set auth_role = coalesce($2, auth_role), email_verified = true where lower(username) = $1`,
      [qa.username, qa.role]))
    accounts[qa.key].id = accounts[qa.key].id || existing?.id
    return existing ? 'reused' : `created (sign-up HTTP ${accounts[qa.key].signUpStatus})`
  })
}
const U = accounts.user, S = accounts.seller, A = accounts.admin

// ---------------------------------------------------------------------------
section('Registration rules (POST /api/auth/sign-up/email)')
const signUp = (body) => req('POST', '/api/auth/sign-up/email', {
  json: { name: 'QA Reject', callbackURL: '/login?verified=1', ...body },
})
const rejected = async (body, codePattern) => {
  const r = await signUp(body)
  captchaGate(r)
  expect(r.status >= 400 && r.status < 500, `expected a 4xx, got ${r.status}: ${r.text.slice(0, 160)}`)
  if (codePattern) expect(codePattern.test(r.text), `unexpected error: ${r.text.slice(0, 160)}`)
  return `${r.status} ${r.body?.code ?? r.body?.message ?? ''}`
}
await test('R1', 'username shorter than 3 is rejected', () =>
  rejected({ email: emailFor('qareject1'), password: newPassword(), username: 'qa' }, /USERNAME_TOO_SHORT|too short/i))
await test('R2', 'password shorter than 8 is rejected', () =>
  rejected({ email: emailFor('qareject2'), password: 'Qa!4567', username: 'qareject2' }, /PASSWORD_TOO_SHORT|too short/i))
await test('R3', 'username with invalid characters is rejected', () =>
  rejected({ email: emailFor('qareject3'), password: newPassword(), username: 'qa reject!' }))
await test('R4', '"admin" lookalike username is rejected', () =>
  rejected({ email: emailFor('qareject4'), password: newPassword(), username: 'adm1n' }))
await test('R5', 'duplicate email (different case) does not create a second account', async () => {
  // better-auth answers an existing email with a normal-looking 200 so the
  // response doesn't reveal which emails are registered — check the DB.
  const r = await signUp({ email: U.email.toUpperCase(), password: newPassword(), username: 'qareject5' })
  captchaGate(r)
  expect(r.status < 500, `HTTP ${r.status}`)
  const rows = await withDb(async (db) => (await db.query(
    `select name, username from public.users where lower(email) = lower($1)`, [U.email])).rows)
  expect(rows.length === 1, `${rows.length} accounts with that email`)
  expect(rows[0].username === 'qauser' && rows[0].name === 'QA User', `existing account changed: ${JSON.stringify(rows[0])}`)
  return `HTTP ${r.status} (no second account)`
})
await test('R6', 'duplicate username (different case) is rejected', () =>
  rejected({ email: emailFor('qareject6'), password: newPassword(), username: 'QAUser' }, /USERNAME|taken|exist/i))
await test('R7', 'known-breached password is rejected (haveIBeenPwned)', () =>
  rejected({ email: emailFor('qareject7'), password: 'password123', username: 'qareject7' }, /PASSWORD_COMPROMISED|compromised|breach|pwned/i))
await test('R8', 'none of the rejected sign-ups created a user', async () => {
  const leaked = await withDb(async (db) => (await db.query(
    `select username, email from public.users where email ilike 'delivered+qareject%@resend.dev' or username like 'qareject%'`)).rows)
  expect(!leaked.length, `created anyway: ${leaked.map(u => u.email).join(', ')}`)
})

// ---------------------------------------------------------------------------
section('Sign-in, session and sign-out')
await test('S1', 'email + password sign-in sets a secure session cookie', async () => {
  // Later checks need the user's session either way (lib.mjs signInJar).
  jars.user = await signInJar(U)
  const r = await signIn(new Jar(), U)
  captchaGate(r)
  expect(r.status === 200, `HTTP ${r.status}: ${r.text.slice(0, 160)}`)
  const cookie = r.setCookies.find(c => /session_token=/.test(c))
  expect(cookie, 'no session_token cookie set')
  expect(/;\s*secure/i.test(cookie), 'session cookie is not Secure')
  expect(/;\s*httponly/i.test(cookie), 'session cookie is not HttpOnly')
  expect(/samesite=(lax|strict)/i.test(cookie), `session cookie SameSite is not Lax/Strict: ${cookie.split(';').slice(1).join(';')}`)
  return cookie.split('=')[0]
})
await test('S2', 'get-session returns the user without secrets', async () => {
  const r = await req('GET', '/api/auth/get-session', { jar: jars.user })
  expect(r.body?.user?.id === U.id, `wrong/no user: ${r.text.slice(0, 160)}`)
  for (const secret of ['password', 'encryptedPassword', 'encrypted_password'])
    expect(!(secret in r.body.user), `session user exposes "${secret}"`)
  const notable = ['stripeCustomerId', 'polarCustomerId', 'magentoCustomerId'].filter(k => k in r.body.user)
  return notable.length ? `note: also returns ${notable.join(', ')}` : ''
})
await test('S3', 'wrong password is rejected with 401', async () => {
  const r = await signIn(new Jar(), { ...U, password: `${U.password}x` })
  captchaGate(r)
  expect(r.status === 401, `HTTP ${r.status}`)
  return r.body?.message
})
await test('S4', 'unknown email gives the same answer as a wrong password', async () => {
  const wrong = await signIn(new Jar(), { ...U, password: `${U.password}x` })
  captchaGate(wrong)
  const unknown = await signIn(new Jar(), { email: emailFor('qanobody'), password: U.password })
  expect(unknown.status === wrong.status && unknown.body?.message === wrong.body?.message,
    `differs (${unknown.status} "${unknown.body?.message}" vs ${wrong.status} "${wrong.body?.message}") — reveals which emails exist`)
})
await test('S5', 'sign-in by username works, case-insensitively', async () => {
  const r = await req('POST', '/api/auth/sign-in/username', { jar: new Jar(), json: { username: 'QAUser', password: U.password } })
  captchaGate(r)
  expect(r.status === 200 && r.body?.user?.id === U.id, `HTTP ${r.status}: ${r.text.slice(0, 160)}`)
})
await test('S6', 'sign-out ends the session', async () => {
  const jar = await signInJar(U)
  const out = await req('POST', '/api/auth/sign-out', { jar, json: {} })
  expect(out.status === 200, `sign-out HTTP ${out.status}`)
  const after = await req('GET', '/api/auth/get-session', { jar })
  expect(!after.body?.user, 'session still valid after sign-out')
})

// ---------------------------------------------------------------------------
section('Route protection (auth / seller middleware)')
for (const qa of ['seller', 'admin']) {
  await test(`S1-${qa}`, `${qa} account has a working session`, async () => {
    jars[qa] = await signInJar(accounts[qa])
    const r = await req('GET', '/api/auth/get-session', { jar: jars[qa] })
    expect(r.body?.user?.id === accounts[qa].id, `HTTP ${r.status}: ${r.text.slice(0, 160)}`)
  })
}
const location = (r) => r.headers.get('location') || ''
await test('P1', '/workspace sends a signed-out visitor to /login?redirect=', async () => {
  const r = await req('GET', '/workspace')
  expect([301, 302, 307].includes(r.status) && /\/login\?redirect=(%2F|\/)workspace/.test(location(r)), `HTTP ${r.status} → ${location(r)}`)
})
await test('P2', '/workspace loads for a signed-in user', async () => {
  const r = await req('GET', '/workspace', { jar: jars.user })
  expect(r.status === 200, `HTTP ${r.status} → ${location(r)}`)
})
await test('P3', 'seller page sends a non-seller back to /workspace', async () => {
  const r = await req('GET', '/workspace/system/shop', { jar: jars.user })
  expect([301, 302, 307].includes(r.status) && /\/workspace$/.test(location(r).replace(/\?.*$/, '')), `HTTP ${r.status} → ${location(r)}`)
})
await test('P4', 'seller page loads for a seller', async () => {
  const r = await req('GET', '/workspace/system/shop', { jar: jars.seller })
  expect(r.status === 200, `HTTP ${r.status} → ${location(r)}`)
})
for (const [id, path, marker] of [
  ['P5', '/register', /Username/], ['P6', '/login', /<form|v-form|Sign In/i], ['P7', '/forgot-password', /<html/i],
  ['P8', '/reset-password', /<html/i], ['P9', '/verify-email', /<html/i],
]) {
  await test(id, `${path} renders`, async () => {
    const r = await req('GET', path)
    expect(r.status === 200, `HTTP ${r.status} → ${location(r)}`)
    expect(marker.test(r.text), `page doesn't contain ${marker}`)
  })
}

// ---------------------------------------------------------------------------
section('Profile page (/u/:slug, /api/profiles/:slug)')
await test('F1', 'profile API resolves a username and never returns the email', async () => {
  const r = await req('GET', '/api/profiles/qauser')
  expect(r.status === 200 && r.body?.id === U.id, `HTTP ${r.status}: ${r.text.slice(0, 160)}`)
  expect(!/@resend\.dev|"email"/i.test(r.text), 'response contains an email address')
})
await test('F2', 'profile API resolves a user id', async () => {
  const r = await req('GET', `/api/profiles/${U.id}`)
  expect(r.status === 200 && r.body?.username === 'qauser', `HTTP ${r.status}`)
})
await test('F3', 'unknown profile is a 404', async () => {
  const r = await req('GET', '/api/profiles/qa-nobody-here')
  expect(r.status === 404, `HTTP ${r.status}`)
})
await test('F4', '/u/qauser renders the profile', async () => {
  const r = await req('GET', '/u/qauser')
  expect(r.status === 200 && /QA User/.test(r.text) && /@qauser/.test(r.text), `HTTP ${r.status}, name/@username not in page`)
})

// ---------------------------------------------------------------------------
section('Content ownership through the CMS proxy (/api/cms/items/posts)')
let postId = null
await test('O1', 'signed-out create is refused', async () => {
  const r = await req('POST', '/api/cms/items/posts', { json: { title: 'qa anon', status: 'draft' } })
  expect(r.status === 401, `HTTP ${r.status}`)
})
await test('O2', 'create stamps creator_id with the signed-in user (spoofing ignored)', async () => {
  const r = await req('POST', '/api/cms/items/posts', { jar: jars.user, json: { title: 'QA ownership test (auto-deleted)', status: 'draft', creator_id: S.id } })
  expect(r.status === 200, `HTTP ${r.status}: ${r.text.slice(0, 160)}`)
  postId = r.body?.data?.id
  expect(postId, 'no id returned')
  expect(r.body.data.creator_id === U.id, `creator_id is ${r.body.data.creator_id}, expected ${U.id}`)
})
const patchPost = (jar, body = { title: 'QA ownership test (edited)' }) =>
  req('PATCH', `/api/cms/items/posts/${postId}`, { jar, json: body })
await test('O3', "another user can't edit it", async () => {
  if (!postId) blocked('no test post')
  const r = await patchPost(jars.seller)
  expect(r.status === 403, `HTTP ${r.status}: ${r.text.slice(0, 120)}`)
})
await test('O4', "another user can't delete it", async () => {
  if (!postId) blocked('no test post')
  const r = await req('DELETE', `/api/cms/items/posts/${postId}`, { jar: jars.seller })
  expect(r.status === 403, `HTTP ${r.status}`)
})
await test('O5', "a non-admin can't batch-edit posts", async () => {
  const r = await req('PATCH', '/api/cms/items/posts', { jar: jars.seller, json: { keys: [postId], data: { title: 'x' } } })
  expect(r.status === 403, `HTTP ${r.status}`)
})
await test('O6', 'the owner can edit it, but not reassign creator_id', async () => {
  if (!postId) blocked('no test post')
  const r = await patchPost(jars.user, { title: 'QA ownership test (owner edit)', creator_id: S.id })
  expect(r.status === 200, `HTTP ${r.status}: ${r.text.slice(0, 120)}`)
  expect(r.body?.data?.creator_id === U.id, `creator_id changed to ${r.body?.data?.creator_id}`)
})
await test('O7', 'an admin can edit it', async () => {
  if (!postId) blocked('no test post')
  const r = await patchPost(jars.admin, { title: 'QA ownership test (admin edit)' })
  expect(r.status === 200, `HTTP ${r.status}: ${r.text.slice(0, 120)}`)
})
await test('O8', 'the owner can delete it', async () => {
  if (!postId) blocked('no test post')
  const r = await req('DELETE', `/api/cms/items/posts/${postId}`, { jar: jars.user })
  expect(r.status === 204 || r.status === 200, `HTTP ${r.status}`)
  postId = null
})

// ---------------------------------------------------------------------------
section('Passwords')
await test('C1', 'change-password refuses a password shorter than 8', async () => {
  const r = await req('POST', '/api/auth/change-password', { jar: jars.user, json: { currentPassword: U.password, newPassword: 'Qa!4567' } })
  expect(r.status >= 400 && r.status < 500, `HTTP ${r.status}`)
  return `${r.status} ${r.body?.code ?? ''}`
})
await test('C2', 'change-password works and the new password signs in', async () => {
  const next = newPassword()
  const r = await req('POST', '/api/auth/change-password', { jar: jars.user, json: { currentPassword: U.password, newPassword: next } })
  expect(r.status === 200, `HTTP ${r.status}: ${r.text.slice(0, 160)}`)
  U.password = next; saveAccounts(accounts)
  const check = await signIn(new Jar(), U)
  captchaGate(check)
  expect(check.status === 200, `new password rejected: HTTP ${check.status}`)
})

// ---------------------------------------------------------------------------
section('Email-based flows (Resend)')
await test('E1', 'sign-up verification email was sent', async () => {
  const audit = await lastEmailAudit(U.email)
  if (!audit) blocked('no email audit entry for qauser (account created before auditing?)')
  if (audit.status !== 'success') blocked(`send failed: ${String(audit.details).slice(0, 90)}`)
})
await test('E2', 'verify-email accepts a valid token and marks the user verified', async () => {
  const secret = process.env.BETTER_AUTH_SECRET
  if (!secret) blocked('BETTER_AUTH_SECRET not in env')
  await withDb((db) => db.query(`update public.users set email_verified = false where id = $1`, [U.id]))
  const { SignJWT } = requireFromRepo('jose')
  const token = await new SignJWT({ email: U.email.toLowerCase() }).setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt().setExpirationTime(Math.floor(Date.now() / 1000) + 600).sign(new TextEncoder().encode(secret))
  const r = await req('GET', `/api/auth/verify-email?token=${token}&callbackURL=%2Flogin%3Fverified%3D1`)
  const verified = await withDb(async (db) => (await db.query(`select email_verified from public.users where id = $1`, [U.id])).rows[0]?.email_verified)
  await withDb((db) => db.query(`update public.users set email_verified = true where id = $1`, [U.id]))
  expect(verified === true, `not verified (HTTP ${r.status} → ${location(r)})`)
  return `HTTP ${r.status} → ${location(r) || '(no redirect)'}`
})
await test('E3', 'verify-email rejects a forged token', async () => {
  const { SignJWT } = requireFromRepo('jose')
  const token = await new SignJWT({ email: U.email }).setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(Math.floor(Date.now() / 1000) + 600).sign(new TextEncoder().encode('not-the-secret'))
  const r = await req('GET', `/api/auth/verify-email?token=${token}`)
  expect(r.status >= 400 || /error=/.test(location(r)), `accepted: HTTP ${r.status} → ${location(r)}`)
})
await test('E4', 'password-reset request is answered and the email is sent', async () => {
  const r = await req('POST', '/api/auth/request-password-reset', { json: { email: S.email, redirectTo: '/reset-password' } })
  captchaGate(r)
  expect(r.status === 200, `HTTP ${r.status}: ${r.text.slice(0, 120)}`)
  await sleep(1500)
  const audit = await lastEmailAudit(S.email)
  if (!audit || audit.action !== 'reset_password') blocked('request accepted, but no reset_password email was recorded')
  if (audit.status !== 'success') blocked(`request accepted, but the send failed: ${String(audit.details).slice(0, 90)}`)
})
await test('E5', 'password-reset request for an unknown email looks identical', async () => {
  const r = await req('POST', '/api/auth/request-password-reset', { json: { email: emailFor('qanobody'), redirectTo: '/reset-password' } })
  captchaGate(r)
  expect(r.status === 200, `HTTP ${r.status} — reveals which emails exist`)
})
await test('CAP1', 'sign-in, account creation and email-sending endpoints demand a CAPTCHA', async () => {
  const missing = []
  for (const [path, json] of [
    ['/api/auth/sign-in/email', { email: emailFor('qanobody'), password: 'not-the-password-123' }],
    ['/api/auth/sign-in/username', { username: 'qanobody', password: 'not-the-password-123' }],
    ['/api/auth/send-verification-email', { email: emailFor('qanobody') }],
    ['/api/auth/email-otp/send-verification-otp', { email: emailFor('qanobody'), type: 'sign-in' }],
    ['/api/auth/sign-up/email', { email: emailFor('qacaptcha'), password: newPassword(), name: 'QA Captcha', username: 'qacaptcha' }],
    ['/api/auth/request-password-reset', { email: emailFor('qanobody'), redirectTo: '/reset-password' }],
    ['/api/auth/sign-in/magic-link', { email: emailFor('qanobody'), callbackURL: '/' }],
    ['/api/auth/sign-in/anonymous', {}],
  ]) {
    const r = await req('POST', path, { pace: false, json, headers: { 'x-captcha-response': 'not-a-real-token' } })
    if (!(r.status === 400 || r.status === 403) || !/captcha|verification/i.test(r.text)) missing.push(`${path} → ${r.status}`)
  }
  expect(!missing.length, `no CAPTCHA check: ${missing.join('; ')}`)
})

// ---------------------------------------------------------------------------
section('Two-factor authentication (TOTP) — on qaadmin, disabled again afterwards')
function totp(secretBase32, step = 30, digits = 6) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let bits = ''
  for (const ch of secretBase32.replace(/=+$/, '').toUpperCase()) bits += alphabet.indexOf(ch).toString(2).padStart(5, '0')
  const key = Buffer.from(bits.match(/.{8}/g).map(b => parseInt(b, 2)))
  const counter = Buffer.alloc(8); counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 1000 / step)))
  const h = createHmac('sha1', key).update(counter).digest()
  const o = h[h.length - 1] & 0xf
  return String(((h.readUInt32BE(o) & 0x7fffffff) % 10 ** digits)).padStart(digits, '0')
}
let totpSecret = null
await test('T1', 'enable 2FA returns a TOTP URI and backup codes', async () => {
  const r = await req('POST', '/api/auth/two-factor/enable', { jar: jars.admin, json: { password: A.password } })
  expect(r.status === 200 && r.body?.totpURI, `HTTP ${r.status}: ${r.text.slice(0, 160)}`)
  totpSecret = new URL(r.body.totpURI).searchParams.get('secret')
  expect(Array.isArray(r.body.backupCodes) && r.body.backupCodes.length, 'no backup codes')
})
await test('T2', 'a TOTP code confirms 2FA', async () => {
  if (!totpSecret) blocked('2FA not enabled')
  const r = await req('POST', '/api/auth/two-factor/verify-totp', { jar: jars.admin, json: { code: totp(totpSecret) } })
  expect(r.status === 200, `HTTP ${r.status}: ${r.text.slice(0, 160)}`)
})
await test('T3', 'password sign-in now stops at the 2FA step', async () => {
  if (!totpSecret) blocked('2FA not enabled')
  const jar = new Jar()
  const r = await signIn(jar, A)
  captchaGate(r)
  expect(r.status === 200 && r.body?.twoFactorRedirect === true, `no 2FA challenge: ${r.text.slice(0, 160)}`)
  const session = await req('GET', '/api/auth/get-session', { jar })
  expect(!session.body?.user, 'a full session was issued before the 2FA step')
  const wrong = await req('POST', '/api/auth/two-factor/verify-totp', { jar, json: { code: '000000' } })
  expect(wrong.status >= 400, `wrong code accepted: HTTP ${wrong.status}`)
  const right = await req('POST', '/api/auth/two-factor/verify-totp', { jar, json: { code: totp(totpSecret) } })
  expect(right.status === 200, `right code refused: HTTP ${right.status}`)
  const after = await req('GET', '/api/auth/get-session', { jar })
  expect(after.body?.user?.id === A.id, 'no session after the 2FA step')
})
await test('T4', 'disable 2FA again', async () => {
  if (!totpSecret) blocked('2FA not enabled')
  const r = await req('POST', '/api/auth/two-factor/disable', { jar: jars.admin, json: { password: A.password } })
  expect(r.status === 200, `HTTP ${r.status}: ${r.text.slice(0, 160)}`)
})

// ---------------------------------------------------------------------------
section('Other auth-layer endpoints')
await test('X1', 'Stripe Connect endpoints refuse a signed-out caller', async () => {
  const notes = []
  for (const [m, p] of [['GET', '/api/stripe/balance'], ['GET', '/api/stripe/payouts'], ['POST', '/api/stripe/account-link'], ['POST', '/api/stripe/onboard']]) {
    const r = await req(m, p, m === 'POST' ? { json: {} } : {})
    // 401, not 400 "No active organization": the session check comes first.
    // Beyond that, org owners/admins only (layers/auth/server/utils/stripeConnect.ts).
    expect(r.status === 401, `${p} → HTTP ${r.status}`)
    notes.push(`${p.split('/').pop()} ${r.status}`)
  }
  return notes.join(', ')
})
await test('X2', 'better-auth health check', async () => {
  const r = await req('GET', '/api/auth/ok')
  expect(r.status === 200, `HTTP ${r.status}`)
})
await test('X3', 'OpenAPI reference is not publicly exposed', async () => {
  const r = await req('GET', '/api/auth/reference')
  expect(r.status === 404 || r.status === 401 || r.status === 403, `public (HTTP ${r.status}) — lists every auth endpoint`)
})

// ---------------------------------------------------------------------------
section('Rate limiting (runs last: it locks this IP out of sign-in for a minute)')
await test('L1', 'repeated failed sign-ins hit the limit (5/min)', async () => {
  await sleep(61_000)
  let hit = 0
  for (let i = 0; i < 7; i++) {
    const r = await req('POST', '/api/auth/sign-in/email', { pace: false, json: { email: U.email, password: 'wrong-password-qa' } })
    if (r.status === 429) { hit = i + 1; break }
  }
  expect(hit, 'no 429 after 7 rapid failed sign-ins')
  return `429 on attempt ${hit}`
})
await test('L2', 'password-reset requests are rate limited', async () => {
  let hit = 0
  for (let i = 0; i < 8; i++) {
    const r = await req('POST', '/api/auth/request-password-reset', { pace: false, json: { email: emailFor('qanobody'), redirectTo: '/reset-password' } })
    if (r.status === 429) { hit = i + 1; break }
  }
  expect(hit, 'no 429 after 8 rapid reset requests — rate-limit rule names the old /forget-password path')
  return `429 on attempt ${hit}`
})

finish('/home/meebuzo/.meeovi-demo/test-results-auth.json')
