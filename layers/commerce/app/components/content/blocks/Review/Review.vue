<template>
  <article class="w-full p-4 border rounded-md" data-testid="review">
    <p class="pb-2 font-medium">{{ review.title }}</p>
    <header class="flex flex-col pb-2 md:flex-row md:justify-between">
      <span class="flex items-center pr-2 text-xs text-neutral-500">
        <v-rating
          :model-value="review.rating ?? 0"
          :length="5"
          readonly
          density="compact"
          size="x-small"
          color="amber"
          class="mr-2"
        />
        {{ $d(new Date(review.createdAt)) }}
      </span>
      <p class="flex items-center text-xs truncate text-primary-700">
        <span class="mr-2 text-xs text-neutral-500">{{ review.reviewer }}</span>
        <v-icon size="x-small" class="mr-1">mdi-check-circle</v-icon> {{ $t('review.verifiedPurchase') }}
      </p>
    </header>
    <p class="pb-2 text-sm text-neutral-900">{{ truncatedContent }}</p>
    <v-btn
      v-if="isButtonVisible"
      type="button"
      variant="text"
      class="inline-block mb-2 text-sm font-normal border-b-2 border-black cursor-pointer w-fit hover:text-primary-700 hover:border-primary-800"
      @click="isCollapsed = !isCollapsed"
    >
      {{ $t(isCollapsed ? 'readMore' : 'readLess') }}
    </v-btn>
    <footer class="flex items-center justify-between">
      <div class="text-sm text-neutral-500">
        <v-btn type="button" variant="text" class="mr-6 hover:text-primary-800">
          <v-icon size="small" class="mr-2.5">mdi-thumb-up-outline</v-icon>
          <span class="text-inherit">6</span>
        </v-btn>
        <v-btn type="button" variant="text" class="hover:text-primary-800">
          <v-icon size="small" class="mr-2.5">mdi-thumb-down-outline</v-icon>
          <span class="text-inherit">2</span>
        </v-btn>
      </div>

      <v-btn class="px-3 py-1.5 text-neutral-500 font-medium text-sm hover:text-primary-800" type="button" variant="text">
        {{ $t('review.reportAbuse') }}
      </v-btn>
    </footer>
  </article>
</template>

<script setup lang="ts">
import type { ReviewProps } from '~/components/ui/Review/types';

const props = defineProps<ReviewProps>();

const { review } = toRefs(props);
const charLimit = 400;
const isCollapsed = ref(true);
const isButtonVisible = computed(() => review.value.text?.length || 0 > charLimit);
const truncatedContent = computed(() =>
  isButtonVisible.value && isCollapsed.value
    ? `${review.value.text?.slice(0, Math.max(0, charLimit))}...`
    : review.value.text,
);
</script>
