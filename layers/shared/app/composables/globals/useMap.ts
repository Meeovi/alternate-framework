import { shallowRef } from 'vue'
import * as L from 'leaflet'

// Plugins
import 'leaflet.markercluster'
import 'leaflet.heat'
import 'leaflet-routing-machine'
import '@geoman-io/leaflet-geoman-free'

// Optional CSS (usually in your global entry / module)
// import 'leaflet/dist/leaflet.css'
// import 'leaflet.markercluster/dist/MarkerCluster.css'
// import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
// import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
// import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'

export type LatLngTuple = [number, number]
export type HeatPoint = [number, number, number?]

// -------------------------------
// EVENT BUS
// -------------------------------
type Handler = (payload?: any) => void
const listeners = new Map<string, Set<Handler>>()

const emit = (event: string, payload?: any) => {
  const handlers = listeners.get(event)
  if (handlers) handlers.forEach(h => h(payload))
}

const on = (event: string, handler: Handler) => {
  if (!listeners.has(event)) listeners.set(event, new Set())
  listeners.get(event)!.add(handler)
}

const off = (event: string, handler: Handler) => {
  listeners.get(event)?.delete(handler)
}

// -------------------------------
// ANALYTICS HOOKS
// -------------------------------
const analytics = {
  track(event: string, payload?: any) {
    emit('analytics:map', { event, payload, ts: Date.now() })
  }
}

// -------------------------------
// EVENT PERSISTENCE + REPLAY
// -------------------------------
const PERSIST_KEY = 'leaflet:eventlog:v1'

const persistEvent = (event: string, payload: any) => {
  try {
    const log = JSON.parse(localStorage.getItem(PERSIST_KEY) || '[]')
    log.push({ event, payload, ts: Date.now() })
    localStorage.setItem(PERSIST_KEY, JSON.stringify(log))
  } catch {
    // ignore if storage unavailable
  }
}

const replayEvents = () => {
  try {
    const log = JSON.parse(localStorage.getItem(PERSIST_KEY) || '[]')
    log.forEach(({ event, payload }: any) => {
      emit(event, payload)
    })
  } catch {
    // ignore
  }
}

on('analytics:map', (data) => {
  persistEvent('analytics:map', data)
})

// -------------------------------
// CROSS-MODULE BRIDGE
// -------------------------------
const bridge = {
  toAnalytics(event: string, payload: any) {
    emit('bridge:analytics', { event, payload })
  },
  toNotify(event: string, payload: any) {
    emit('bridge:notify', { event, payload })
  },
  toCommunication(event: string, payload: any) {
    emit('bridge:communication', { event, payload })
  },
  toSearch(event: string, payload: any) {
    emit('bridge:search', { event, payload })
  },
  toSecurity(event: string, payload: any) {
    emit('bridge:security', { event, payload })
  }
}

