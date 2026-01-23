import { AlternateConfig } from './config'
import { AlternateContext } from '../runtime/context'
import { AlternateEventBus } from './events'
import { AlternateModule } from './module'

export interface AlternateApp {
  context: AlternateContext
  events: AlternateEventBus
  start(): Promise<AlternateContext>
}

export interface AlternateAppOptions {
  config: AlternateConfig
  modules?: AlternateModule[]
}