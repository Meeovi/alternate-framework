<template>
    <select aria-label="Select language"
        class="mt-1 block w-full p-2.5 border border-secondary-300 text-secondary-900 text-sm rounded-md shadow-sm focus:ring-brand-light focus:border-light"
        @change="onChangeHandler">
        <option v-for="locale in availableLocales" :key="locale" :value="locale"
            :selected="currentLocale === locale" :label="locale">
            {{ locale }}
        </option>
    </select>
</template>

<script setup lang="ts">
import { useCommerceAdapter, useContentAdapter } from '#imports'
void useCommerceAdapter()
void useContentAdapter()
import { useLocate } from 'alternate-locate/adapters/vue/composable';
import { ref, computed } from '#imports';

const { locale, availableLocales, t } = useLocate();
const currentLocale = computed(() => locale.value);

const onChangeHandler = (event: Event) => {
    const lang = (event.target as HTMLSelectElement).value;
    locale.value = lang as typeof locale.value;
    window.location.reload();
};
</script>