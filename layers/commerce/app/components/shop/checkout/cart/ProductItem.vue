
<script setup lang="ts">

import { ref, computed, watch } from '#imports';
import { useCommerceMutation } from '../../../composables/globals/useCommerceMutation';
import adjustOrderLineMutation from '#graphql/app/commerce/mutations/adjustOrderLine.gql';
import removeOrderLineMutation from '#graphql/app/commerce/mutations/removeOrderLine.gql';

const props = defineProps({
  cartItem: { type: Object, required: true },
  maxQty: { type: Number, default: 100 },
});

const { mutate: adjustOrderLine } = useCommerceMutation(adjustOrderLineMutation);
const { mutate: removeOrderLine } = useCommerceMutation(removeOrderLineMutation);

const quantity = ref(props.cartItem.quantity);
const isRemovable = computed(() => true);
const itemTotalPrice = computed(() => props.cartItem.linePriceWithTax);

const updateQuantity = async (qty: number) => {
  if (qty !== props.cartItem.quantity) {
    await adjustOrderLine({ orderLineId: props.cartItem.id, quantity: qty });
  }
};

const removeCartItem = async () => {
  await removeOrderLine({ orderLineId: props.cartItem.id });
};

watch(quantity, (val) => {
  updateQuantity(val);
});
</script>

<template>
  <div v-if="cartItem.productVariant" class="mr-4 h-24 w-24 shrink-0 overflow-hidden rounded-md border border-secondary-200">
    <img :src="cartItem.productVariant.featuredAsset?.preview" :alt="cartItem.productVariant.name" class="h-full w-full object-cover object-center" />
  </div>
  <div class="flex flex-1 flex-col text-left">
    <div>
      <div class="flex flex-col lg:flex-row justify-between text-base font-medium text-secondary-900">
        <h3 class="text-base cursor-pointer pr-2">
          {{ cartItem.productVariant.name }}
        </h3>
        <span v-if="itemTotalPrice">{{ itemTotalPrice }}</span>
      </div>
    </div>
    <div v-if="cartItem.productVariant.stockOnHand" class="flex flex-1 items-end justify-between text-sm">
      <v-text-field v-model="quantity" type="number" :min="1" :max="maxQty" name="quantity" aria-label="Cart item quantity" class="w-18 mt-1 inline-block py-2 px-3 border border-secondary-300 bg-white rounded-md shadow-sm" />
      <div class="flex">
        <v-btn v-if="isRemovable" type="v-btn" class="font-medium text-dark bg-transparent" @click="removeCartItem">
          Remove
        </v-btn>
      </div>
    </div>
  </div>
</template>
