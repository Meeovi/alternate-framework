<template>
  <div>
      <!--<profilebar />-->
      <section data-bs-version="5.1" class="features07 scalem5 cid-uhB4hw1yxB mbr-fullscreen" id="features07-9l">
          <div class="container">
              <div class="row">
                  <div class="col-12 col-lg-10 card">
                      <div class="title-wrapper">
                          <h2 class="mbr-section-title mbr-fonts-style display-5">
                              View Order</h2>
                      </div>
                  </div>
                  <div class="col-12 col-lg-8">
                      <div class="items-wrapper">
                          <div class="item features-without-image item-mb">
                              <div class="item-wrapper">
                                  <div class="card-box">
                                      <div class="icon-wrapper">
                                          <span class="mbr-iconfont mobi-mbri-growing-chart mobi-mbri"></span>
                                      </div>
                                      <h4 class="card-title mbr-fonts-style display-7">
                                          Order Information
                                      </h4>
                                      <NuxtLink class="card-text mbr-fonts-style display-7" :to="`/order/${order?.id}`">Order #:
                                          {{ order?.id }}</NuxtLink>
                                      <p class="card-text mbr-fonts-style display-7">Order Date:
                                          {{ order?.date_created ? new Date(order.date_created).toLocaleDateString() : '' }}</p>
                                      <p class="card-text mbr-fonts-style display-7">Order Status:
                                          {{ order?.payment_status }}</p>
                                  </div>
                              </div>
                          </div>
                          <div class="item features-without-image item-mb">
                              <div class="item-wrapper">
                                  <div class="card-box">
                                      <div class="icon-wrapper">
                                          <span class="mbr-iconfont mobi-mbri-globe-2 mobi-mbri"></span>
                                      </div>
                                      <h4 class="card-title mbr-fonts-style display-7">
                                          Account Information
                                      </h4>
                                      <p class="card-text mbr-fonts-style display-7">Customer Name: {{ order?.customer_firstname }} {{ order?.customer_lastname }}</p>
                                      <p class="card-text mbr-fonts-style display-7">Email: {{ order?.customer_email }}</p>
                                  </div>
                              </div>
                          </div>
                          <div class="item features-without-image item-mb">
                              <div class="item-wrapper">
                                  <div class="card-box">
                                      <div class="icon-wrapper">
                                          <span class="mbr-iconfont mobi-mbri-delivery mobi-mbri"></span>
                                      </div>
                                      <h4 class="card-title mbr-fonts-style display-7">
                                          Shipment Tracking
                                      </h4>
                                      <p v-if="order?.tracking_number" class="card-text mbr-fonts-style display-7">
                                          {{ order?.shipment_carrier }} — {{ order?.tracking_number }}
                                          <span v-if="order?.shipment_status">({{ order.shipment_status }})</span>
                                      </p>
                                      <p v-else class="card-text mbr-fonts-style display-7">Not yet shipped.</p>
                                      <NuxtLink v-if="order?.tracking_url" :to="order.tracking_url" target="_blank">Track this shipment</NuxtLink>
                                  </div>
                              </div>
                          </div>
                          <div class="item features-without-image item-mb">
                              <div class="item-wrapper">
                                  <div class="card-box">
                                      <div class="icon-wrapper">
                                          <span class="mbr-iconfont mobi-mbri-responsive-2 mobi-mbri"></span>
                                      </div>
                                      <h4 class="card-title mbr-fonts-style display-7">
                                          Payment Information
                                      </h4>
                                      <p class="card-text mbr-fonts-style display-7">Payment status: {{ order?.payment_status }}</p>
                                      <p class="card-text mbr-fonts-style display-7">The order was placed using {{ order?.order_currency_code }}</p>
                                  </div>
                              </div>
                          </div>
                          <div class="item features-without-image item-mb">
                              <div class="item-wrapper">
                                  <div class="card-box">
                                      <div class="icon-wrapper">
                                          <span class="mbr-iconfont mobi-mbri-cash mobi-mbri"></span>
                                      </div>
                                      <h4 class="card-title mbr-fonts-style display-7">
                                          Shipping Information
                                      </h4>
                                      <p class="card-text mbr-fonts-style display-7">{{ order?.shipping_address_id }}
                                      </p>
                                      <p class="card-text mbr-fonts-style display-7">Total Shipping Charges: {{ order?.shipping_amount != null ? formatPrice(order.shipping_amount) : '' }}</p>
                                      <p class="card-text mbr-fonts-style display-7">
                                          {{ order?.shipping_discount_tax_compensation_amount }}</p>
                                      <p class="card-text mbr-fonts-style display-7">{{ order?.shipping_incl_tax }}</p>
                                      <p class="card-text mbr-fonts-style display-7">{{ order?.shipping_tax_amount }}
                                      </p>
                                  </div>
                              </div>
                          </div>
                      </div>

                  </div>
              </div>
          </div>
          <NuxtImg provider="cloudinary" src="https://via.placeholder.com/1200x400" :alt="order?.id" />
      </section>

      <v-card title="Order Items" flat>
          <div class="container">
              <v-data-table :headers="headers" :items="order?.line_items_snapshot || []" :items-per-page="5" class="elevation-1">
                  <template v-slot:[`item.name`]="{ item }">
                      <strong>{{ item.name }}</strong>
                  </template>
                  <template v-slot:[`item.quantity`]="{ item }">
                      {{ item.quantity }}
                  </template>
                  <template v-slot:[`item.unit_amount`]="{ item }">
                      {{ item.unit_amount }}
                  </template>
                  <template v-slot:[`item.subtotal`]="{ item }">
                      {{ item.subtotal }}
                  </template>
              </v-data-table>
          </div>
      </v-card>
      <section data-bs-version="5.1" class="pricing1 lodgem5 cid-uhBqGPVpcI" id="apricing1-9s">
          <div class="container">
              <div class="row">
                  <div class="col-12">
                      <div class="mbr-section-head">
                          <h3 class="mbr-section-title mbr-fonts-style mb-0 display-5">
                              Order Totals</h3>

                      </div>
                      <div class="tabl-container">
                          <div class="tabl-item-row">
                              <div class="tabl-item-column">
                                  <p class="card-text mbr-fonts-style mb-0 display-7">
                                      Subtotal
                                  </p>
                              </div>
                              <div class="tabl-item-column">
                                  <p class="card-text mbr-fonts-style mb-0 display-7">
                                      {{ order?.subtotal != null ? formatPrice(order.subtotal) : '' }}
                                  </p>
                              </div>

                          </div>

                          <div class="tabl-item-row">
                              <div class="tabl-item-column">
                                  <p class="card-text mbr-fonts-style mb-0 display-7">
                                      Shipping & Handling
                                  </p>
                              </div>
                              <div class="tabl-item-column">
                                  <p class="card-text mbr-fonts-style mb-0 display-7">
                                      {{ order?.shipping_amount != null ? formatPrice(order.shipping_amount) : '' }}
                                  </p>
                              </div>

                          </div>
                          <div class="tabl-item-row">
                              <div class="tabl-item-column">
                                  <p class="card-text mbr-fonts-style mb-0 display-7">
                                      Tax
                                  </p>
                              </div>
                              <div class="tabl-item-column">
                                  <p class="card-text mbr-fonts-style mb-0 display-7">
                                      {{ order?.tax_amount != null ? formatPrice(order.tax_amount) : '' }}
                                  </p>
                              </div>
                          </div>
                          <div class="tabl-item-row">
                              <div class="tabl-item-column">
                                  <p class="card-text mbr-fonts-style mb-0 display-7">
                                      <strong>Grand Total</strong>
                                  </p>
                              </div>
                              <div class="tabl-item-column">
                                  <p class="card-text mbr-fonts-style mb-0 display-7">
                                      <strong>{{ order?.grand_total != null ? formatPrice(order.grand_total) : '' }}</strong>
                                  </p>
                              </div>
                          </div>
                          <div class="tabl-item-row">
                              <div class="tabl-item-column">
                                  <p class="card-text mbr-fonts-style mb-0 display-7">
                                      <strong>Total Paid</strong>
                                  </p>
                              </div>
                              <div class="tabl-item-column">
                                  <p class="card-text mbr-fonts-style mb-0 display-7">
                                      <strong>{{ order?.total_paid != null ? formatPrice(order.total_paid) : '' }}</strong>
                                  </p>
                              </div>
                          </div>
                          <div class="tabl-item-row">
                              <div class="tabl-item-column">
                                  <p class="card-text mbr-fonts-style mb-0 display-7">
                                      <strong>Total Refunded</strong>
                                  </p>
                              </div>
                              <div class="tabl-item-column">
                                  <p class="card-text mbr-fonts-style mb-0 display-7">
                                      <strong>{{ order?.total_refunded != null ? formatPrice(order.total_refunded) : '' }}</strong>
                                  </p>
                              </div>
                          </div>
                          <div class="tabl-item-row">
                              <div class="tabl-item-column">
                                  <p class="card-text mbr-fonts-style mb-0 display-7">
                                      <strong>Total Due</strong>
                                  </p>
                              </div>
                              <div class="tabl-item-column">
                                  <p class="card-text mbr-fonts-style mb-0 display-7">
                                      <strong>{{ order?.total_due != null ? formatPrice(order.total_due) : '' }}</strong>
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

