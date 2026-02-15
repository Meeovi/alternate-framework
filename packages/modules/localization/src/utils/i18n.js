import { useI18n as useOriginalI18n } from 'vue-i18n';
import { ref } from 'vue';
const isHydrated = ref(true);
export function useI18n() {
    const { t, d, n, ...rest } = useOriginalI18n();
    return {
        ...rest,
        t: wrapI18n(t),
        d: wrapI18n(d),
        n: wrapI18n(n),
    };
}
export function wrapI18n(t) {
    return ((...args) => {
        return isHydrated.value ? t(...args) : '';
    });
}
