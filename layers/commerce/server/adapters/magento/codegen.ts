/**
 * Magento GraphQL Codegen Configuration
 *
 * Generates TypeScript types from the Magento GraphQL endpoint.
 * Run: npm run codegen:magento
 *
 * Types are generated to server/adapters/magento/generated/
 * Never edit generated files - they are auto-generated from schema.
 */

import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: process.env.MAGENTO_GRAPHQL_ENDPOINT || process.env.COMMERCE_GRAPHQL_ENDPOINT || process.env.MAGE_MAGENTO_GRAPHQL_URL || 'http://localhost:4000/graphql',
  documents: 'server/adapters/magento/operations/**/*.graphql',
  generates: {
    'server/adapters/magento/generated/types.ts': {
      plugins: ['typescript'],
      config: {
        enumsAsTypes: false,
        useIndexSignature: true,
        immutableTypes: true,
        namingConvention: 'change-case#pascalCase'
      }
    },
    'server/adapters/magento/generated/operations.ts': {
      plugins: ['typescript-operations'],
      config: {
        enumsAsTypes: false,
        useIndexSignature: true,
        immutableTypes: true,
        namingConvention: 'change-case#pascalCase'
      }
    }
  },
  ignoreNoDocuments: true
}

export default config
