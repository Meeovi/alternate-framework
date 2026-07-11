import { getMeshInstance } from '../mesh/runtime.js'

export async function buildQuery(typeName: string, fields?: string[]) {
  const mesh = await getMeshInstance()
  const schema = mesh.schema

  const type = schema.getType(typeName)
  if (!type || !('getFields' in type)) {
    throw new Error(`Type ${typeName} not found in schema`)
  }

  const availableFields = Object.keys(type.getFields())
  const selectedFields = fields ?? availableFields

  return `
    query DynamicQuery {
      ${typeName.toLowerCase()} {
        ${selectedFields.join('\n')}
      }
    }
  `
}
