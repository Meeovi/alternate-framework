import withNuxt from './.playground/.nuxt/eslint.config.mjs'

// ESLint silenced repo-wide — ignore every file. Delete the arg to re-enable.
export default withNuxt({ ignores: ['**/*'] })
