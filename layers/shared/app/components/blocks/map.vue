<template>
  <div ref="mapEl" style="height: 400px; width: 100%;"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import * as L from 'leaflet'
import {
  useLeafletMap,
  LatLngTuple,
  HeatPoint,
} from '~/composables/useLeafletMap'

const props = defineProps<{
  address?: string
  geosearchQuery?: string
  markers?: LatLngTuple[]
  heatPoints?: HeatPoint[]
  wmsConfig?: { url: string; options: any }[]
  routeWaypoints?: LatLngTuple[]
  enableDrawing?: boolean
  customIconMarkers?: {
    latlng: LatLngTuple
    iconOptions: L.IconOptions
    popup?: string
  }[]
  mapRef?: (map: L.Map) => void
}>()

const mapEl = ref<HTMLElement | null>(null)

const {
  initMap,
  centerOnUser,
  centerOnAddress,
  geosearch,
  createClusterGroup,
  createHeatLayer,
  addWmsLayer,
  enableDrawingTools,
  addRoute,
  addMarkerWithIcon,
  on,
} = useLeafletMap()

onMounted(async () => {
  if (!mapEl.value) return

  const m = initMap(mapEl.value, {
    zoom: 13,
    zoomControl: false,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(m)

  // Center logic
  if (props.address) {
    await centerOnAddress(props.address)
  } else {
    await centerOnUser()
  }

  // Geosearch
  if (props.geosearchQuery) {
    await geosearch(props.geosearchQuery)
  }

  // Clustered markers
  if (props.markers?.length) {
    createClusterGroup(props.markers)
  }

  // Heatmap
  if (props.heatPoints?.length) {
    createHeatLayer(props.heatPoints, {
      radius: 25,
      blur: 15,
    })
  }

  // WMS layers
  props.wmsConfig?.forEach(cfg => {
    addWmsLayer(cfg.url, cfg.options)
  })

  // Drawing tools
  if (props.enableDrawing) {
    enableDrawingTools()
  }

  // Route plotting
  if (props.routeWaypoints?.length && props.routeWaypoints.length >= 2) {
    addRoute(props.routeWaypoints)
  }

  // Custom icon markers
  props.customIconMarkers?.forEach(mk => {
    addMarkerWithIcon(mk.latlng, mk.iconOptions, mk.popup)
  })

  // Expose map instance
  props.mapRef?.(m)
})

// React to address / geosearch changes
watch(() => props.address, async (newVal) => {
  if (newVal) await centerOnAddress(newVal)
})

watch(() => props.geosearchQuery, async (newVal) => {
  if (newVal) await geosearch(newVal)
})

// Example: listen to draw events in this component
on('map:draw:create', (geojson) => {
  // You can forward this to your analytics / search / backend
  // console.log('Draw created:', geojson)
})
</script>