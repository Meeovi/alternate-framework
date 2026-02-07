// Minimal local type helpers to replace select `type-fest` utilities
// These are intentionally small and conservative to keep type-checking stable

export type Simplify<T> = { [K in keyof T]: T[K] } & {}

export type MergeDeep<T, U> = T & U

export {}
