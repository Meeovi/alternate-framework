<template>
    <div>
        <section data-bs-version="5.1" class="features12 cid-v0v1enubKX" id="features12-j">
            <div>
                <div class="container">
                    <div class="row">
                        <div class="card col-12 col-md-6 col-lg-4">
                            <div class="card-wrapper">
                                <div class="card-box">
                                    <div class="iconfont-wrapper icon1">
                                        <span class="mbr-iconfont mobi-mbri-features mobi-mbri"></span>
                                    </div>
                                    <h5 class="card-title mbr-fonts-style display-7">Details</h5>
                                    <p class="card-text mbr-fonts-style display-4">
                                        <i class="fas fa-users" style="display: inline-block;"> Event by {{ event?.hosts?.first_name }}
                                            {{ event?.hosts?.last_name }}</i> <br>
                                        <i class="fas fa-users" style="display: inline-block;"> {{ event?.location }}</i><br>
                                        <i class="fas fa-users" style="display: inline-block;"> Tickets <NuxtLink :to="event?.tickets_url"></NuxtLink>
                                            {{ event?.tickets_url }}</i><br>
                                        <i class="fas fa-users" style="display: inline-block;"> Type: {{ event?.type }}</i><br>
                                        <i class="fas fa-users" style="display: inline-block;">{{ event?.description }}</i>
                                    </p>
                                    <p class="link display-4">
                                        <NuxtLink class="text-info custom-link" to="">
                                            <span class="mbr-iconfont mobi-mbri-arrow-next mobi-mbri">
                                            </span>
                                            {{ event?.location }}
                                        </NuxtLink>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="card col-12 col-md-6 col-lg-4">
                            <div class="card-wrapper">
                                <div class="card-box">
                                    <div class="iconfont-wrapper icon2">
                                        <span class="mbr-iconfont mobi-mbri-desktop mobi-mbri"></span>
                                    </div>
                                    <h5 class="card-title mbr-fonts-style display-7">Tickets</h5>
                                    <p class="link display-4">
                                        <NuxtLink class="text-info custom-link" :to="event?.tickets_url">
                                            <span class="mbr-iconfont mobi-mbri-arrow-next mobi-mbri">
                                            </span>
                                            Get Your Tickets
                                        </NuxtLink>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="card col-12 col-md-6 col-lg-4">
                            <div class="card-wrapper">
                                <div class="card-box">
                                    <div class="iconfont-wrapper icon3">
                                        <span class="mbr-iconfont mobi-mbri-cursor-click mobi-mbri"></span>
                                    </div>
                                    <h5 class="card-title mbr-fonts-style display-7">Meet Your Hosts</h5>
                                    <p class="card-text mbr-fonts-style display-4">
                                        <v-sheet class="mx-auto">
                                            <v-slide-group v-model="model" class="pa-4" selected-class="bg-success"
                                                show-arrows>
                                                <v-slide-group-item v-for="hosts in event?.hosts" :key="hosts.id"
                                                    :value="hosts" v-slot="{ isSelected, toggle, selectedClass }">
                                                    <userCard :member="hosts" :class="['ma-4', selectedClass]"
                                                        v-if="isSelected" @click="toggle" />
                                                </v-slide-group-item>
                                            </v-slide-group>
                                        </v-sheet>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="card col-12 col-md-6 col-lg-4">
                            <div class="card-wrapper">
                                <div class="card-box">
                                    <div class="iconfont-wrapper icon4">
                                        <span class="mbr-iconfont mobi-mbri-help mobi-mbri"></span>
                                    </div>
                                    <h5 class="card-title mbr-fonts-style display-7">Guests</h5>
                                    <p class="card-text mbr-fonts-style display-4">
                                        Going:
                                    </p>
                                    <p class="card-text mbr-fonts-style display-4">
                                        Interested:
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="card col-12 col-md-6 col-lg-4">
                            <div class="card-wrapper">
                                <div class="card-box">
                                    <div class="iconfont-wrapper icon5">
                                        <span class="mbr-iconfont mobi-mbri-like mobi-mbri"></span>
                                    </div>
                                    <h5 class="card-title mbr-fonts-style display-7">Date</h5>
                                    <p class="card-text mbr-fonts-style display-4">{{ event?.start_time }}
                                        {{ event?.end_time }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="card col-12 col-md-6 col-lg-4">
                            <div class="card-wrapper">
                                <div class="card-box">
                                    <div class="iconfont-wrapper icon6">
                                        <span class="mbr-iconfont mobi-mbri-responsive-2 mobi-mbri"></span>
                                    </div>
                                    <h5 class="card-title mbr-fonts-style display-7">Location</h5>
                                    <div>
                                        <LeafletMap :event="event" :height="'350px'" :markerPopup="event?.location" />
                                    </div>
                                    <p class="card-text mbr-fonts-style display-4">
                                        {{ event?.location }}
                                    </p>

                                    <p class="card-text mbr-fonts-style display-4">
                                        {{ event?.address }} {{ event?.city?.city_id?.name }}
                                        {{ event?.state?.state_id?.name  }} {{ event?.city?.country_id?.name }}
                                        {{ event?.city?.postalcode }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
    import {
        ref
    } from 'vue'
    import LeafletMap from '~/components/blocks/LeafletMap.vue'

    const model = ref(null)
    // Accept event prop for display in the template
    defineProps({
        event: {
            type: Object,
            required: true,
        },
    })
</script>

<style>
    @import 'leaflet/dist/leaflet.css';
</style>