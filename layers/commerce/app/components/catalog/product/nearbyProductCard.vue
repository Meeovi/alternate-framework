<template>
  <div v-if="!tooFar" class="nearby-product-card">
    <productCard :product="product" />
    <!-- Client-only: distance depends on where the visitor is. -->
    <v-chip v-if="mounted && (distanceLabel || placeLabel)" size="small" variant="flat" color="surface"
      prepend-icon="fas fa-location-dot" class="nearby-product-card__distance"
      :title="placeLabel || undefined">
      {{ distanceLabel || placeLabel }}
    </v-chip>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import productCard from './productCard.vue'
  import { useUserLocation } from '../../../composables/catalog/location/useUserLocation'
  import { distanceKm, formatDistance, productLocation, toLatLng } from '../../../utils/geo'

  /**
   * productCard with how far the product is from the visitor ("2.3 mi
   * away"), for "near you" grids such as the Travel department.
   *
   *   <nearbyProductCard :product="product" />
   *   <nearbyProductCard :product="product" :max-distance-km="100" units="km" />
   *
   * Feed it products from useNearbyProducts() (already sorted, each with
   * distanceKm) or any product list: the distance is then worked out from
   * the product's latitude/longitude (or its shop's) and the visitor's
   * location. The card never shows a permission prompt itself; it uses the
   * browser location only if the visitor already allowed it, otherwise the
   * approximate one.
   */
  const props = defineProps({
    product: {
      type: Object,
      required: true,
    },
    /** Measure from here ({ lat, lng }) instead of the visitor's location. */
    origin: {
      type: Object,
      default: null,
    },
    /** Hide the card when the product is farther than this (km). */
    maxDistanceKm: {
      type: Number,
      default: null,
    },
    /** 'auto' = miles in the US/UK, kilometres elsewhere. */
    units: {
      type: String,
      default: 'auto',
      validator: (v) => ['auto', 'km', 'mi'].includes(v),
    },
  })

  const { location, locate } = useUserLocation()
  const mounted = ref(false)
  const locale = ref('en-US')
  onMounted(() => {
    mounted.value = true
    locale.value = navigator.language || 'en-US'
    if (!props.origin && props.product?.distanceKm == null) locate({ prompt: false })
  })

  const distance = computed(() => {
    const from = props.origin ? toLatLng(props.origin.lat, props.origin.lng) : null
    if (!from && Number.isFinite(Number(props.product?.distanceKm))) return Number(props.product.distanceKm)
    const at = productLocation(props.product)
    const origin = from ?? location.value
    return at && origin ? distanceKm(origin, at) : null
  })

  const tooFar = computed(() => props.maxDistanceKm != null && distance.value != null && distance.value > props.maxDistanceKm)
  const distanceLabel = computed(() => (distance.value == null ? '' : formatDistance(distance.value, locale.value, props.units)))
  const placeLabel = computed(() => props.product?.location_name || props.product?.shops?.[0]?.shops_id?.address || '')
</script>

<style scoped>
/* Same footprint as productCard; the chip sits on the image's top-left
   corner (the wishlist heart has the top-right). */
.nearby-product-card {
  position: relative;
  max-width: 300px;
}

.nearby-product-card__distance {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;
  max-width: calc(100% - 64px);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
