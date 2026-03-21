import { generate } from '@graphql-codegen/cli'

export async function runMApiCodegen() {
  await generate(
    {
      config: 'codegen.yml'
    },
    true
  )
}
