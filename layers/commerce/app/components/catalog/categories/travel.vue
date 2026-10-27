<template>
    <div>
        <div id="map" style="height: 400px;"></div>
        <p v-if="locationError">{{ locationError }}</p>

        <v-toolbar>
            <v-toolbar-title>Search for your next destination</v-toolbar-title>
        </v-toolbar>

        <template>
            <SkyscannerWidget widget="FlightSearchWidget" locale="en-US" market="US" currency="USD" />

            <v-card width="100%" class="mt-4">
                <v-card-text class="center-text">The above widget is provided by Skyscanner and allows you to search for
                    flights and compare prices. Meeovi is not responsible for the data shown above or the website the
                    links direct you to.</v-card-text>
            </v-card>
        </template>

        <v-row v-if="products.length">
            <v-col v-for="p in products" :key="p.id" cols="12" sm="6" md="4" lg="3">
                <nearbyProductCard :product="p" />
            </v-col>
        </v-row>

        <p v-else-if="status === 'success'">Nothing near you yet.</p>
    </div>
</template>

<script setup>
    import {
        onMounted,
        ref
    } from 'vue';
    import SkyscannerWidget from '../../blocks/travelWidget.vue';
    import nearbyProductCard from '../product/nearbyProductCard.vue'
    import {
        useNearbyProducts
    } from '../../../composables/catalog/products/useNearbyProducts'

    const {
        products,
        status
    } = useNearbyProducts({
        department: 'travel',
        radiusKm: 100,
        limit: 24
    })

    const props = defineProps({
        category: {
            type: String,
            required: false,
            default: ''
        },
    });

    const mapInstance = ref(null);
    const locationError = ref(null);

    onMounted(() => {
        import('leaflet').then((L) => {
            // Create the map with a default view
            mapInstance.value = L.map('map').setView([0, 0], 2);

            // Add the tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <NuxtLink to="https://www.openstreetmap.org/">OpenStreetMap</NuxtLink> contributors',
                maxZoom: 18,
            }).addTo(mapInstance.value);

            // Try to get the user's location
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const {
                            latitude,
                            longitude
                        } = position.coords;
                        mapInstance.value.setView([latitude, longitude], 13);

                        // Add a marker at the user's location
                        L.marker([latitude, longitude])
                            .addTo(mapInstance.value)
                            .bindPopup('You are here!')
                            .openPopup();
                    },
                    (error) => {
                        console.error("Error getting location:", error.message);
                        locationError.value =
                            `Unable to get your location: ${error.message}. Using default view.`;
                        // Fallback to a default location (e.g., New York City)
                        mapInstance.value.setView([40.7128, -74.0060], 13);
                    }, {
                        enableHighAccuracy: true,
                        timeout: 10000, // Increased timeout to 10 seconds
                        maximumAge: 0
                    }
                );
            } else {
                locationError.value =
                    "Geolocation is not supported by this browser. Using default view.";
                // Fallback to a default location
                mapInstance.value.setView([40.7128, -74.0060], 13);
            }
        });
    });
</script>

<style>
    @import 'leaflet/dist/leaflet.css';
</style>