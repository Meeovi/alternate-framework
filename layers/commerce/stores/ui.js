import { defineStore } from 'pinia';
export const useUiStore = defineStore('ui', () => {
    const mobileMenu = ref(false);
    const modal = ref(null);
    const loading = ref(false);
    const theme = ref('light');
    function toggleMobileMenu() {
        mobileMenu.value = !mobileMenu.value;
    }
    function openModal(name) {
        modal.value = name;
    }
    function closeModal() {
        modal.value = null;
    }
    function setLoading(val) {
        loading.value = val;
    }
    function setTheme(val) {
        theme.value = val;
    }
    return { mobileMenu, modal, loading, theme, toggleMobileMenu, openModal, closeModal, setLoading, setTheme };
});
