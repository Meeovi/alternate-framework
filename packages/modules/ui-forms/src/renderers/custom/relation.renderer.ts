export const relationRenderer = {
  key: 'relation',
  tester: (_scope: string, schema: Record<string, any>) => schema?.format === 'relation',
  component: 'SelectField',
}
