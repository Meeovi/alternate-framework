import { defineVuetifyConfiguration } from 'vuetify-nuxt-module/custom-configuration'
import { vuetifyLabComponentNames } from '../../src/shared-ui/vuetify/labs'

export default defineVuetifyConfiguration({
  labComponents: [...vuetifyLabComponentNames],
})
