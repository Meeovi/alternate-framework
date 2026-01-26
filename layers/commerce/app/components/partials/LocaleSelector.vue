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
import { useI18n } from 'vue-i18n';
import { ref, computed } from 'vue';

const { locale, availableLocales, t } = useI18n();
const currentLocale = computed(() => locale.value);

const onChangeHandler = (event: Event) => {
    const lang = (event.target as HTMLSelectElement).value;
    locale.value = lang as typeof locale.value;
    window.location.reload();
};
</script>