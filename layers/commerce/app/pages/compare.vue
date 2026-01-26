<template>
  <div class="compare-page">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Compare Products</h1>
      
      <div v-if="loading" class="text-center">
        <p>Loading products...</p>
      </div>
      
      <div v-else-if="error" class="text-center text-red-500">
        <p>Error loading products: {{ error.message }}</p>
      </div>
      
      <div v-else-if="!products.length" class="text-center">
        <p>No products selected for comparison. Add products to your compare list to see them here.</p>
        <NuxtLink to="/" class="mt-4 inline-block text-blue-500 hover:text-blue-700">
          Continue Shopping
        </NuxtLink>
      </div>
      
      <div v-else>
        <productCompareTable 
          :products="products" 
          @remove-product="handleRemoveProduct"
        />
        
        <div class="mt-8 flex justify-between">
          <button 
            @click="clearCompareList" 
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear Compare List
          </button>
          <NuxtLink 
            to="/" 
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Continue Shopping
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import productCompareTable from '~/components/catalog/product/productCompareTable.vue';

// GraphQL query to get compared products
const COMPARED_PRODUCTS_QUERY = gql`
  query GetComparedProducts {
    customer {
      compare_list {
        items {
          product {
            uid
            sku
            name
            image {
              url
            }
            price_range {
              minimum_price {
                regular_price {
                  currency
                  value
                }
              }
            }
            categories {
              name
            }
            rating_summary
            review_count
            reviews_summary
            price_history
            custom_attributes
            features
          }
        }
      }
    }
  }
`;

// GraphQL mutation to clear compare list
const CLEAR_COMPARE_LIST_MUTATION = gql`
  mutation ClearCompareList {
    clearCompareList {
      compare_list {
        items {
          product {
            uid
          }
        }
      }
    }
  }
`;

// GraphQL mutation to remove a single product from compare list
const REMOVE_PRODUCT_MUTATION = gql`
  mutation RemoveFromCompareList($productId: ID!) {
    removeProductsFromCompareList(input: { product_ids: [$productId] }) {
      compare_list {
        items {
          product {
            uid
          }
        }
      }
    }
  }
`;

const { result, loading, error, refetch } = useQuery(COMPARED_PRODUCTS_QUERY);
const { mutate: clearCompareListMutation } = useMutation(CLEAR_COMPARE_LIST_MUTATION);
const { mutate: removeProductMutation } = useMutation(REMOVE_PRODUCT_MUTATION);

const products = computed(() => {
  return result.value?.customer?.compare_list?.items?.map(item => item.product) || [];
});

const clearCompareList = async () => {
  try {
    await clearCompareListMutation();
    await refetch();
  } catch (error) {
    console.error('Failed to clear compare list:', error);
  }
};

const handleRemoveProduct = async (productId) => {
  try {
    await removeProductMutation({
      variables: {
        productId
      }
    });
    await refetch();
  } catch (error) {
    console.error('Failed to remove product from compare list:', error);
  }
};

onMounted(async () => {
  await refetch();
});
</script>

<style scoped>
.compare-page {
  min-height: 100vh;
  background-color: #f9fafb;
}

@media (max-width: 768px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style> 