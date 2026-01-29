<template>
  <div>
    <h2>Edit Product</h2>
    <div v-if="loading">Loading...</div>
    <form v-else @submit.prevent="onSubmit">
      <div>
        <label>Name</label>
        <input v-model="form.name" />
      </div>
      <div>
        <label>Price</label>
        <input v-model.number="form.price" type="number" />
      </div>
      <div>
        <label>Description</label>
        <textarea v-model="form.description" />
      </div>
      <button type="submit">Save</button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from '#imports'
import { useSellerProducts } from '~/layers/seller-dashboard/app/composables/useSellerProducts'

const route = useRoute()
const router = useRouter()
const { getProduct, updateProduct } = useSellerProducts()
const loading = ref(true)
const form = reactive({ name: '', price: 0, description: '' })

async function load() {
  loading.value = true
  const id = route.params.id as string
  const p = await getProduct(id)
  if (p) {
    form.name = p.title || p.name || ''
    form.price = p.price || 0
    form.description = p.description || ''
  }
  loading.value = false
}

async function onSubmit() {
  const id = route.params.id as string
  await updateProduct(id, { title: form.name, price: form.price, description: form.description })
  await router.push('/seller-dashboard/products')
}

onMounted(load)
</script>
