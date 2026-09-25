export async function loadUiSchema(schemaPath: string): Promise<Record<string, any>> {
  const modules = import.meta.glob('../schemas/**/*.json')
  const wanted = `../schemas/${schemaPath}`
  const load = modules[wanted]

  if (!load) {
    throw new Error(`UI schema not found: ${schemaPath}`)
  }

  const mod = await load() as { default?: Record<string, any> }
  return mod.default || {}
}
