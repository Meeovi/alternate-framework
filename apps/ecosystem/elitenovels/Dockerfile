# syntax=docker/dockerfile:1
# www.elitenovels.com, built by Coolify from a clean clone of the monorepo.
#   Build context: repository root      Dockerfile: apps/ecosystem/elitenovels/Dockerfile
# Coolify passes the app's environment variables to the build as build args (Nuxt reads
# NUXT_PUBLIC_SITE_*, DIRECTUS_URL etc. while building) and again to the running container.

FROM node:24-bookworm AS build
WORKDIR /repo
# CI=1 skips the app's `nuxt prepare` postinstall. The heap cap keeps a build from
# starving the production sites that share this server.
# npm_config_nodedir: native modules (better-sqlite3) compile against the image's own Node headers
# instead of downloading them, which stalls from this server.
ENV CI=1 NUXT_TELEMETRY_DISABLED=1 NODE_OPTIONS=--max-old-space-size=8192 npm_config_nodedir=/usr/local
COPY . .
# npm install, not npm ci: it tolerates a lockfile that lags package.json (npm ci refuses).
# The npm cache mount persists between builds, so only new packages are downloaded.
RUN --mount=type=cache,target=/root/.npm npm install --no-audit --no-fund
RUN node packages/plugins/Scripts/docker/stub-missing-tsconfigs.cjs && npm run build -w apps/ecosystem/elitenovels

FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
COPY --from=build /repo/apps/ecosystem/elitenovels/.output ./.output
EXPOSE 3000
# Coolify's rolling update waits for "healthy" before moving traffic to a new container, and
# Traefik stops routing to an unhealthy one. So the check asks for a static file: it proves the
# server is up without depending on Directus (a slow Directus must not take the site offline).
# --start-interval makes a fresh container healthy within seconds of booting.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --start-interval=2s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/manifest.webmanifest').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
# IPv4 first: IPv6 from this server to Cloudflare hangs.
CMD ["node", "--dns-result-order=ipv4first", ".output/server/index.mjs"]
