import { ref } from 'vue';
export function useI18n() {
    try {
        const maybeUseNuxt = globalThis.useNuxtApp;
        if (typeof maybeUseNuxt === 'function') {
            const nuxt = maybeUseNuxt();
            if (nuxt?.$i18n)
                return nuxt.$i18n;
        }
        const maybeUseI18n = globalThis.useI18n;
        if (typeof maybeUseI18n === 'function' && maybeUseI18n._binding)
            return maybeUseI18n();
    }
    catch (e) {
        // fallthrough to fallback
    }
    const locale = ref('en');
    function t(key, ..._args) {
        return key;
    }
    return { t, locale, locales: [] };
}
