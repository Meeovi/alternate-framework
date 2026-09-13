// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // ESLint silenced repo-wide — ignore every file so nothing is linted
  // in the editor, on the CLI, or via `turbo run lint`. Delete this entry
  // to re-enable linting.
  { ignores: ['**/*'] }
)
