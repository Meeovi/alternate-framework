<template>
    <v-form class="pa-4" @submit.prevent="setShippingAddressHandler">
        <!-- Loading Overlay -->
        <v-overlay :model-value="loading" class="align-center justify-center">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>

        <!-- Error Alert -->
        <v-alert v-if="error" type="error" closable class="mb-4" @click:close="error = null">
            {{ error }}
        </v-alert>

        <h2 class="text-h4 font-weight-bold mb-4">Shipping Address</h2>
        <v-row>
            <v-col cols="12" md="6">
                <v-text-field v-model="shippingAddress.fullName" :error-messages="errors.fullName" label="Full Name"
                    name="fullName" autocomplete="name" required variant="outlined"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
                <v-text-field v-model="shippingAddress.phoneNumber" :error-messages="errors.phoneNumber" label="Phone"
                    name="phone" type="tel" autocomplete="tel" required variant="outlined"></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-select v-model="shippingAddress.countryCode" :error-messages="errors.countryCode" label="Country"
                    name="country" :items="countries" item-title="name" item-value="code"
                    autocomplete="country-name" required variant="outlined"
                    @update:model-value="updateRegions"></v-select>
            </v-col>
            <v-col cols="12" md="8">
                <v-text-field v-model="shippingAddress.streetLine1" :error-messages="errors.streetLine1" label="Street Line 1"
                    name="streetLine1" autocomplete="address-line1" required variant="outlined"
                    hint="Street address or P.O. Box"></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
                <v-text-field v-model="shippingAddress.streetLine2" label="Street Line 2" name="streetLine2"
                    variant="outlined" hint="Optional"></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
                <v-text-field v-model="shippingAddress.city" :error-messages="errors.city" label="City" name="city"
                    autocomplete="address-level2" required variant="outlined"></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
                <v-select v-model="shippingAddress.province" :error-messages="errors.province" label="State" name="state"
                    :items="regions" item-title="name" item-value="code" autocomplete="address-level1" required
                    variant="outlined"></v-select>
            </v-col>
            <v-col cols="12" md="4">
                <v-text-field v-model="shippingAddress.postalCode" :error-messages="errors.postalCode" label="ZIP Code"
                    name="zipCode" placeholder="eg. 12345" autocomplete="postal-code" required
                    variant="outlined"></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-checkbox v-model="useAsShippingAddress" label="Use as shipping address"
                    name="useAsShippingAddress"></v-checkbox>
            </v-col>
            <v-col cols="12" class="d-flex justify-end gap-4">
                <v-btn variant="outlined" type="reset" color="primary" @click="handleReset">
                    Clear all
                </v-btn>
                <v-btn color="primary" type="submit" :loading="loading" :disabled="loading">
                    Save
                </v-btn>
            </v-col>
        </v-row>
    </v-form>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onErrorCaptured } from 'vue';
import { useVendureMutation } from '../../composables/useVendureMutation';
import setOrderShippingAddressMutation from '#graphql/app/commerce/mutations/setOrderShippingAddress.gql';
import getCountryListQuery from '#graphql/app/commerce/queries/getCountryList.gql';
import { useVendureQuery } from '../../composables/useVendureQuery';
import { useNotification } from '~//composables/useNotifications';

const emit = defineEmits(['address-saved', 'address-error', 'form-reset']);
const { showNotification } = useNotification();
const loading = ref(false);
const error = ref<string | null>(null);
const useAsShippingAddress = ref(false);

const errors = reactive({
  fullName: '',
  streetLine1: '',
  streetLine2: '',
  city: '',
  province: '',
  postalCode: '',
  phoneNumber: '',
  countryCode: '',
});

const { data: countriesResult } = useVendureQuery(getCountryListQuery);
type Province = { code: string; name: string };
type Country = { code: string; name: string; provinces?: Province[] };

const countries = ref<Country[]>([]);
const regions = ref<Province[]>([]);

const shippingAddress = reactive({
  fullName: '',
  streetLine1: '',
  streetLine2: '',
  city: '',
  province: null,
  postalCode: '',
  phoneNumber: '',
  countryCode: null,
});

const { mutate: setShippingAddress } = useVendureMutation(setOrderShippingAddressMutation);

const updateRegions = (countryCode: string | null) => {
  const country = countries.value.find((c: any) => c.code === countryCode);
  regions.value = country?.provinces || [];
};

const handleReset = () => {
  Object.assign(shippingAddress, {
    fullName: '',
    streetLine1: '',
    streetLine2: '',
    city: '',
    province: '',
    postalCode: '',
    phoneNumber: '',
    countryCode: '',
  });
  useAsShippingAddress.value = false;
  emit('form-reset');
};

const setShippingAddressHandler = async () => {
  loading.value = true;
  error.value = null;
  try {
    const result = await setShippingAddress({
      input: {
        fullName: shippingAddress.fullName,
        streetLine1: shippingAddress.streetLine1,
        streetLine2: shippingAddress.streetLine2,
        city: shippingAddress.city,
        province: shippingAddress.province,
        postalCode: shippingAddress.postalCode,
        phoneNumber: shippingAddress.phoneNumber,
        countryCode: shippingAddress.countryCode,
      },
    });
    showNotification({ type: 'success', message: 'Shipping address updated' });
    emit('address-saved', result?.setOrderShippingAddress?.shippingAddress);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update shipping address';
    showNotification({ type: 'error', message: error.value });
    emit('address-error', err instanceof Error ? err : new Error(error.value));
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (countriesResult.value) {
    countries.value = countriesResult.value.countries;
  }
});
onErrorCaptured((err) => {
  error.value = err instanceof Error ? err.message : 'An unexpected error occurred';
  return false;
});
</script>

<style scoped>
.gap-4 {
  gap: 1rem;
}
</style>