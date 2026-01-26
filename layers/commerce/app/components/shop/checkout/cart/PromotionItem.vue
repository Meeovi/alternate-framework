<script setup lang="ts">
import { ref, computed } from 'vue';
import { useVendureMutation } from '../../../composables/useVendureMutation';
import adjustOrderLineMutation from '#graphql/app/commerce/mutations/adjustOrderLine.gql';
import removeOrderLineMutation from '#graphql/app/commerce/mutations/removeOrderLine.gql';

const props = defineProps({
  cartItem: { type: Object, required: true },
  maxQty: { type: Number, default: 100 },
});

const { mutate: adjustOrderLine } = useVendureMutation(adjustOrderLineMutation);
const { mutate: removeOrderLine } = useVendureMutation(removeOrderLineMutation);

const quantity = ref(props.cartItem.quantity);
const isRemovable = computed(() => true); // Vendure: all lines can be removed
const itemTotalPrice = computed(() => props.cartItem.linePriceWithTax);

const updateQuantity = async (qty: number) => {
  if (qty !== props.cartItem.quantity) {
    await adjustOrderLine({ orderLineId: props.cartItem.id, quantity: qty });
  }
};

const removeItem = async () => {
  await removeOrderLine({ orderLineId: props.cartItem.id });
};
</script>
<template>
  <div class="mr-4 w-24 shrink-0 overflow-hidden">
    <div class="w-26 i-carbon-tag text-3xl"></div>
  </div>
  <div class="flex flex-1 flex-col">
    <div>
      <div class="flex flex-col lg:flex-row justify-between text-base font-medium text-secondary-900">
        <h3 class="text-base" data-testid="cart-promotion-name">
          {{ cartItem.productVariant.name }}
          <span class="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
            Promotion
          </span>
        </h3>
        <span v-if="itemTotalPrice">{{ itemTotalPrice }}</span>
      </div>
    </div>
    <div class="flex flex-1 items-end justify-end text-sm">
      <div class="flex">
        <button v-if="isRemovable" type="button" class="font-medium text-dark bg-transparent" @click="removeItem">
          Remove
        </button>
      </div>
    </div>
  </div>
</template>
