// Publishes Meeovi's Bluesky feeds: one app.bsky.feed.generator record per
// feed in the site account's repo (ATPROTO_IDENTIFIER), pointing at the
// feed generator this site serves (did:web:ATPROTO_FEEDGEN_HOSTNAME, see
// layers/social/server/utils/feedgen.ts — keep FEEDS below in step with it).
//
//   node --env-file=<app .env> publish-feeds.mjs            # show what it would publish
//   node --env-file=<app .env> publish-feeds.mjs --publish  # publish (public!)
//   node --env-file=<app .env> publish-feeds.mjs --remove   # delete the records
//
// Publishing is public: the feeds can then be found and subscribed to in
// every Bluesky app. Re-running updates them (putRecord).
import { AtpAgent } from '@atproto/api'

const FEEDS = [
  { rkey: 'meeovi-members', displayName: 'Meeovi Members', description: 'The latest from people on Meeovi (meeovi.com) who connected their Bluesky account.' },
  { rkey: 'meeovi', displayName: 'Meeovi', description: 'Bluesky posts about Meeovi: links to meeovi.com and #meeovi.' },
]

const host = String(process.env.ATPROTO_FEEDGEN_HOSTNAME || '').trim().toLowerCase()
const service = process.env.ATPROTO_SERVICE || 'https://sky.meeovicms.com'
const identifier = process.env.ATPROTO_IDENTIFIER
const password = process.env.ATPROTO_APP_PASSWORD
const mode = process.argv.includes('--publish') ? 'publish' : process.argv.includes('--remove') ? 'remove' : 'dry-run'

if (!host) throw new Error('Set ATPROTO_FEEDGEN_HOSTNAME (e.g. meeovi.com)')
if (!identifier || !password) throw new Error('Set ATPROTO_IDENTIFIER and ATPROTO_APP_PASSWORD (the site account)')

// The generator must answer before Bluesky will accept a feed pointing at it.
const describe = await fetch(`https://${host}/xrpc/app.bsky.feed.describeFeedGenerator`).then((r) => r.ok ? r.json() : null).catch(() => null)
const didDoc = await fetch(`https://${host}/.well-known/did.json`).then((r) => r.ok ? r.json() : null).catch(() => null)
console.log('generator', `did:web:${host}`, describe ? 'answers' : 'DOES NOT ANSWER', '| did.json', didDoc ? 'ok' : 'MISSING')

const agent = new AtpAgent({ service })
await agent.login({ identifier, password })
console.log('publisher', agent.session.did, `(${agent.session.handle})`, '| mode', mode)

for (const feed of FEEDS) {
  const uri = `at://${agent.session.did}/app.bsky.feed.generator/${feed.rkey}`
  if (mode === 'dry-run') {
    console.log('would publish', uri, '→', feed.displayName)
    continue
  }
  if (mode === 'remove') {
    await agent.com.atproto.repo.deleteRecord({ repo: agent.session.did, collection: 'app.bsky.feed.generator', rkey: feed.rkey })
    console.log('removed', uri)
    continue
  }
  if (!describe || !didDoc) throw new Error(`https://${host} isn't serving the feed generator yet — deploy first`)
  await agent.com.atproto.repo.putRecord({
    repo: agent.session.did,
    collection: 'app.bsky.feed.generator',
    rkey: feed.rkey,
    record: {
      $type: 'app.bsky.feed.generator',
      did: `did:web:${host}`,
      displayName: feed.displayName,
      description: feed.description,
      createdAt: new Date().toISOString(),
    },
  })
  console.log('published', uri, `https://bsky.app/profile/${agent.session.did}/feed/${feed.rkey}`)
}
