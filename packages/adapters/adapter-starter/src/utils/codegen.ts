import type {
  CodegenConfig
} from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: [
    './graphql/supergraph.graphql'
  ],
  documents: [
    './app/components/**/*.{vue,graphql}',
    './app/pages/**/*.{vue,graphql}',
    './app/layouts/**/*.{vue,graphql}',
    './app/composables/**/*.{ts,graphql}',
    './app/plugins/**/*.{ts,graphql}',
  ],
  ignoreNoDocuments: true,
  generates: {
    './graphql/gql/': {
      preset: 'client',
      config: {
        useTypeImports: true
      }
    }
  }
}

export default config
