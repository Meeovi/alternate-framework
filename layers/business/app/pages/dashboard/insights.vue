<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <v-toolbar color="white">
      <v-toolbar-title>Business Insights</v-toolbar-title>
    </v-toolbar>

    <div class="contentSection">
      <v-row>
        <v-col cols="4">
          <v-card>
            <v-card-title>Orders Insights</v-card-title>
            <v-card-text>
              <p>This is the business insights page.</p>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="4">
          <v-card>
            <v-card-title>Products Insights</v-card-title>
            <v-card-text>
              <p>This is the business insights page.</p>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="4">
          <v-card>
            <v-card-title>Reviews Insights</v-card-title>
            <v-card-text>
              <p>This is the business insights page.</p>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="6">
          <v-card>
            <v-card-title>Recent Sales</v-card-title>
            <v-card-text>
              <p>This is the business insights page.</p>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="6">
          <v-card>
            <v-card-title>Spaces Statistics</v-card-title>
            <v-card-text>
              <p>This is the business insights page.</p>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="6">
          <v-card>
            <v-card-title>Recent Emails</v-card-title>
            <v-card-text>
              <p>This is the business insights page.</p>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="6">
          <v-card>
            <v-card-title>Shipment Details</v-card-title>
            <v-card-text>
              <p>This is the business insights page.</p>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12">
          <v-card>
            <v-card-title>Latest Meeovi Business news</v-card-title>
            <v-card-text>
              <p>This is the business insights page.</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'seller' })
useHead({
  title: 'Business Insights',
  meta: [
    {
      name: 'description',
      content: 'This is the business insights page.'
    }
  ]
})
</script>