// -------------------------------
// MAP COMPOSABLE
// -------------------------------
export function useLeafletMap() {
  const map = shallowRef<L.Map | null>(null)

  const initMap = (el: HTMLElement, options: L.MapOptions = {}) => {
    if (map.value) return map.value
    map.value = L.map(el, options)
    emit('map:init', map.value)
    analytics.track('map:init')
    replayEvents()
    return map.value
  }

  const centerOnUser = async () => {
    if (!map.value) return
    return new Promise<void>((resolve) => {
      map.value!.locate({ setView: true, maxZoom: 16 })

      map.value!.on('locationfound', (e) => {
        L.marker(e.latlng).addTo(map.value!)
        emit('map:center:user', e.latlng)
        analytics.track('map:center:user', e.latlng)
        resolve()
      })

      map.value!.on('locationerror', () => resolve())
    })
  }

  const centerOnAddress = async (address: string) => {
    if (!map.value) return
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
    const res = await fetch(url).then(r => r.json())
    if (res?.length) {
      const { lat, lon } = res[0]
      const ll: LatLngTuple = [parseFloat(lat), parseFloat(lon)]
      map.value.setView(ll, 15)
      const marker = L.marker(ll).addTo(map.value)
      emit('map:center:address', { address, latlng: ll, marker })
      analytics.track('map:center:address', { address, latlng: ll })
    }
  }

  // GEOSEARCH
  const geosearch = async (query: string) => {
    if (!map.value) return null
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
    const res = await fetch(url).then(r => r.json())
    if (!res?.length) return null

    const { lat, lon, display_name } = res[0]
    const ll: LatLngTuple = [parseFloat(lat), parseFloat(lon)]
    const marker = L.marker(ll).addTo(map.value)
    marker.bindPopup(display_name || query)
    map.value.setView(ll, 15)

    const payload = { query, latlng: ll, marker }
    emit('map:geosearch', payload)
    analytics.track('map:geosearch', payload)
    bridge.toSearch('map:geosearch', payload)

    return payload
  }

  // MARKER CLUSTERS
  const createClusterGroup = (points: LatLngTuple[], options: any = {}) => {
    if (!map.value) return null
    const clusterGroup = (L as any).markerClusterGroup(options)

    points.forEach(([lat, lng]) => {
      const marker = L.marker([lat, lng])
      clusterGroup.addLayer(marker)
      marker.on('click', () => {
        const payload = { lat, lng }
        emit('map:cluster:marker:click', payload)
        analytics.track('map:cluster:marker:click', payload)
      })
    })

    clusterGroup.addTo(map.value)
    emit('map:cluster:init', clusterGroup)
    analytics.track('map:cluster:init', { count: points.length })

    return clusterGroup
  }

  // HEATMAP
  const createHeatLayer = (points: HeatPoint[], options: any = {}) => {
    if (!map.value) return null
    const heat = (L as any).heatLayer(points, options)
    heat.addTo(map.value)
    const payload = { points, options }
    emit('map:heat:init', payload)
    analytics.track('map:heat:init', payload)
    return heat
  }

  // WMS LAYERS
  const addWmsLayer = (url: string, options: L.WMSOptions) => {
    if (!map.value) return null
    const wms = L.tileLayer.wms(url, options)
    wms.addTo(map.value)
    const payload = { url, options }
    emit('map:wms:add', payload)
    analytics.track('map:wms:add', payload)
    return wms
  }

  // CUSTOM ICONS
  const createIcon = (options: L.IconOptions) => L.icon(options)

  const addMarkerWithIcon = (latlng: LatLngTuple, iconOptions: L.IconOptions, popup?: string) => {
    if (!map.value) return null
    const icon = createIcon(iconOptions)
    const marker = L.marker(latlng, { icon }).addTo(map.value)
    if (popup) marker.bindPopup(popup)
    const payload = { latlng, iconOptions }
    emit('map:marker:icon', payload)
    analytics.track('map:marker:icon', payload)
    return marker
  }

  // DRAWING TOOLS (GEOMAN)
  const enableDrawingTools = (config: any = {}) => {
    if (!map.value) return

    ;(map.value as any).pm.addControls({
      position: 'topleft',
      drawMarker: true,
      drawPolygon: true,
      drawPolyline: true,
      drawCircle: true,
      drawRectangle: true,
      editMode: true,
      ...config,
    })

    map.value.on('pm:create', (e: any) => {
      const geo = e.layer.toGeoJSON()
      emit('map:draw:create', geo)
      analytics.track('map:draw:create', geo)
      bridge.toAnalytics('map:draw:create', geo)
    })

    map.value.on('pm:edit', (e: any) => {
      const geo = e.layer.toGeoJSON()
      emit('map:draw:edit', geo)
      analytics.track('map:draw:edit', geo)
    })

    map.value.on('pm:remove', (e: any) => {
      const geo = e.layer.toGeoJSON()
      emit('map:draw:remove', geo)
      analytics.track('map:draw:remove', geo)
    })
  }

  // ROUTE PLOTTING
  const addRoute = (waypoints: LatLngTuple[], options: any = {}) => {
    if (!map.value) return null

    const control = (L as any).Routing.control({
      waypoints: waypoints.map(([lat, lng]) => L.latLng(lat, lng)),
      routeWhileDragging: true,
      ...options,
    }).addTo(map.value)

    control.on('routesfound', (e: any) => {
      const routes = e.routes
      emit('map:route:found', routes)
      analytics.track('map:route:found', routes)
      bridge.toAnalytics('map:route:found', routes)
    })

    return control
  }

  return {
    map,
    initMap,
    centerOnUser,
    centerOnAddress,
    geosearch,

    createClusterGroup,
    createHeatLayer,
    addWmsLayer,
    createIcon,
    addMarkerWithIcon,
    enableDrawingTools,
    addRoute,

    // Event bus
    emit,
    on,
    off,

    // Analytics
    analytics,

    // Persistence
    replayEvents,

    // Cross-module bridge
    bridge,

    // Leaflet classes
    LCircle: L.Circle,
    LCircleMarker: L.CircleMarker,
    LControlAttribution: L.Control.Attribution,
    LControlLayers: L.Control.Layers,
    LControlScale: L.Control.Scale,
    LControlZoom: L.Control.Zoom,
    LControl: L.Control,
    LFeatureGroup: L.FeatureGroup,
    LGeoJson: L.GeoJSON,
    LGridLayer: L.GridLayer,
    LIcon: L.Icon,
    LImageOverlay: L.ImageOverlay,
    LLayerGroup: L.LayerGroup,
    LMap: L.Map,
    LMarker: L.Marker,
    LPolygon: L.Polygon,
    LPolyline: L.Polyline,
    LPopup: L.Popup,
    LRectangle: L.Rectangle,
    LTileLayer: L.TileLayer,
    LTooltip: L.Tooltip,
    LWmsTileLayer: L.TileLayer.WMS,
  }
}
