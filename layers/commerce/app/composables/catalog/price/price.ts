import { calculateTierDiscountOverSpecialPrice } from '../../../utils/Price/Price'

type PriceInput = {
	quantity?: number
	customerGroup?: string | number | null
	currency?: string | null
}

type MoneyLike = {
	value?: number | string | null
	amount?: number | string | null
	currency?: string | null
	currency_code?: string | null
}

type GroupPriceLike = {
	value?: number | string | null
	price?: number | string | null
	amount?: number | string | null
	final_price?: MoneyLike | number | string | null
	customer_group?: string | number | null
	customerGroup?: string | number | null
	group?: string | number | null
	group_id?: string | number | null
	groupId?: string | number | null
}

type TierPriceLike = {
	quantity?: number | string | null
	qty?: number | string | null
	discount?: { percent_off?: number | string | null; amount_off?: number | string | null } | null
	value?: number | string | null
	price?: number | string | null
	amount?: number | string | null
	final_price?: MoneyLike | number | string | null
}

type ProductLike = Record<string, any>

export type ResolvedPrice = {
	currency: string | null
	regular: number | null
	final: number | null
	special: number | null
	group: number | null
	tier: number | null
	source: 'regular' | 'special' | 'group' | 'tier'
	hasDiscount: boolean
	discountPercent: number
	tierDiscountOverSpecial: number | null
	formatted: {
		regular: string | null
		final: string | null
		special: string | null
		group: string | null
		tier: string | null
	}
}

function toNumber(value: unknown): number | null {
	if (typeof value === 'number') return Number.isFinite(value) ? value : null
	if (typeof value === 'string') {
		const normalized = Number(value)
		return Number.isFinite(normalized) ? normalized : null
	}
	return null
}

function normalizeMoney(value: unknown): number | null {
	if (typeof value === 'number' || typeof value === 'string') return toNumber(value)
	if (!value || typeof value !== 'object') return null

	const record = value as MoneyLike
	return toNumber(record.value ?? record.amount)
}

function normalizeCurrency(product: ProductLike, fallback?: string | null): string | null {
	const priceRange = product?.price_range || product?.priceRange || {}
	const maximumPrice = priceRange?.maximum_price || priceRange?.maximumPrice || {}
	const minimumPrice = priceRange?.minimum_price || priceRange?.minimumPrice || {}
	const finalPrice = maximumPrice?.final_price || maximumPrice?.finalPrice || minimumPrice?.final_price || minimumPrice?.finalPrice
	const regularPrice = maximumPrice?.regular_price || maximumPrice?.regularPrice || minimumPrice?.regular_price || minimumPrice?.regularPrice

	return (
		product?.currency
		|| product?.currency_code
		|| finalPrice?.currency
		|| finalPrice?.currency_code
		|| regularPrice?.currency
		|| regularPrice?.currency_code
		|| fallback
		|| null
	)
}

function pickRegularPrice(product: ProductLike): number | null {
	const priceRange = product?.price_range || product?.priceRange || {}
	const maximumPrice = priceRange?.maximum_price || priceRange?.maximumPrice || {}
	const minimumPrice = priceRange?.minimum_price || priceRange?.minimumPrice || {}

	return (
		normalizeMoney(product?.regular_price)
		?? normalizeMoney(product?.price?.regular)
		?? normalizeMoney(product?.price?.regular_price)
		?? normalizeMoney(product?.price?.value)
		?? normalizeMoney(product?.price)
		?? normalizeMoney(maximumPrice?.regular_price || maximumPrice?.regularPrice)
		?? normalizeMoney(minimumPrice?.regular_price || minimumPrice?.regularPrice)
		?? normalizeMoney(maximumPrice?.final_price || maximumPrice?.finalPrice)
		?? normalizeMoney(minimumPrice?.final_price || minimumPrice?.finalPrice)
		?? null
	)
}

function pickSpecialPrice(product: ProductLike, regular: number | null): number | null {
	const priceRange = product?.price_range || product?.priceRange || {}
	const maximumPrice = priceRange?.maximum_price || priceRange?.maximumPrice || {}
	const minimumPrice = priceRange?.minimum_price || priceRange?.minimumPrice || {}

	const candidate = (
		normalizeMoney(product?.special_price)
		?? normalizeMoney(product?.specialPrice)
		?? normalizeMoney(product?.sale_price)
		?? normalizeMoney(product?.salePrice)
		?? normalizeMoney(product?.price?.special)
		?? normalizeMoney(maximumPrice?.final_price || maximumPrice?.finalPrice)
		?? normalizeMoney(minimumPrice?.final_price || minimumPrice?.finalPrice)
		?? null
	)

	if (candidate == null) return null
	if (regular == null) return candidate
	return candidate < regular ? candidate : null
}

function normalizeGroupKey(value: unknown): string | null {
	if (value == null) return null
	const normalized = String(value).trim().toLowerCase()
	return normalized || null
}

function normalizeGroupPrice(entry: GroupPriceLike): number | null {
	return normalizeMoney(entry?.final_price) ?? normalizeMoney(entry?.price) ?? normalizeMoney(entry?.amount) ?? normalizeMoney(entry?.value)
}

