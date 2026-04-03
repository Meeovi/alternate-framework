/**
 * Multi-Backend Search - Tests and Examples
 *
 * These tests verify:
 * - Parallel vs cascade query execution
 * - Result merging with proper weighting
 * - Error handling and degradation
 * - Timeout and resource limits
 * - Security (no credential leakage)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { multiBackendAdapter } from '@mframework/alternate-search';
import type { SearchAdapter, SearchResult } from '@mframework/alternate-search';

// Mock backends for testing
function createMockBackend(id: string, config?: { 
  delay?: number; 
  error?: Error;
  results?: SearchResult;
}): SearchAdapter {
  const defaultResults: SearchResult = {
    items: [
      { id: `${id}-1`, title: `Product from ${id}` },
      { id: `${id}-2`, title: `Another from ${id}` },
    ],
    total: 2,
    page: 1,
    pageSize: 20,
    facets: [],
  };

  return {
    async setup() {
      if (config?.delay) await new Promise((r) => setTimeout(r, config.delay));
    },
    async index() {
      if (config?.error) throw config.error;
    },
    async query() {
      if (config?.delay) await new Promise((r) => setTimeout(r, config.delay));
      if (config?.error) throw config.error;
      return config?.results ?? defaultResults;
    },
    async delete() {},
    async deleteWhere() {
      return 0;
    },
    async stats() {
      return { count: 2 };
    },
  };
}

describe('Multi-Backend Search Adapter', () => {
  describe('Parallel Query Execution', () => {
    it('queries all backends simultaneously', async () => {
      const startTime = Date.now();

      const adapter = multiBackendAdapter({
        backends: [
          {
            id: 'backend-1',
            adapter: createMockBackend('backend-1', { delay: 100 }),
            priority: 10,
            optional: false,
          },
          {
            id: 'backend-2',
            adapter: createMockBackend('backend-2', { delay: 100 }),
            priority: 20,
            optional: false,
          },
          {
            id: 'backend-3',
            adapter: createMockBackend('backend-3', { delay: 100 }),
            priority: 30,
            optional: false,
          },
        ],
        parallel: true,
        aggregationStrategy: 'merge',
      });

      const result = await adapter.query('products', { search: 'test' });

      const elapsed = Date.now() - startTime;

      // Should take ~100ms (all parallel), not ~300ms (sequential)
      expect(elapsed).toBeLessThan(200);
      // All 6 items should be merged (2 from each backend)
      expect(result.items.length).toBe(6);
      expect(result.total).toBe(6);
    });

    it('merges results with proper weighting', async () => {
      const adapter = multiBackendAdapter({
        backends: [
          {
            id: 'primary',
            adapter: createMockBackend('primary'),
            priority: 10,
            weight: 100, // Full weight
            optional: false,
          },
          {
            id: 'secondary',
            adapter: createMockBackend('secondary'),
            priority: 20,
            weight: 50, // Half weight
            optional: true,
          },
        ],
        aggregationStrategy: 'merge',
      });

      const result = await adapter.query('products', { search: 'test' });

      // Primary backend items should rank higher
      const primaryItems = result.items.filter((item) => item._source === 'primary');
      const secondaryItems = result.items.filter((item) => item._source === 'secondary');

      expect(primaryItems.length + secondaryItems.length).toBe(4);
      expect(primaryItems[0]._score).toBeGreaterThan((secondaryItems[0]?._score || 0));
    });
  });

  describe('Cascade Query Execution', () => {
    it('stops at first successful backend', async () => {
      const queryHistory: string[] = [];

      const backends = [
        {
          id: 'backend-1',
          adapter: {
            ...createMockBackend('backend-1'),
            async query() {
              queryHistory.push('backend-1');
              return {
                items: [{ id: '1', title: 'Result 1' }],
                total: 1,
                page: 1,
                pageSize: 20,
                facets: [],
              };
            },
          },
          priority: 10,
          optional: false,
        },
        {
          id: 'backend-2',
          adapter: {
            ...createMockBackend('backend-2'),
            async query() {
              queryHistory.push('backend-2');
              throw new Error('Should not be called');
            },
          },
          priority: 20,
          optional: false,
        },
      ];

      const adapter = multiBackendAdapter({
        backends: backends as any,
        parallel: false,
        aggregationStrategy: 'cascade',
      });

      const result = await adapter.query('products', { search: 'test' });

      // Only backend-1 should have been queried
      expect(queryHistory).toEqual(['backend-1']);
      expect(result.items.length).toBe(1);
    });

    it('falls back to next backend on timeout', async () => {
      const queryHistory: string[] = [];

      const backends = [
        {
          id: 'slow-backend',
          adapter: {
            ...createMockBackend('slow-backend'),
            async query() {
              queryHistory.push('slow-backend');
              await new Promise(() => {}); // Timeout
            },
          },
          priority: 10,
          timeoutMs: 100,
          optional: true,
        },
        {
          id: 'fast-backend',
          adapter: {
            ...createMockBackend('fast-backend'),
            async query() {
              queryHistory.push('fast-backend');
              return {
                items: [{ id: '2', title: 'Result 2' }],
                total: 1,
                page: 1,
                pageSize: 20,
                facets: [],
              };
            },
          },
          priority: 20,
          optional: false,
        },
      ];

      const adapter = multiBackendAdapter({
        backends: backends as any,
        parallel: false,
        aggregationStrategy: 'cascade',
      });

      const result = await adapter.query('products', { search: 'test' });

      // Both should be queried, first timed out
      expect(queryHistory.includes('slow-backend')).toBe(true);
      expect(queryHistory.includes('fast-backend')).toBe(true);
      expect(result.items.length).toBe(1);
    });
  });

  describe('Error Handling & Degradation', () => {
    it('fails if required backend fails', async () => {
      const adapter = multiBackendAdapter({
        backends: [
          {
            id: 'required',
            adapter: createMockBackend('required', { error: new Error('Service down') }),
            optional: false,
          },
        ],
      });

      expect(async () => {
        await adapter.query('products', { search: 'test' });
      }).rejects.toThrow();
    });

    it('continues if optional backend fails', async () => {
      const adapter = multiBackendAdapter({
        backends: [
          {
            id: 'required',
            adapter: createMockBackend('required'),
            optional: false,
          },
          {
            id: 'optional',
            adapter: createMockBackend('optional', { error: new Error('Service down') }),
            optional: true,
          },
        ],
      });

      const result = await adapter.query('products', { search: 'test' });

      // Should return results from required backend only
      expect(result.items.length).toBeGreaterThan(0);
    });

    it('respects maxResults limit per backend', async () => {
      const adapter = multiBackendAdapter({
        backends: [
          {
            id: 'backend',
            adapter: createMockBackend('backend', {
              results: {
                items: Array.from({ length: 100 }, (_, i) => ({
                  id: String(i),
                  title: `Product ${i}`,
                })),
                total: 100,
                page: 1,
                pageSize: 100,
                facets: [],
              },
            }),
            priority: 10,
            maxResults: 10, // Limit to 10
            optional: false,
          },
        ],
      });

      const result = await adapter.query('products', { search: 'test' });

      // Only 10 items should be returned
      expect(result.items.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Security', () => {
    it('does not expose backend credentials to results', async () => {
      const adapter = multiBackendAdapter({
        backends: [
          {
            id: 'sensitive-backend',
            adapter: createMockBackend('sensitive-backend'),
            priority: 10,
            optional: false,
          },
        ],
      });

      const result = await adapter.query('products', { search: 'test' });

      // Results should not contain raw config
      const resultString = JSON.stringify(result);
      expect(resultString).not.toContain('process.env');
      expect(resultString).not.toContain('token');
      expect(resultString).not.toContain('password');
      expect(resultString).not.toContain('apiKey');

      // Backend source is tracked for debugging
      expect(result.items[0]._source).toBe('sensitive-backend');
    });

    it('handles setup without exposing backend details', async () => {
      const adapter = multiBackendAdapter({
        backends: [
          {
            id: 'backend',
            adapter: createMockBackend('backend'),
            optional: false,
          },
        ],
      });

      // Setup should not throw internal errors
      await expect(
        adapter.setup({
          products: {
            fields: [{ name: 'id', type: 'keyword' }],
          },
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('Pagination', () => {
    it('respects page and pageSize parameters', async () => {
      const adapter = multiBackendAdapter({
        backends: [
          {
            id: 'backend',
            adapter: createMockBackend('backend', {
              results: {
                items: [{ id: '1', title: 'Product 1' }],
                total: 100,
                page: 2, // Server returns page 2
                pageSize: 15,
                facets: [],
              },
            }),
            optional: false,
          },
        ],
      });

      const result = await adapter.query('products', {
        search: 'test',
        page: 2,
        pageSize: 15,
      });

      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(15);
    });
  });

  describe('Indexing & Deletion', () => {
    it('indexes to all backends', async () => {
      let indexedBackends: string[] = [];

      const backends = [
        {
          id: 'backend-1',
          adapter: {
            ...createMockBackend('backend-1'),
            async index() {
              indexedBackends.push('backend-1');
            },
          },
          optional: false,
        },
        {
          id: 'backend-2',
          adapter: {
            ...createMockBackend('backend-2'),
            async index() {
              indexedBackends.push('backend-2');
            },
          },
          optional: false,
        },
      ];

      const adapter = multiBackendAdapter({
        backends: backends as any,
      });

      await adapter.index('products', [{ id: '1', title: 'Test' }]);

      expect(indexedBackends).toContain('backend-1');
      expect(indexedBackends).toContain('backend-2');
    });

    it('deletes from all backends', async () => {
      let deletedBackends: string[] = [];

      const backends = [
        {
          id: 'backend-1',
          adapter: {
            ...createMockBackend('backend-1'),
            async delete() {
              deletedBackends.push('backend-1');
            },
          },
          optional: false,
        },
        {
          id: 'backend-2',
          adapter: {
            ...createMockBackend('backend-2'),
            async delete() {
              deletedBackends.push('backend-2');
            },
          },
          optional: false,
        },
      ];

      const adapter = multiBackendAdapter({
        backends: backends as any,
      });

      await adapter.delete('products', '1');

      expect(deletedBackends).toContain('backend-1');
      expect(deletedBackends).toContain('backend-2');
    });
  });
});

describe('Production Configuration Examples', () => {
  it('validates required configuration', () => {
    expect(() => {
      multiBackendAdapter({ backends: [] });
    }).toThrow('at least one backend');
  });

  it('supports optional backends with graceful degradation', async () => {
    const adapter = multiBackendAdapter({
      backends: [
        // Primary - must succeed
        {
          id: 'magento',
          adapter: createMockBackend('magento'),
          priority: 10,
          weight: 100,
          optional: false,
        },
        // Secondary - nice to have
        {
          id: 'elasticsearch',
          adapter: createMockBackend('elasticsearch', { error: new Error('Down') }),
          priority: 20,
          weight: 80,
          optional: true, // ← Failure is OK
        },
      ],
      parallel: true,
      aggregationStrategy: 'merge',
    });

    // Should still return results from primary backend
    const result = await adapter.query('products', { search: 'test' });
    expect(result.items.length).toBeGreaterThan(0);
  });
});
