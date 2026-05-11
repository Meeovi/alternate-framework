import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: '../alternate-gateway/.mesh/schema.graphql',

  documents: './schema/**/*.graphql',

  generates: {
    './generated/types.ts': {
      plugins: [
        'typescript',
        'typescript-operations'
      ]
    },

    './generated/sdk.ts': {
      plugins: [
        'typescript',
        'typescript-graphql-request'
      ],
      config: {
        rawRequest: false,
        documentMode: 'string',
        skipTypename: false
      }
    },

    './generated/operations.ts': {
      plugins: [
        'typescript-document-nodes'
      ]
    }
  },

  hooks: {
    afterAllFileWrite: ['prettier --write']
  }
}

export default config
