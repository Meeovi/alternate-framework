// packages/adapters/adapter-magento/src/normalizers/shipment.ts
import { createNormalizer } from './automapper'
import type { Mage_OrderShipment } from '../graphql/schema-types'
import type { Query as DirectusQuery } from 'adapter-directus'

type DirectusShipment = NonNullable<DirectusQuery['Directus_shipment']>[0]

export const normalizeMagentoShipment = createNormalizer<Mage_OrderShipment, DirectusShipment>({
  id: (src) => String(src?.id ?? ''),
  code: (src) => src?.number ?? '',
  shipment_status: () => 'shipped',
  total_qty: (src) => src?.items?.length ?? 0,
  tracks: (src) => src?.tracking?.map((t) => ({
    title: (t as any)?.title ?? '',
    carrier: (t as any)?.carrier ?? '',
    tracking_number: (t as any)?.number ?? ''
  })) ?? []
})
