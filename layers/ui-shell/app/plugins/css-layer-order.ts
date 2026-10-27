/**
 * Cascade layer order, declared ahead of every stylesheet. A layer's rank
 * is fixed where its name first appears, and Vuetify's own declaration
 * (vuetify/styles) isn't reliably first: a component chunk such as
 * VAlert.css can load ahead of it, with Tailwind's layers in between. That
 * left vuetify-components BELOW Tailwind's preflight (`* { padding: 0 }`),
 * which zeroed v-main's padding in production builds and slid the page
 * under the app bar.
 *
 * Order: Tailwind's reset lowest, then Vuetify; Tailwind utility classes
 * beat Vuetify components; Vuetify's helper classes (ma-2, text-center)
 * and final transitions stay on top.
 */
export default defineNuxtPlugin(() => {
  useHead({
    style: [{
      key: 'css-layer-order',
      tagPriority: 'critical',
      textContent: '@layer properties, theme, base, vuetify-core, vuetify-components, vuetify-overrides, components, utilities, vuetify-utilities, vuetify-final;',
    }],
  })
})
