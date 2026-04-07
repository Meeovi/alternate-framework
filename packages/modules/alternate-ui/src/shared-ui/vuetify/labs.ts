export const vuetifyLabComponentNames = [
  'VPullToRefresh',
  'VAvatarGroup',
  'VColorInput',
  'VCommandPalette',
  'VDateInput',
  'VFileUpload',
  'VFileUploadDropzone',
  'VFileUploadItem',
  'VFileUploadList',
  'VPie',
  'VVideo',
] as const

export type VuetifyLabComponentName = (typeof vuetifyLabComponentNames)[number]
