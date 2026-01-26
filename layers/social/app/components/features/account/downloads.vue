<template>
  <div>
    <v-toolbar color="transparent" density="compact" title="My Downloads">
      <v-spacer />
      <v-text-field
        v-model="search"
        append-icon="fas:fa fa-search"
        label="Search Downloads"
        single-line
        hide-details
        density="compact"
        class="search-field"
      />
    </v-toolbar>

    <v-card>
      <v-table>
        <thead>
          <tr>
            <th class="text-left">Product Name</th>
            <th class="text-left">Order #</th>
            <th class="text-left">Date</th>
            <th class="text-left">Status</th>
            <th class="text-left">Remaining Downloads</th>
            <th class="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="download in filteredDownloads" :key="download.id">
            <td>{{ download.product_name }}</td>
            <td>{{ download.order_increment_id }}</td>
            <td>{{ formatDate(download.created_at) }}</td>
            <td>
              <v-chip
                :color="download.status === 'available' ? 'success' : 'error'"
                size="small"
              >
                {{ download.status }}
              </v-chip>
            </td>
            <td>{{ download.downloads_remaining }}</td>
            <td>
              <v-btn
                v-if="download.status === 'available'"
                color="primary"
                size="small"
                @click="downloadFile(download)"
                :loading="downloading === download.id"
              >
                Download
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>

      <v-pagination
        v-model="page"
        :length="totalPages"
        @update:model-value="loadDownloads"
      />
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMagentoApi } from '#commerce/app/composables/useMagentoApi'

const downloads = ref([])
const search = ref('')
const page = ref(1)
const totalPages = ref(1)
const downloading = ref(null)

const { fetchMagento } = useMagentoApi()

const filteredDownloads = computed(() => {
  if (!search.value) return downloads.value
  const searchLower = search.value.toLowerCase()
  return downloads.value.filter(download => 
    download.product_name.toLowerCase().includes(searchLower) ||
    download.order_increment_id.toLowerCase().includes(searchLower)
  )
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const loadDownloads = async () => {
  try {
    const response = await fetchMagento('downloadable/customer/downloads', {
      params: {
        page: page.value,
        limit: 10
      }
    })
    downloads.value = response.items
    totalPages.value = Math.ceil(response.total_count / 10)
  } catch (error) {
    console.error('Failed to load downloads:', error)
  }
}

const downloadFile = async (download) => {
  try {
    downloading.value = download.id
    const response = await fetchMagento(`downloadable/customer/downloads/${download.id}/link`, {
      method: 'GET',
      responseType: 'blob'
    })
    
    // Create a download link and trigger it
    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', download.product_name)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    // Reload downloads to update remaining count
    await loadDownloads()
  } catch (error) {
    console.error('Failed to download file:', error)
  } finally {
    downloading.value = null
  }
}

onMounted(() => {
  loadDownloads()
})

useHead({
  title: 'My Downloads'
})
</script>

<style scoped>
.search-field {
  max-width: 300px;
}
</style>