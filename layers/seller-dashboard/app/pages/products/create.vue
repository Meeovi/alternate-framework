<template>
  <div>
    <h2>Create Product</h2>
    <form @submit.prevent="onSubmit">
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
      <button type="submit">Create</button>
    </form>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from '#imports'
import { useSellerProducts } from '~/layers/seller-dashboard/app/composables/useSellerProducts'

const form = reactive({ name: '', price: 0, description: '' })
const { createProduct } = useSellerProducts()
const router = useRouter()

async function onSubmit() {
  const created = await createProduct({ title: form.name, price: form.price, description: form.description })
  if (created && created.id) {
    await router.push(`/seller-dashboard/products/${created.id}`)
  }
}
</script>