function pickGroupPrice(product: ProductLike, customerGroup?: string | number | null): number | null {
	const targetGroup = normalizeGroupKey(customerGroup)
	const raw = product?.group_prices || product?.groupPrices || product?.group_price || product?.groupPrice

	if (!raw) return null
	if (typeof raw === 'number' || typeof raw === 'string') return normalizeMoney(raw)

	if (!Array.isArray(raw) && typeof raw === 'object' && targetGroup) {
		return normalizeMoney((raw as Record<string, unknown>)[targetGroup])
			?? normalizeMoney((raw as Record<string, unknown>)[String(customerGroup)])
			?? null
	}

	if (!Array.isArray(raw)) return null

	const entries = raw as GroupPriceLike[]
	if (targetGroup) {
		const exact = entries.find((entry) => normalizeGroupKey(
			entry?.customer_group ?? entry?.customerGroup ?? entry?.group ?? entry?.group_id ?? entry?.groupId,
		) === targetGroup)
		if (exact) return normalizeGroupPrice(exact)
	}

	return entries.reduce<number | null>((lowest, entry) => {
		const current = normalizeGroupPrice(entry)
		if (current == null) return lowest
		return lowest == null || current < lowest ? current : lowest
	}, null)
}

function normalizeTierPrice(entry: TierPriceLike): { quantity: number; value: number | null } {
	return {
		quantity: Number(entry?.quantity ?? entry?.qty ?? 1) || 1,
		value: normalizeMoney(entry?.final_price) ?? normalizeMoney(entry?.price) ?? normalizeMoney(entry?.amount) ?? normalizeMoney(entry?.value),
	}
}

function pickTierPrice(product: ProductLike, quantity = 1): number | null {
	const raw = product?.price_tiers || product?.priceTiers || product?.tier_prices || product?.tierPrices
	if (!Array.isArray(raw) || !raw.length) return null

	return (raw as TierPriceLike[])
		.map(normalizeTierPrice)
		.filter((entry) => entry.value != null && entry.quantity <= quantity)
		.reduce<number | null>((lowest, entry) => {
			if (entry.value == null) return lowest
			return lowest == null || entry.value < lowest ? entry.value : lowest
		}, null)
}

function formatAmount(value: number | null, currency?: string | null): string | null {
	if (value == null) return null
	try {
		return new Intl.NumberFormat('en-US', {
			style: currency ? 'currency' : 'decimal',
			currency: currency || undefined,
			maximumFractionDigits: 2,
			minimumFractionDigits: 2,
		}).format(value)
	} catch {
		return value.toFixed(2)
	}
}

export function usePrice() {
	function getRegularPrice(product: ProductLike) {
		return pickRegularPrice(product)
	}

	function getSpecialPrice(product: ProductLike) {
		const regular = pickRegularPrice(product)
		return pickSpecialPrice(product, regular)
	}

	function getGroupPrice(product: ProductLike, customerGroup?: string | number | null) {
		return pickGroupPrice(product, customerGroup)
	}

	function getTierPrice(product: ProductLike, quantity = 1) {
		return pickTierPrice(product, quantity)
	}

	function getProductPrice(product: ProductLike, input: PriceInput = {}): ResolvedPrice {
		const quantity = Number(input.quantity || 1) || 1
		const regular = pickRegularPrice(product)
		const special = pickSpecialPrice(product, regular)
		const group = pickGroupPrice(product, input.customerGroup)
		const tier = pickTierPrice(product, quantity)
		const currency = normalizeCurrency(product, input.currency)

		const candidates = [
			{ key: 'tier' as const, value: tier },
			{ key: 'group' as const, value: group },
			{ key: 'special' as const, value: special },
			{ key: 'regular' as const, value: regular },
		].filter((entry) => entry.value != null)

		const lowest = candidates.reduce<{ key: ResolvedPrice['source']; value: number } | null>((selected, entry) => {
			if (entry.value == null) return selected
			if (!selected || entry.value < selected.value) return { key: entry.key, value: entry.value }
			return selected
		}, null)

		const final = lowest?.value ?? regular ?? special ?? group ?? tier ?? null
		const source = lowest?.key ?? 'regular'
		const discountPercent = regular && final != null && final < regular
			? Math.round(((regular - final) / regular) * 100)
			: 0

		return {
			currency,
			regular,
			final,
			special,
			group,
			tier,
			source,
			hasDiscount: Boolean(regular != null && final != null && final < regular),
			discountPercent,
			tierDiscountOverSpecial: special != null && tier != null && tier < special
				? calculateTierDiscountOverSpecialPrice(special, tier)
				: null,
			formatted: {
				regular: formatAmount(regular, currency),
				final: formatAmount(final, currency),
				special: formatAmount(special, currency),
				group: formatAmount(group, currency),
				tier: formatAmount(tier, currency),
			},
		}
	}

	return {
		getRegularPrice,
		getSpecialPrice,
		getGroupPrice,
		getTierPrice,
		getProductPrice,
	}
}

export default usePrice
