import { AlternateModule } from '../types/module'

export function defineAlternateModule<T extends AlternateModule>(module: T): T {
  return module
}