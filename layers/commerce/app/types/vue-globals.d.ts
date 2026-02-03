// Minimal ambient declarations for Vue/Pinia globals used in the commerce layer
declare function ref<T = any>(value?: T): any
declare function computed<T = any>(fn: () => T): any
declare function readonly<T = any>(v: T): T
declare function reactive<T = any>(v: T): T
declare function watchEffect(fn: () => void): void

// Pinia-ish defineStore (layers may call defineStore during build time)
declare function defineStore(id: string, setup: any): any
