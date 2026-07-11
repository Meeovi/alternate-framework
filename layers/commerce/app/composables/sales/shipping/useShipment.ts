// layers/commerce/app/composables/sales/shipping/useShipment.ts
import { ref } from 'vue'
import { getCommerceClient } from '../../../utils/client'
import type { ShipmentProvider, Shipment, ShipmentTracking } from '../../../types/shipment'

/**
 * Shipment composable. Replaces the spread-out `sales/shipping/*` modules
 * (calculations, tracking, bookingIntegrations, useShipping) for read/track
 * operations, typed against `ShipmentProvider`.
 */
export function useShipment() {
  const client = getCommerceClient() as unknown as ShipmentProvider
  const shipments = ref<Shipment[]>([])
  const current = ref<Shipment | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  async function fetchShipments(params?: Record<string, any>) {
    isLoading.value = true
    error.value = null
    try {
      shipments.value = (await client.getShipments(params)).items
    } catch (err) {
      error.value = err as Error
      shipments.value = []
    } finally {
      isLoading.value = false
    }
    return shipments.value
  }

  async function fetchShipmentById(id: string) {
    isLoading.value = true
    error.value = null
    try {
      current.value = await client.getShipmentById(id)
      return current.value
    } catch (err) {
      error.value = err as Error
      current.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function createShipment(input: Parameters<ShipmentProvider['createShipment']>[0]) {
    isLoading.value = true
    error.value = null
    try {
      current.value = await client.createShipment(input)
      return current.value
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function addTracking(shipmentId: string, tracking: Parameters<ShipmentProvider['addTracking']>[1]) {
    isLoading.value = true
    error.value = null
    try {
      const result: ShipmentTracking = await client.addTracking(shipmentId, tracking)
      if (current.value) {
        current.value = {
          ...current.value,
          tracking: [...current.value.tracking, result],
        }
      }
      return result
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    shipments,
    current,
    isLoading,
    error,
    fetchShipments,
    fetchShipmentById,
    createShipment,
    addTracking,
  }
}

export default useShipment
