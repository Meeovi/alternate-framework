export type Maybe<T> = T | null | undefined

export type ValueOf<T> = T[keyof T]

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}