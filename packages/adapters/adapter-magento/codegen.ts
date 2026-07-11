import type {
  CodegenConfig
} from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: [
    './src/graphql/supergraph.graphql'
  ],
  documents: [
    './playground/components/**/*.{vue,graphql}',
    './playground/pages/**/*.{vue,graphql}',
    './playground/layouts/**/*.{vue,graphql}',
    './playground/composables/**/*.{ts,graphql}',
    './playground/plugins/**/*.{ts,graphql}',
  ],
  ignoreNoDocuments: true,
  generates: {
    './src/graphql/gql/': {
      preset: 'client',
      plugins: [
        'typescript', // <-- This plugin forces it to output ALL types, enums, and inputs from the supergraph
      ],
      config: {
        skipTypename: false,
        // Optional: keeps the output cleaner if you don't use scalars
        avoidOptionals: true,
        useTypeImports: true
      }
    },
    './src/graphql/schema-types.ts': {
      plugins: ['typescript'],
      config: {
        // Enforce that your types match exactly what comes from the mesh
        useTypeImports: true,
      },
    },
  }
}

export default config
