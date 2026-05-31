export const fileUploadRenderer = {
  key: 'fileupload',
  tester: (_scope: string, schema: Record<string, any>) => schema?.format === 'file',
  component: 'FileUploadField',
}
