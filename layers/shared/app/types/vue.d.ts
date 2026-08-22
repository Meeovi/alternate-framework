import type { Component } from 'vue'

declare module 'vue' {
  interface App<HostElement = any> {
    component(name: string, component: Component): this
  }
}
