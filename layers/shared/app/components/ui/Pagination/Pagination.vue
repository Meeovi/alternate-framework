<template>
  <nav
    class="flex justify-between items-end border-t border-neutral-200"
    role="navigation"
    aria-label="pagination"
    data-testid="pagination"
  >
    <SfButton
      size="lg"
      :aria-label="$t('prevAriaLabel')"
      :disabled="pagination.selectedPage <= 1"
      variant="tertiary"
      class="gap-3"
      @click="pagination.prev"
    >
      <template #prefix>
        <SfIconChevronLeft />
      </template>
      <span class="hidden sm:inline-flex">{{ $t('prev') }}</span>
    </SfButton>
    <ul class="flex justify-center">
      <li v-if="!pagination.pages.includes(1)">
        <div
          :class="[
            'flex pt-1 border-t-4 border-transparent',
            { 'font-medium border-t-4 !border-primary-500': pagination.selectedPage === 1 },
          ]"
        >
          <v-btn
            type="v-btn"
            class="px-4 py-3 md:w-12 rounded-md text-neutral-500 hover:bg-primary-100 hover:text-primary-800 active:bg-primary-200 active:text-primary-900"
            :aria-current="pagination.selectedPage === 1"
            @click="pagination.setPage(1)"
          >
            1
          </v-btn>
        </div>
      </li>
      <li v-if="pagination.startPage > 2">
        <div class="flex pt-1 border-t-4 border-transparent">
          <v-btn type="v-btn" disabled aria-hidden="true" class="px-4 py-3 md:w-12 rounded-md text-neutral-500">
            ...
          </v-btn>
        </div>
      </li>
      <li v-if="maxVisiblePages === 1 && pagination.selectedPage === pagination.totalPages">
        <div class="flex pt-1 border-t-4 border-transparent">
          <v-btn
            type="v-btn"
            class="px-4 py-3 md:w-12 rounded-md text-neutral-500 hover:bg-primary-100 hover:text-primary-800 active:bg-primary-200 active:text-primary-900"
            :aria-current="pagination.endPage - 1 === pagination.selectedPage"
            @click="pagination.setPage(pagination.endPage - 1)"
          >
            {{ pagination.endPage - 1 }}
          </v-btn>
        </div>
      </li>
      <li v-for="page in pagination.pages" :key="`page-${page}`">
        <div
          :class="[
            'flex pt-1 border-t-4 border-transparent',
            { 'font-medium border-t-4 !border-primary-700': pagination.selectedPage === page },
          ]"
        >
          <v-btn
            type="v-btn"
            :class="[
              'px-4 py-3 md:w-12 text-neutral-500 rounded-md hover:bg-primary-100 hover:text-primary-800 active:bg-primary-200 active:text-primary-900',
              {
                '!text-neutral-900 hover:!text-primary-800 active:!text-primary-900': pagination.selectedPage === page,
              },
            ]"
            :aria-label="$t('currentPage', { page, totalPages: pagination.totalPages })"
            :aria-current="pagination.selectedPage === page"
            @click="pagination.setPage(page)"
          >
            {{ page }}
          </v-btn>
        </div>
      </li>
      <li v-if="maxVisiblePages === 1 && pagination.selectedPage === 1">
        <div class="flex pt-1 border-t-4 border-transparent">
          <v-btn
            type="v-btn"
            class="px-4 py-3 md:w-12 rounded-md text-neutral-500 hover:bg-primary-100 hover:text-primary-800 active:bg-primary-200 active:text-primary-900"
            :aria-label="$t('secondPageAriaLabel')"
            @click="pagination.setPage(2)"
          >
            2
          </v-btn>
        </div>
      </li>
      <li v-if="pagination.endPage < pagination.totalPages - 1">
        <div class="flex pt-1 border-t-4 border-transparent">
          <v-btn type="v-btn" disabled aria-hidden="true" class="px-4 py-3 md:w-12 rounded-md text-neutral-500">
            ...
          </v-btn>
        </div>
      </li>
      <li v-if="!pagination.pages.includes(pagination.totalPages)">
        <div
          :class="[
            'flex pt-1 border-t-4 border-transparent',
            { 'font-medium border-t-4 !border-primary-500': pagination.selectedPage === pagination.totalPages },
          ]"
        >
          <v-btn
            type="v-btn"
            class="px-4 py-3 md:w-12 rounded-md text-neutral-500 hover:bg-primary-100 hover:text-primary-800 active:bg-primary-200 active:text-primary-900"
            :aria-current="pagination.totalPages === pagination.selectedPage"
            @click="pagination.setPage(pagination.totalPages)"
          >
            {{ pagination.totalPages }}
          </v-btn>
        </div>
      </li>
    </ul>
    <SfButton
      size="lg"
      :aria-label="$t('nextAriaLabel')"
      :disabled="pagination.selectedPage >= pagination.totalPages"
      variant="tertiary"
      class="gap-3"
      @click="pagination.next"
    >
      <span class="hidden sm:inline-flex">{{ $t('next') }}</span>
      <template #suffix>
        <SfIconChevronRight />
      </template>
    </SfButton>
  </nav>
</template>

<script setup lang="ts">
import { SfButton, SfIconChevronLeft, SfIconChevronRight, usePagination } from '@storefront-ui/vue';
import type { PaginationProps } from '~/components/ui/Pagination/types';

const props = defineProps<PaginationProps>();

const { currentPage, pageSize, totalItems, maxVisiblePages: maxVisiblePagesProperty } = toRefs(props);
const pagination = computed(() =>
  reactive(
    usePagination({
      totalItems: totalItems.value,
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      maxPages: maxVisiblePagesProperty.value,
    }),
  ),
);
</script>
