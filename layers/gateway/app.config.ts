export default defineAppConfig({
  myLayer: {
    name: 'M Framework Gateway'
  }
})

declare module '@nuxt/schema' {
  interface AppConfigInput {
    myLayer?: {
      /** Project name */
      name?: string
    }
  }
}
