export const richTextRenderer = {
  key: 'richtext',
  tester: (_scope: string, schema: Record<string, any>) => schema?.format === 'richtext',
  component: 'RichTextField',
}
