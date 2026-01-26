<template>
  <div class="product-compare-table">
    <div class="sticky-header">
      <div class="compare-header">
        <div class="product-column">
          <h3>Product Details</h3>
        </div>
        <div v-for="product in products" :key="product.uid" class="product-column">
          <div class="product-card">
            <div class="remove-product" @click="removeProduct(product.uid)">
              <SfIconClose size="sm" />
            </div>
            <img :src="product.image?.url" :alt="product.name" class="product-image" />
            <h4>{{ product.name }}</h4>
            <div class="product-price">
              <div class="current-price">
                {{ product.price_range?.minimum_price?.regular_price?.currency }}
                {{ product.price_range?.minimum_price?.regular_price?.value }}
              </div>
              <div v-if="product.price_history" class="price-history">
                <div class="price-change" :class="getPriceChangeClass(product.price_history)">
                  {{ getPriceChangeText(product.price_history) }}
                </div>
              </div>
            </div>
            <div class="product-actions">
              <addToCartBtn :productId="product.uid" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="compare-body">
      <!-- Basic Information -->
      <div class="compare-row">
        <div class="attribute-column">
          <h4>Basic Information</h4>
        </div>
        <div v-for="product in products" :key="product.uid" class="product-column">
          <div class="attribute-value">
            <p>SKU: {{ product.sku }}</p>
            <p>Category: {{ product.categories?.name }}</p>
            <div class="rating-container">
              <Ratings :value="product.rating_summary" :length="5" size="sm" :half-increment="true" />
              <span class="review-count">({{ product.review_count }} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Price History -->
      <div class="compare-row" v-if="hasPriceHistory">
        <div class="attribute-column">
          <h4>Price History</h4>
        </div>
        <div v-for="product in products" :key="product.uid" class="product-column">
          <div class="attribute-value">
            <div v-if="product.price_history" class="price-history-chart">
              <div class="price-points">
                <div v-for="(price, date) in product.price_history" :key="date" class="price-point">
                  <div class="price-value">{{ price }}</div>
                  <div class="price-date">{{ formatDate(date) }}</div>
                </div>
              </div>
            </div>
            <div v-else>No price history available</div>
          </div>
        </div>
      </div>

      <!-- Reviews Summary -->
      <div class="compare-row" v-if="hasReviews">
        <div class="attribute-column">
          <h4>Reviews Summary</h4>
        </div>
        <div v-for="product in products" :key="product.uid" class="product-column">
          <div class="attribute-value">
            <div v-if="product.reviews_summary" class="reviews-summary">
              <div v-for="(count, rating) in product.reviews_summary" :key="rating" class="rating-bar">
                <div class="rating-label">{{ rating }} stars</div>
                <div class="rating-bar-container">
                  <div class="rating-bar-fill" :style="{ width: `${(count / product.review_count) * 100}%` }"></div>
                </div>
                <div class="rating-count">{{ count }}</div>
              </div>
            </div>
            <div v-else>No reviews available</div>
          </div>
        </div>
      </div>

      <!-- Specifications -->
      <div class="compare-row" v-if="hasSpecifications">
        <div class="attribute-column">
          <h4>Specifications</h4>
        </div>
        <div v-for="product in products" :key="product.uid" class="product-column">
          <div class="attribute-value">
            <div v-for="(value, key) in product.custom_attributes" :key="key">
              <p><strong>{{ key }}:</strong> {{ value }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Features -->
      <div class="compare-row" v-if="hasFeatures">
        <div class="attribute-column">
          <h4>Features</h4>
        </div>
        <div v-for="product in products" :key="product.uid" class="product-column">
          <div class="attribute-value">
            <ul>
              <li v-for="feature in product.features" :key="feature">{{ feature }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { SfIconClose } from '@storefront-ui/vue';
import addToCartBtn from '~/components/partials/commerce/addToCartBtn.vue';
import Ratings from '~/components/partials/commerce/ratings.vue';

const props = defineProps({
  products: {
    type: Array,
    required: true,
    default: () => []
  }
});

const emit = defineEmits(['remove-product']);

// Computed properties to check if products have certain attributes
const hasSpecifications = computed(() => {
  return props.products.some(product => product.custom_attributes && Object.keys(product.custom_attributes).length > 0);
});

const hasFeatures = computed(() => {
  return props.products.some(product => product.features && product.features.length > 0);
});

const hasPriceHistory = computed(() => {
  return props.products.some(product => product.price_history && Object.keys(product.price_history).length > 0);
});

const hasReviews = computed(() => {
  return props.products.some(product => product.reviews_summary && Object.keys(product.reviews_summary).length > 0);
});

const removeProduct = (productId) => {
  emit('remove-product', productId);
};

const getPriceChangeClass = (priceHistory) => {
  const prices = Object.values(priceHistory);
  const currentPrice = prices[0];
  const previousPrice = prices[1];
  if (!previousPrice) return '';
  return currentPrice > previousPrice ? 'price-increase' : 'price-decrease';
};

const getPriceChangeText = (priceHistory) => {
  const prices = Object.values(priceHistory);
  const currentPrice = prices[0];
  const previousPrice = prices[1];
  if (!previousPrice) return '';
  const change = ((currentPrice - previousPrice) / previousPrice) * 100;
  return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
</script>

<style scoped>
.product-compare-table {
  width: 100%;
  overflow-x: auto;
  margin: 2rem 0;
  -webkit-overflow-scrolling: touch;
}

.sticky-header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.compare-header {
  display: flex;
  min-width: 800px;
}

.compare-body {
  min-width: 800px;
}

.product-column {
  flex: 1;
  min-width: 250px;
  padding: 1rem;
  border-right: 1px solid #e5e7eb;
  position: relative;
}

.attribute-column {
  flex: 0 0 200px;
  padding: 1rem;
  background: #f9fafb;
  border-right: 1px solid #e5e7eb;
}

.compare-row {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.product-card {
  text-align: center;
  position: relative;
}

.remove-product {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s;
}

.remove-product:hover {
  color: #ef4444;
}

.product-image {
  width: 150px;
  height: 150px;
  object-fit: contain;
  margin-bottom: 1rem;
}

.attribute-value {
  padding: 0.5rem;
}

.attribute-value ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.attribute-value li {
  margin-bottom: 0.5rem;
}

.product-actions {
  margin-top: 1rem;
}

h3, h4 {
  margin: 0 0 1rem 0;
  color: #1f2937;
}

p {
  margin: 0.5rem 0;
  color: #4b5563;
}

.price-history {
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.price-increase {
  color: #ef4444;
}

.price-decrease {
  color: #10b981;
}

.rating-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.review-count {
  font-size: 0.875rem;
  color: #6b7280;
}

.price-history-chart {
  margin-top: 0.5rem;
}

.price-points {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.price-point {
  text-align: center;
  font-size: 0.75rem;
}

.price-value {
  font-weight: 500;
}

.price-date {
  color: #6b7280;
}

.reviews-summary {
  margin-top: 0.5rem;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.rating-label {
  width: 70px;
  font-size: 0.875rem;
}

.rating-bar-container {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.rating-bar-fill {
  height: 100%;
  background: #f59e0b;
  border-radius: 4px;
}

.rating-count {
  width: 30px;
  text-align: right;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .product-column {
    min-width: 200px;
  }

  .attribute-column {
    flex: 0 0 150px;
  }

  .product-image {
    width: 120px;
    height: 120px;
  }

  .price-points {
    flex-direction: column;
    gap: 0.25rem;
  }

  .rating-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .rating-label {
    width: auto;
  }

  .rating-bar-container {
    width: 100%;
  }
}
  .rating-bar-fill {
    height: 100%;
    background: #f59e0b;
    border-radius: 4px;
  }
  
  .rating-count {
    width: 30px;
    text-align: right;
    font-size: 0.875rem;
  }
  
  @media (max-width: 768px) {
    .product-column {
      min-width: 200px;
    }
  
    .attribute-column {
      flex: 0 0 150px;
    }
  
    .product-image {
      width: 120px;
      height: 120px;
    }
  
    .price-points {
      flex-direction: column;
      gap: 0.25rem;
    }
  
    .rating-bar {
      flex-direction: column;
      align-items: flex-start;
    }
  
    .rating-label {
      width: auto;
    }
  
    .rating-bar-container {
      width: 100%;
    }
  }
  </style>