import { colors } from './colors'
import { spacing } from './spacing'
import { typography } from './typography'

export const tokens = {
	colors,
	typography,
	spacing,
} as const

export * from './colors'
export * from './spacing'
export * from './typography'
