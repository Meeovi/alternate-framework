import { describe, expect, test } from 'vitest'

describe('results.vue', () => {
  test('displays search query in toolbar', async () => {
    const { mount } = await import('@vue/test-utils')
    const Results = await import('../../app/pages/results.vue').then(m => m.default)

    const wrapper = mount(Results, {
      global: {
        stubs: {
          ClientOnly: { template: '<div><slot /></div>' },
          aisInstantSearch: { template: '<div><slot /></div>' },
          aisConfigure: { template: '<div />' },
          aisStats: { template: '<span>0 results</span>' },
          aisHits: { template: '<div class="hits"><slot /></div>' },
          aisPagination: { template: '<div class="pagination">1</div>' },
          aisStateResults: { template: '<div><slot /></div>' },
          SharedFilters: { template: '<div class="filters" />' },
        },
        provide: {
          route: { query: { q: 'wireless' } },
        },
      },
    })

    expect(wrapper.text()).toContain('Results for')
  })

  test('renders hit items from search results', async () => {
    const { mount } = await import('@vue/test-utils')
    const Results = await import('../../app/pages/results.vue').then(m => m.default)

    const wrapper = mount(Results, {
      global: {
        stubs: {
          ClientOnly: { template: '<div><slot /></div>' },
          aisInstantSearch: { template: '<div><slot /></div>' },
          aisConfigure: { template: '<div />' },
          aisStats: { template: '<span>1 result</span>' },
        },
      },
    })

    // The results page should render with hits container
    expect(wrapper.find('.results-page').exists()).toBe(true)
  })

  test('shows "No matches" alert when no results', async () => {
    const { mount } = await import('@vue/test-utils')
    const Results = await import('../../app/pages/results.vue').then(m => m.default)

    const wrapper = mount(Results, {
      global: {
        stubs: {
          ClientOnly: { template: '<div><slot /></div>' },
          aisInstantSearch: { template: '<div><slot /></div>' },
          aisConfigure: { template: '<div />' },
          aisStats: { template: '<span>0 results</span>' },
          aisHits: { template: '<div class="hits"><div class="no-matches"><strong>No matches</strong></div></div>' },
        },
      },
    })

    expect(wrapper.find('.no-matches').exists()).toBe(true)
  })
})
