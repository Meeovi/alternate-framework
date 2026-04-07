/// <reference path="../../env.d.ts" />

import type { App, Plugin } from 'vue'
import BooleanInput from '../../components/BooleanInput.vue'
import Button from '../../components/Button.vue'
import Card from '../../components/Card.vue'
import CssOnlyDropdown from '../../components/CssOnlyDropdown.vue'
import ErrorBoundary from '../../components/ErrorBoundary.vue'
import Motionable from '../../components/Motionable.vue'
import RadialProgress from '../../components/RadialProgress.vue'
import ScrollTop from '../../components/ScrollTop.vue'
import SelectInput from '../../components/SelectInput.vue'
import TextInput from '../../components/TextInput.vue'
import '../../styles/index.css'

export interface AlternateUIVueOptions {
  prefix?: string
}

export function createAlternateUIPlugin(options: AlternateUIVueOptions = {}): Plugin {
  const prefix = options.prefix || 'Aui'

  return {
    install(app: App) {
      app.component(`${prefix}BooleanInput`, BooleanInput)
      app.component(`${prefix}Button`, Button)
      app.component(`${prefix}Card`, Card)
      app.component(`${prefix}CssOnlyDropdown`, CssOnlyDropdown)
      app.component(`${prefix}ErrorBoundary`, ErrorBoundary)
      app.component(`${prefix}Motionable`, Motionable)
      app.component(`${prefix}RadialProgress`, RadialProgress)
      app.component(`${prefix}ScrollTop`, ScrollTop)
      app.component(`${prefix}SelectInput`, SelectInput)
      app.component(`${prefix}TextInput`, TextInput)
    },
  }
}

export default createAlternateUIPlugin
