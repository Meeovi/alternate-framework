import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit';
export default defineNuxtModule({
    meta: {
        name: 'meeovi-shared',
        configKey: 'meeoviShared',
    },
    // Default configuration options of the Nuxt module
    defaults: {},
    setup(_options, _nuxt) {
        const resolver = createResolver(import.meta.url);
        // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
        addPlugin(resolver.resolve('./runtime/plugin'));
    },
});
