<template>
  <div>
    <v-card color="#b02564">
      <div class="d-flex flex-no-wrap justify-space-between">
        <div>
          <v-card-title class="text-h5">
            {{ radio?.name }}
          </v-card-title>

          <v-card-text>
            {{ radio?.description }}
          </v-card-text>

          <v-btn
            class="ms-2"
            size="small"
            text="LISTEN"
            variant="outlined"
            :href="`/departments/categories/station/${radio?.id}`"
          />
        </div>

        <UAvatar class="ma-3" rounded="0" size="125">
          <NuxtImg :src="getAssetUrl(radio?.image)" />
        </UAvatar>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import useAdapterRequest from '#social/app/composables/core/useAdapterRequest'

const props = defineProps({
  radio: {
    type: Object,
    required: true,
  },
})

const { radio } = props
const { getAssetUrl } = useAdapterRequest()
</script>