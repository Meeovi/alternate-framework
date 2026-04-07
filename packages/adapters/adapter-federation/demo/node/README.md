# Node demo

This demo starts a tiny Node server and uses `@mframework/adapter-federation` on the server side to expose protocol-agnostic example responses.

## Files

- `server.ts`: HTTP server with HTML route and JSON API demo route

## Setup

1. Install dependencies in your app:
   - `npm i @mframework/adapter-federation`
2. Run the demo server:
   - `tsx demo/node/server.ts`

## Try

- Visit `http://localhost:3000/federation-demo`
- Request `http://localhost:3000/api/federation-demo` for protocol helper output
