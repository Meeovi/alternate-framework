import { MFrameworkConfig } from './config'
import { MFrameworkContext } from '../runtime/context'
import { MFrameworkEventBus } from './events'
import { MFrameworkModule } from './module'

export interface MFrameworkApp {
  context: MFrameworkContext
  events: MFrameworkEventBus
  start(): Promise<MFrameworkContext>
}

export interface MFrameworkAppOptions {
  config: MFrameworkConfig
  modules?: MFrameworkModule[]
}