import type { Component } from 'vue'

declare module 'vue' {
  interface App {
    component(name: string, component: Component): this
  }
}
