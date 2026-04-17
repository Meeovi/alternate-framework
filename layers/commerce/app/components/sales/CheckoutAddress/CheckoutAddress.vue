<template>
  <div data-testid="checkout-address" class="md:px-4 py-6">
    <div class="flex justify-between items-center">
      <h2 class="text-neutral-900 text-lg font-bold mb-4">{{ heading }}</h2>
      <v-btn v-if="savedAddress" size="small" variant="text" @click="open">
        {{ $t('contactInfo.edit') }}
      </v-btn>
    </div>

    <div v-if="savedAddress" class="mt-2 md:w-[520px]">
      <p>{{ `${savedAddress.firstName} ${savedAddress.lastName}` }}</p>
      <p>{{ savedAddress.phoneNumber }}</p>
      <p>{{ `${savedAddress.address1} ${savedAddress.address2}` }}</p>
      <p>{{ `${savedAddress.state}, ${savedAddress.postalCode}` }}</p>
    </div>

    <div v-else class="w-full md:max-w-[520px]">
      <p>{{ description }}</p>
      <v-btn class="mt-4 w-full md:w-auto" color="secondary" variant="flat" @click="open">
        {{ buttonText }}
      </v-btn>
    </div>

    <v-dialog v-model="isOpen" max-width="600" scrollable>
      <v-card>
        <v-card-title class="relative">
          <v-btn icon variant="text" class="absolute right-2 top-2" @click="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <h3 id="address-modal-title" class="text-neutral-900 text-lg md:text-2xl font-bold mb-4">
            {{ heading }}
          </h3>
        </v-card-title>
        <v-card-text>
          <AddressForm :saved-address="savedAddress" :type="type" @on-save="close" @on-close="close" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CheckoutAddressProps } from './types';

defineProps<CheckoutAddressProps>();

const isOpen = ref(false);
const open = () => {
  isOpen.value = true;
};
const close = () => {
  isOpen.value = false;
};
</script>
