// composables/useInstantSearchWidgets.ts
import type { Component } from 'vue'

export type InstantSearchWidgetConfig = {
  name?: string
  component?: Component
  props?: Record<string, any>
  condition?: () => boolean
}

export const widgetRegistry: Record<string, Component> = {
  // Results
  'hits': 'ais-hits',
  'infinite-hits': 'ais-infinite-hits',
  'highlight': 'ais-highlight',
  'snippet': 'ais-snippet',

  // Refinements
  'refinement-list': 'ais-refinement-list',
  'dynamic-widgets': 'ais-dynamic-widgets',
  'hierarchical-menu': 'ais-hierarchical-menu',
  'range-slider': 'ais-range-slider',
  'menu': 'ais-menu',
  'current-refinements': 'ais-current-refinements',
  'range-input': 'ais-range-input',
  'menu-select': 'ais-menu-select',
  'toggle-refinement': 'ais-toggle-refinement',
  'numeric-menu': 'ais-numeric-menu',
  'rating-menu': 'ais-rating-menu',
  'clear-refinements': 'ais-clear-refinements',

  // Pagination
  'pagination': 'ais-pagination',
  'hits-per-page': 'ais-hits-per-page',

  // Metadata
  'breadcrumb': 'ais-breadcrumb',
  'stats': 'ais-stats',
  'powered-by': 'ais-powered-by',
  'state-results': 'ais-state-results',
  'query-rule-custom-data': 'ais-query-rule-custom-data',
  'query-rule-context': 'ais-query-rule-context',

  // Sorting
  'sort-by': 'ais-sort-by',
  'relevant-sort': 'ais-relevant-sort',

  // Misc
  'configure': 'ais-configure',
  'panel': 'ais-panel',

  // Advanced
  'autocomplete': 'ais-autocomplete',
  'voice-search': 'ais-voice-search',
  'feeds': 'ais-feeds',
}

export function useInstantSearchWidgets() {
  return {
    widgetRegistry,
  }
}

export function resolveWidgetComponent(widget: InstantSearchWidgetConfig): Component | string {
  if (widget.component) return widget.component
  if (widget.name && widgetRegistry[widget.name]) return widgetRegistry[widget.name]
  if (widget.name) return `ais-${widget.name}`
  return null
}
