# alternate-media framework demos

This directory mirrors the framework coverage from alternate-search demos and shows a media demo page for each framework.

## Included demos

- [node](./node/README.md)
- [next-js](./next-js/README.md)
- [nuxt](./nuxt/README.md)
- [sveltekit](./sveltekit/README.md)
- [solid-start](./solid-start/README.md)
- [tanstack-start](./tanstack-start/README.md)
- [tanstack-start-solid](./tanstack-start-solid/README.md)

## What each demo shows

- Mounting a media player with `@mframework/alternate-media`
- Loading an HLS source (`.m3u8`) or MP4 source
- Basic analytics hook usage
- Styling via `@mframework/alternate-media/styles/media.css`

## Smoke test

From module root:

```bash
npm run demo:smoke
```

Custom host and path:

```bash
BASE_URL=http://localhost:5173 DEMO_PATH=/media-demo ./demo/smoke-test.sh
```
