<template>
    <div>
        <v-toolbar>
            <v-toolbar-title>Security</v-toolbar-title>
        </v-toolbar>

        <v-row class="mt-4">
            <!-- Hidden until there are M devices to locate. -->
            <v-col v-if="showFindMyDevice" cols="12" md="4">
                <v-card to="/workspace/security/find-my-m-device" title="Find my M Device"
                    subtitle="Locate your M devices and save their location when they're online.">
                    <template v-slot:prepend>
                        <v-icon color="primary" icon="fas fa-location-crosshairs"></v-icon>
                    </template>
                </v-card>
            </v-col>
            <v-col v-else cols="12">
                <v-card variant="tonal" text="No security options available yet." />
            </v-col>
        </v-row>
    </div>
</template>

<script setup>
    // Flip on once M devices exist.
    const showFindMyDevice = false

    useHead({
        title: 'Security'
    })

    definePageMeta({
      layout: 'settings'
    })
</script>
