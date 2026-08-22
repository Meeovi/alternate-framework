import { describe, expect, test } from 'vitest'

// results.vue is a thin wrapper (title toolbar) that delegates all
// hits/pagination/no-matches rendering to ResultsComponent (a separate,
// heavier component with its own SSR-snapshot + live-InstantSearch async
// data flow) — so it's stubbed here rather than exercised, matching how the
// other ais* widgets are stubbed.
describe('results.vue', () => {
  test('falls back to "all items" when no query is present', async () => {
    const { mount } = await import('@vue/test-utils')
    const Results = await import('../../app/pages/results.vue').then(m => m.default)

    const wrapper = mount(Results, {
      global: {
        stubs: {
          ResultsComponent: { template: '<div class="results-component-stub" />' },
        },
      },
    })

    expect(wrapper.text()).toContain('Results for "all items"')
  })

  test('renders the ResultsComponent child', async () => {
    const { mount } = await import('@vue/test-utils')
    const Results = await import('../../app/pages/results.vue').then(m => m.default)

    const wrapper = mount(Results, {
      global: {
        stubs: {
          ResultsComponent: { template: '<div class="results-component-stub" />' },
        },
      },
    })

    expect(wrapper.find('.results-component-stub').exists()).toBe(true)
  })
})
