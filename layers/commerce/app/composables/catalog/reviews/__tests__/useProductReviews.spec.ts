import { vi } from 'vitest';
import { useProductReviews } from '~/composables/catalog/useProductReviews';

describe('useProductReview', () => {
  it('should return product reviews', async () => {
    const slug = 'athletic-mens-walking-sneakers';
    const { data, fetchProductReviews } = useProductReviews(slug);

    await fetchProductReviews(slug);

    expect(data.value).toEqual([{ id: 'review-1' }]);
  });
});