<script>

  export default {
      data: () => ({
          headers: [{
                  text: 'Product',
                  value: 'name'
              },
              {
                  text: 'Price',
                  value: 'unit_amount'
              },
              {
                  text: 'Quantity',
                  value: 'quantity'
              },
              {
                  text: 'Subtotal',
                  value: 'subtotal'
              },
          ],
      }),
  }
</script>

<script setup>
    import { useAuth } from '#auth/app/composables/useAuth'
    import { useCurrencyStore } from '../../stores/currency'

    const route = useRoute();

    // grand_total/subtotal/tax_amount/shipping_amount/total_paid/
    // total_refunded/total_due are `integer` columns storing raw cents
    // (confirmed against the live schema) — format for display rather than
    // interpolating the raw integer.
    const { formatPrice } = useCurrencyStore()

    const {
        $directus,
        $readItems
    } = useNuxtApp()

    const { data: session } = await useAuth().getSession()
    const currentUserId = session?.user?.id ?? null

    const {
        data: order
    } = await useAsyncData('order', async () => {
        if (!currentUserId) return null
        const results = await $directus.request($readItems('orders', {
            filter: {
                id: { _eq: route.params.id },
                user_id: { _eq: currentUserId }
            },
            limit: 1
        }))
        return results?.[0] ?? null
    })

    useHead({
        title: order?.value?.id ? `Order ${order.value.id}` : 'Order Page',
    })
</script>