type PackageDimensions = {
	length?: number
	width?: number
	height?: number
	weight?: number
}

type ShippingRate = {
	carrier?: string
	service?: string
	amount: number
	currency?: string
	estimatedDays?: number
}

export function useShippingCalculations() {
	function calculateVolumetricWeight(dimensions: PackageDimensions, divisor = 5000) {
		const length = Number(dimensions.length || 0)
		const width = Number(dimensions.width || 0)
		const height = Number(dimensions.height || 0)
		if (!length || !width || !height) return 0
		return (length * width * height) / divisor
	}

	function calculateBillableWeight(dimensions: PackageDimensions, divisor = 5000) {
		const actual = Number(dimensions.weight || 0)
		const volumetric = calculateVolumetricWeight(dimensions, divisor)
		return Math.max(actual, volumetric)
	}

	function estimateShipping(rates: ShippingRate[] = []) {
		if (!Array.isArray(rates) || rates.length === 0) return null
		return rates.reduce((best, current) => {
			if (!best) return current
			return Number(current.amount) < Number(best.amount) ? current : best
		}, null as ShippingRate | null)
	}

	return {
		calculateVolumetricWeight,
		calculateBillableWeight,
		estimateShipping,
	}
}

export default useShippingCalculations
