export const Directions = {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right',
  TOP: 'top',
  BOTTOM: 'bottom',
} as const

export type ChevronDirection = typeof Directions[keyof typeof Directions]

export const ChevronDefaults = {
  size: 16,
  direction: Directions.LEFT as ChevronDirection,
}

export default ChevronDefaults
