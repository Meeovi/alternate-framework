<template>
    <nav class="flex justify-between items-end border-t border-neutral-200" role="navigation" aria-label="pagination">
        <SfButton size="lg" aria-label="Go to previous page" :disabled="selectedPage <= 1" variant="tertiary"
            class="gap-3 !px-3 sm:px-6" @click="prev">
            <template #prefix>
                <SfIconChevronLeft />
            </template>
            <span class="hidden sm:inline-flex"> Previous </span>
        </SfButton>
        <ul class="flex justify-center">
            <li v-if="!pages.includes(1)">
                <div :class="[
            'flex pt-1 border-t-4 border-transparent',
            { 'font-medium border-t-4 !border-primary-500': selectedPage === 1 },
          ]">
                    <button type="button"
                        class="min-w-[38px] px-3 sm:px-4 py-3 md:w-12 rounded-md text-neutral-500 hover:bg-primary-100 hover:text-primary-800 active:bg-primary-200 active:text-primary-900"
                        :aria-current="selectedPage === 1" @click="setPage(1)">
                        1
                    </button>
                </div>
            </li>
            <li v-if="startPage > 2">
                <div class="flex pt-1 border-t-4 border-transparent">
                    <button type="button" disabled aria-hidden="true"
                        class="px-4 py-3 md:w-12 rounded-md text-neutral-500">
                        ...
                    </button>
                </div>
            </li>
            <li v-if="maxVisiblePages === 1 && selectedPage === totalPages">
                <div class="flex pt-1 border-t-4 border-transparent">
                    <button type="button"
                        class="min-w-[38px] px-3 sm:px-4 py-3 md:w-12 rounded-md text-neutral-500 hover:bg-primary-100 hover:text-primary-800 active:bg-primary-200 active:text-primary-900"
                        :aria-current="endPage - 1 === selectedPage" @click="setPage(endPage - 1)">
                        {{ endPage - 1 }}
                    </button>
                </div>
            </li>
            <li v-for="page in pages" :key="`page-${page}`">
                <div :class="[
            'flex pt-1 border-t-4 border-transparent',
            { 'font-medium border-t-4 !border-primary-700': selectedPage === page },
          ]">
                    <button type="button" :class="[
              'min-w-[38px] px-3 sm:px-4 py-3 md:w-12 text-neutral-500 rounded-md hover:bg-primary-100 hover:text-primary-800 active:bg-primary-200 active:text-primary-900',
              { '!text-neutral-900 hover:!text-primary-800 active:!text-primary-900': selectedPage === page },
            ]" :aria-label="`Page ${page} of ${totalPages}`" :aria-current="selectedPage === page"
                        @click="setPage(page)">
                        {{ page }}
                    </button>
                </div>
            </li>
            <li v-if="maxVisiblePages === 1 && selectedPage === 1">
                <div class="flex pt-1 border-t-4 border-transparent">
                    <button type="button"
                        class="min-w-[38px] px-3 sm:px-4 py-3 md:w-12 rounded-md text-neutral-500 hover:bg-primary-100 hover:text-primary-800 active:bg-primary-200 active:text-primary-900"
                        :aria-label="`Page 2 of ${totalPages}`" @click="setPage(2)">
                        2
                    </button>
                </div>
            </li>
            <li v-if="endPage < totalPages - 1">
                <div class="flex pt-1 border-t-4 border-transparent">
                    <button type="button" disabled aria-hidden="true"
                        class="px-4 py-3 md:w-12 rounded-md text-neutral-500">
                        ...
                    </button>
                </div>
            </li>
            <li v-if="!pages.includes(totalPages)">
                <div :class="[
            'flex pt-1 border-t-4 border-transparent',
            { 'font-medium border-t-4 !border-primary-500': selectedPage === totalPages },
          ]">
                    <button type="button"
                        class="min-w-[38px] px-3 sm:px-4 py-3 md:w-12 rounded-md text-neutral-500 hover:bg-primary-100 hover:text-primary-800 active:bg-primary-200 active:text-primary-900"
                        :aria-current="totalPages === selectedPage" @click="setPage(totalPages)">
                        {{ totalPages }}
                    </button>
                </div>
            </li>
        </ul>
        <SfButton size="lg" aria-label="Go to next page" :disabled="selectedPage >= totalPages" variant="tertiary"
            class="gap-3 !px-3 sm:px-6" @click="next">
            <span class="hidden sm:inline-flex"> Next </span>
            <template #suffix>
                <SfIconChevronRight />
            </template>
        </SfButton>
    </nav>
</template>

<script lang="ts" setup>
import { SfButton, SfIconChevronLeft, SfIconChevronRight } from '@storefront-ui/vue';
import useStorefront from '../../composables/useStorefront'
import { computed } from 'vue'

const storefront = useStorefront()

const totalPages = computed(() => (storefront.totalPages?.value ?? storefront.totalPages) || 1)
const selectedPage = computed(() => storefront.page?.value ?? storefront.page)

function setPage(p: number) {
    if (typeof storefront.setPage === 'function') {
        storefront.setPage(p)
    } else if (storefront.page) {
        storefront.page.value = p
        if (typeof storefront.search === 'function') storefront.search()
    }
}

function next() { setPage((selectedPage.value || 1) + 1) }
function prev() { setPage(Math.max(1, (selectedPage.value || 1) - 1)) }

const maxVisiblePages = 5

const pages = computed(() => {
    const total = Number(totalPages.value || 1)
    const current = Number(selectedPage.value || 1)
    const half = Math.floor(maxVisiblePages / 2)
    let start = Math.max(1, current - half)
    let end = Math.min(total, start + maxVisiblePages - 1)
    if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1)
    }
    const out: number[] = []
    for (let i = start; i <= end; i++) out.push(i)
    return out
})

const startPage = computed(() => pages.value[0] ?? 1)
const endPage = computed(() => (pages.value[pages.value.length - 1] ?? 1) + 1)
</script>