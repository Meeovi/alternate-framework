// Scoped ESLint setup for this layer, purpose-built to make the i18n
// coverage gap (see MEMORY/session notes: nuxt-i18n is wired up correctly
// but almost none of this layer's own component text is actually
// translated) an actionable, repeatable checklist instead of something that
// has to be rediscovered by hand every time.
//
// `@intlify/vue-i18n/no-raw-text` flags every hardcoded string in a
// template — run `npm run lint:i18n` to get the full, current inventory of
// what still needs to move into i18n/locales/*.json. `no-missing-keys`
// catches `$t('...')` calls whose key doesn't exist in either locale file,
// so a typo or partial translation doesn't silently fall back to the raw
// key in production.
import vue from 'eslint-plugin-vue'
import vueI18n from '@intlify/eslint-plugin-vue-i18n'
import tsParser from '@typescript-eslint/parser'

export default [
  {
    ignores: ['.nuxt/**', '.output/**', 'dist/**', 'node_modules/**', 'test/**'],
  },
  // 'flat/base' (not 'flat/recommended') deliberately — this config exists
  // to scan for i18n gaps, not to be a general Vue style linter. 'base'
  // gives correct .vue SFC parsing without turning on indentation/attribute-
  // order/etc. rules that would otherwise drown the i18n findings in noise.
  ...vue.configs['flat/base'],
  ...vueI18n.configs['flat/recommended'],
  {
    // eslint-plugin-vue's vue-eslint-parser handles the SFC itself, but
    // needs to be told to hand <script lang="ts"> blocks to the TS parser —
    // without this every type annotation/optional chain in a <script
    // setup lang="ts"> block is a parse error, which silently drops that
    // whole file from the no-raw-text scan.
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
      },
    },
  },
  {
    settings: {
      'vue-i18n': {
        localeDir: './i18n/locales/*.json',
        messageSyntaxVersion: '^11.0.0',
      },
    },
    rules: {
      // Vuetify prop-driven text isn't caught (e.g. label="..." on custom
      // components isn't a text node), so this is a floor, not a
      // guarantee — but it catches the overwhelming majority: every plain
      // string sitting directly in a template.
      '@intlify/vue-i18n/no-raw-text': 'warn',
      '@intlify/vue-i18n/no-missing-keys': 'error',
    },
  },
]
