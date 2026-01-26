<template>
  <div>
    <!---->
    <v-row class="giftCardSection">
      <v-col cols="12">
        <h2>{{ callouts?.menus?.[3]?.name }}</h2>
      </v-col>

      <v-col cols="12">
        <v-row>
          <v-col cols="6"><v-text-field class="giftcardfield"
              :label="callouts?.menus?.[4]?.name"></v-text-field></v-col>
          <v-col cols="6"><v-btn class="giftcardbtn" color="orange" size="x-large" type="submit"
              variant="elevated">{{ callouts?.menus?.[5]?.name }}</v-btn></v-col>
        </v-row>

        <v-expansion-panels>
          <v-expansion-panel :title="callouts?.menus?.[6]?.name" :text="callouts?.menus?.[6]?.description">
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>

      <v-col cols="12">
        <h2>{{ callouts?.menus?.[7]?.name }} {{ gift?.amount }}</h2>
        <NuxtLink :to="`/commerce/giftcard/${gift?.id}`">{{ callouts?.menus?.[8]?.name }}</NuxtLink>
      </v-col>
      <v-divider></v-divider>

      <v-col cols="12">
        <p></p>
      </v-col>
      <v-divider></v-divider>
    </v-row>
  </div>
</template>

<script setup>
  const props = defineProps({
    gift: {
      type: String,
      required: true,
    },
  });

  const {
    $directus,
    $readItem
  } = useNuxtApp()

  const {
    data: callouts
  } = await useAsyncData('callouts', () => {
    return $directus.request($readItem('callouts', '4'))
  })

  useHead({
    title: 'Redeem an Meeovi Gift Card'
  })

  definePageMeta({
    middleware: ['authenticated'],
  })
</script>