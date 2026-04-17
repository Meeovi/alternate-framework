import { computed, ref } from 'vue'
import { useCart } from './useCart'

export function useMiniCart() {
	const { fetchCard } = useCart()
	const items = ref<any[]>([])
	const open = ref(false)
	const loading = ref(false)

	const itemCount = computed(() => {
		return items.value.reduce((count, item) => count + Number(item?.qty || item?.quantity || 1), 0)
	})

	async function refresh() {
		loading.value = true
		try {
			const cartRef = await fetchCard()
			const cart = (cartRef as any)?.value ?? cartRef
			items.value = Array.isArray(cart?.items) ? cart.items : []
			return cart
		} finally {
			loading.value = false
		}
	}

	function toggle() {
		open.value = !open.value
		return open.value
	}

	function openMiniCart() {
		open.value = true
	}

	function closeMiniCart() {
		open.value = false
	}

	return {
		items,
		itemCount,
		open,
		loading,
		refresh,
		toggle,
		openMiniCart,
		closeMiniCart,
	}
}

export default useMiniCart
