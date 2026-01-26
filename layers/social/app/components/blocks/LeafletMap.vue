<template>
  <div>
    <div :id="mapId" :style="{ height }"></div>
    <p v-if="error" class="map-error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  // Accept either an event object (preferred) or explicit coords
  event: {
    type: Object,
    default: null,
  },
  lat: {
    type: Number,
    default: null,
  },
  lon: {
    type: Number,
    default: null,
  },
  zoom: {
    type: Number,
    default: 15,
  },
  height: {
    type: String,
    default: '350px',
  },
  markerPopup: {
    type: String,
    default: '',
  },
  // toggle whether to try Nominatim geocoding (default true)
  geocode: {
    type: Boolean,
    default: true,
  }
})

const map = ref(null)
const error = ref(null)
const mapId = `leaflet-map-${Math.random().toString(36).substr(2, 9)}`

function buildAddress(ev) {
  if (!ev) return ''
  const parts = []
  if (ev.address) parts.push(ev.address)
  const cityName = ev?.city?.city_id?.name || ev?.city?.name || ev?.city
  if (cityName) parts.push(cityName)
  const stateName = ev?.state?.state_id?.name || ev?.state?.name || ev?.state
  if (stateName) parts.push(stateName)
  const countryName = ev?.city?.country_id?.name || ev?.country || ev?.country_id
  if (countryName) parts.push(countryName)
  const postal = ev?.city?.postalcode || ev?.postalcode
  if (postal) parts.push(postal)
  return parts.join(', ')
}

async function geocodeAddress(address) {
  if (!address) throw new Error('Empty address')
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json'
    }
  })
  if (!res.ok) throw new Error(`Geocode error: ${res.status}`)
  const json = await res.json()
  if (!json || !json.length) throw new Error('No geocode results')
  return {
    lat: parseFloat(json[0].lat),
    lon: parseFloat(json[0].lon),
    display_name: json[0].display_name,
  }
}

onMounted(() => {
  import('leaflet').then(async (Lmod) => {
    const L = Lmod.default || Lmod

    // Create the map with a default view
    map.value = L.map(mapId).setView([0, 0], 2)

    // Add the tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map.value)

    // If explicit coords provided, use them
    if (props.lat != null && props.lon != null) {
      map.value.setView([props.lat, props.lon], props.zoom)
      L.marker([props.lat, props.lon]).addTo(map.value).bindPopup(props.markerPopup || '').openPopup()
      return
    }

    // If event is provided, try geocode its address
    const ev = props.event
    if (ev && props.geocode) {
      const addr = buildAddress(ev)
      if (addr) {
        try {
          const g = await geocodeAddress(addr)
          map.value.setView([g.lat, g.lon], props.zoom)
          L.marker([g.lat, g.lon])
            .addTo(map.value)
            .bindPopup(props.markerPopup || `<strong>${ev?.address || ''}</strong><br/>${addr}`)
            .openPopup()
          return
        } catch (err) {
          console.warn('Geocode failed in LeafletMap:', err.message)
          error.value = `Geocoding failed: ${err.message}`
          // fall through to geolocation fallback
        }
      }
    }

    // Fallback to browser geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          map.value.setView([latitude, longitude], 13)
          L.marker([latitude, longitude])
            .addTo(map.value)
            .bindPopup('You are here!')
            .openPopup()
        },
        (err) => {
          console.error('Error getting location:', err.message)
          error.value = `Unable to get your location: ${err.message}. Using default view.`
          map.value.setView([40.7128, -74.0060], 13)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    } else {
      error.value = 'Geolocation not supported. Using default view.'
      map.value.setView([40.7128, -74.0060], 13)
    }
  })
})
</script>

<style scoped>
@import 'leaflet/dist/leaflet.css';
.map-error { color: #c00; margin-top: 0.5rem }
</style>
