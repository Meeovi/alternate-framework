import { ref } from 'vue'
import { useBusinessDriver } from '~/composables/useBusinessDriver'
import type { SellerShopProfile } from 'alternate-sdk/contracts'

/**
 * Shop profile — Webkul Multi Vendor Marketplace's seller-panel "My
 * Profile"/shop settings page (name, URL slug, banner, logo, policies,
 * social links). Single-record get/update, not a list — this page uses a
 * form instead of SellerDataGrid.
 */
export function useSellerShop() {
  const business = useBusinessDriver()
  const { data: profile, pending, error, refresh } = useAsyncData<SellerShopProfile | null>(
    'seller-shop-profile',
    () => business.shop.get(),
    { default: () => null }
  )

  const saving = ref(false)
  const saveError = ref<unknown>(null)
  const saved = ref(false)

  async function save(updates: Partial<SellerShopProfile>) {
    saving.value = true
    saveError.value = null
    saved.value = false
    try {
      profile.value = await business.shop.update(updates)
      saved.value = true
    } catch (e) {
      saveError.value = e
    } finally {
      saving.value = false
    }
  }

  return { profile, pending, error, refresh, saving, saveError, saved, save }
}
