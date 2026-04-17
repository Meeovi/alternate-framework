import type {
    MFrameworkModule
} from '../types/module';

export function defineMFrameworkModule<T extends MFrameworkModule>(module: T): T {
  return module
}