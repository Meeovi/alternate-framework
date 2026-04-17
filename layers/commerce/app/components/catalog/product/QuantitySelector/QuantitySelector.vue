<template>
  <div class="inline-flex flex-col items-center" data-testid="quantity-selector">
    <div class="flex border border-neutral-300 rounded-md h-full w-full items-center">
      <v-btn
        variant="text"
        :disabled="count <= minValue"
        icon="mdi-minus"
        :aria-controls="inputId"
        :aria-label="$t('quantitySelectorDecrease')"
        data-testid="quantity-selector-decrease-v-btn"
        @click="dec()"
      />
      <v-text-field
        :id="inputId"
        v-model="count"
        type="number"
        role="spinbutton"
        :class="inputClasses"
        :min="minValue"
        :max="maxValue"
        data-testid="quantity-selector-input"
        :aria-label="$t('quantitySelector')"
        variant="plain"
        hide-details
        density="compact"
        @input="handleOnChange"
      />
      <v-btn
        variant="text"
        :disabled="count >= maxValue"
        icon="mdi-plus"
        :aria-controls="inputId"
        :aria-label="$t('quantitySelectorIncrease')"
        data-testid="quantity-selector-increase-v-btn"
        @click="inc()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue';
import { useCounter } from '@vueuse/core';
import type { QuantitySelectorProps } from '~/components/ui/QuantitySelector/types';

const { value, minValue, maxValue } = withDefaults(defineProps<QuantitySelectorProps>(), {
  value: 1,
  minValue: 1,
  maxValue: 10,
});

const inputId = useId();
const { count, inc, dec, set } = useCounter(value);

const clampValue = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

const inputClasses = computed(
  () =>
    'appearance-none flex-1 mx-2 w-8 text-center bg-transparent font-medium [&::-webkit-inner-spin-v-btn]:appearance-none [&::-webkit-inner-spin-v-btn]:display-none [&::-webkit-inner-spin-v-btn]:m-0 [&::-webkit-outer-spin-v-btn]:display-none [&::-webkit-outer-spin-v-btn]:m-0 [-moz-appearance:textfield] [&::-webkit-outer-spin-v-btn]:appearance-none disabled:placeholder-disabled-900 focus-visible:outline focus-visible:outline-offset focus-visible:rounded-sm',
);

const handleOnChange = (event: Event) => {
  const currentValue = (event.target as HTMLInputElement)?.value;
  const nextValue = Number.parseFloat(currentValue);
  set(clampValue(nextValue, minValue, maxValue));
};
</script>
