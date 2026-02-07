// composables/useLoading.ts
import { ref } from 'vue'

export const useLoading = () => {
    const loading = ref(false)
    const loadingText = ref('')
  
    const startLoading = (text = 'Loading...') => {
      loading.value = true
      loadingText.value = text
    }
  
    const stopLoading = () => {
      loading.value = false
      loadingText.value = ''
    }
  
    return {
      loading,
      loadingText,
      startLoading,
      stopLoading
    }
  }
  