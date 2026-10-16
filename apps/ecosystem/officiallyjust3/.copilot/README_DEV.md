# Copilot Architecture Rules

## Directus Integration
- Never generate a Nuxt plugin for Directus.
- Never instantiate a Directus SDK client directly.
- Always use the existing `@mframework/adapter-directus`.
- All Directus communication must go through the gateway.
- Frontend code must use:
    const gateway = useGateway()
    const content = gateway.content
- Do not inject `$directus`, `$directus`, `$readItems`, or any global Directus helpers.
- Do not create `/app/plugins/directus.ts`.

## Gateway Pattern
- Backend adapters are created and registered only inside the gateway.
- Frontend uses composables, not plugins, to access gateway domains.
- Use `useGateway().content`, `useGateway().commerce`, `useGateway().search`, etc.

## Nuxt Plugin Rules
- Do not create plugins that wrap backend SDKs.
- Do not create plugins that duplicate gateway functionality.
- Only create plugins for UI or client-side utilities, never backend clients.
