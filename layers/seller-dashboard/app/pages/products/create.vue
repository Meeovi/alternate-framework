<template>
  <div>
    <h2>Create Product</h2>
    <UForm @submit.prevent="onSubmit">
      <div>
        <label>Name</label>
        <UInput v-model="form.name" />
      </div>
      <div>
        <label>Price</label>
        <UInput v-model.number="form.price" type="number" />
      </div>
      <div>
        <label>Description</label>
        <textarea v-model="form.description" />
      </div>
      <UButton type="submit">Create</UButton>
    </UForm>
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
