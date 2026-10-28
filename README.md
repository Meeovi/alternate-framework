# Alternate Framework (M Framework)

This repository contains the M Framework — a modular front-end framework and starter templates built with Nuxt and Vue. It provides a collection of themes, layers, packages, and integrations to accelerate building storefronts, apps, and integrations.

Top-level directories

- `apps/`: Example and production apps that use the framework (for example `ecosystem/meeovi`).
- `layers/`: Reusable Nuxt layers (features and verticals) such as `auth`, `commerce`, `shared`, `chat`, etc. Layers expose application code and can be composed into different apps or themes.
- `packages/plugins/`: Installable plugins (adapters, modules, themes, skills, scripts and patches), grouped into category folders such as `CMS-Content`, `Social`, `Storage`, `Payments`, `Themes` and `Skills`. For example `packages/plugins/Themes/starter-template` is the default starter theme you can run and extend.
- `integrations/`: Integration guides, example adapters and compatibility layers for other frameworks, platforms, or runtimes.
- `layers/*/app` and `layers/*/server`: Application-level and server-side code that each layer exposes.
- `docs/`: Documentation content and guides.
- `types/`: Global TypeScript declarations and shims used across the monorepo.

Quick notes

- The framework is implemented with Nuxt (Nuxt 4) and Vue 3 — components, composables, and pages follow the Nuxt/Vue conventions used in the `packages/plugins/Themes` and `layers` folders.
- Themes (in `packages/plugins/Themes/`) are runnable Nuxt projects. To run the starter theme, change into `packages/plugins/Themes/starter-template` and run `npm install` and `npm run dev`.
- The repository uses a monorepo layout; package installs and scripts may run postinstall hooks. If postinstall scripts fail during root `npm install`, try installing with `--legacy-peer-deps` or inspect the package's `postinstall` script (for example `packages/modules/localization`).
- Many UI components in this repo depend on third-party UI libraries (e.g., `@storefront-ui/vue`). Ensure peer dependencies match the workspace Vue version to avoid runtime mismatches.

Where to start

- For theme development: see `packages/plugins/Themes/starter-template/app` for pages, components, and layouts.
- For shared building blocks: inspect `layers/shared/app` and `layers/*/app` for composables and components.
- For adapter or integration development: look under the category folders in `packages/plugins/` (for example `packages/plugins/Developer-Tools/adapter-starter` is the adapter template) and `integrations/`.

If you need help running the starter theme or debugging installs, open an issue or ask in the project chat — common troubleshooting steps are documented in package-level READMEs where applicable.

How to rebuild the demo (demo.meeovicms.com)

The demo runs the production build of `apps/ecosystem/meeovi-frontend` (systemd service `meeovi-demo` on port 3011, behind Apache). It is built from this checkout, so commit what you want on it first.

1. On the server, as root: `/home/meebuzo/.meeovi-demo/deploy.sh`
   - It runs `nuxt build` memory-capped at 12 GB (unbounded builds have run the server out of memory). The build takes about 30 minutes.
   - It then copies `.output` to `/home/meebuzo/public_html/demo`, copies the app's `.env` to `/home/meebuzo/.meeovi-demo/base.env`, and restarts `meeovi-demo`.
   - To redeploy the last build without rebuilding: `deploy.sh --no-build`.
2. Run it in the background or in `tmux`, so the build survives a dropped SSH session, e.g. `/home/meebuzo/.meeovi-demo/deploy.sh > /tmp/demo-deploy.log 2>&1 &`
3. When it prints `Deployed.`, check https://demo.meeovicms.com, and the logs with `journalctl -u meeovi-demo -f`.

Settings the server reads at start-up (`NUXT_*` overrides) can be changed in `/home/meebuzo/.meeovi-demo/demo.env` and applied with `systemctl restart meeovi-demo`, without a rebuild. Anything else in `runtimeConfig` is fixed at build time and needs a rebuild.

License: see repository root or individual package manifests for license information.

--
Generated README — concise overview for contributors and maintainers.
