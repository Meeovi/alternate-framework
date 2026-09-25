# adapter-federation framework demos

This directory mirrors the framework-coverage style used in alternate-media demos and shows how to integrate `@mframework/adapter-federation` in multiple runtimes.

## Included demos

- [node](./node/README.md)
- [next-js](./next-js/README.md)
- [nuxt](./nuxt/README.md)
- [sveltekit](./sveltekit/README.md)
- [solid-start](./solid-start/README.md)
- [tanstack-start](./tanstack-start/README.md)
- [tanstack-start-solid](./tanstack-start-solid/README.md)

## What each demo shows

- Initializing provider registry via `createFederationProviders()`
- Building a protocol-agnostic feed with `sync.mergeTimelines(...)`
- Creating protocol-specific publish payloads (`activitypub`, `atproto`, `ostatus`, `forgefed`)
- Cross-protocol helpers for attachments and moderation events

## Quick usage snippet

```ts
import { createFederationProviders, mergeProtocolTimelines } from '@mframework/adapter-federation'

const providers = createFederationProviders()

const merged = mergeProtocolTimelines([
  [{ id: '1', protocol: 'activitypub', createdAt: new Date().toISOString(), payload: {} }],
  [{ id: '2', protocol: 'atproto', createdAt: new Date().toISOString(), payload: {} }],
])

console.log(Object.keys(providers), merged.length)
```

## Smoke test

From adapter-federation root:

```bash
npm run demo:smoke
```

Custom host and path:

```bash
BASE_URL=http://localhost:3000 DEMO_PATH=/federation-demo ./demo/smoke-test.sh
```
