<template>
  <div class="upload-page">
    <h1>Upload Your Vibez 🎥</h1>

    <form @submit.prevent="handleUpload">
      <label>
        Title:
        <input v-model="name" type="text" placeholder="My awesome video" />
      </label>

      <label>
        Video File:
        <input type="file" accept="video/*" @change="handleFile" />
      </label>

      <button :disabled="loading">
        {{ loading ? 'Uploading...' : 'Upload Vibez' }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">Upload successful! 🎉</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useDirectusAuth } from '~/composables/useDirectus'

const { user } = useDirectusAuth()

const name = ref('')
const file = ref(null)
const loading = ref(false)
const error = ref('')
const success = ref(false)

function handleFile(e) {
  file.value = e.target.files[0]
}

async function handleUpload() {
  error.value = ''
  success.value = false
  loading.value = true

  if (!user.value) {
    error.value = 'You must be logged in to upload.'
    loading.value = false
    return
  }

  if (!file.value) {
    error.value = 'Please select a video file.'
    loading.value = false
    return
  }

  const formData = new FormData()
  formData.append('name', name.value)
  formData.append('video', file.value)

  // Try to read Directus access token from cookies (common names: access_token or sb:token)
  const cookies = typeof document !== 'undefined' ? document.cookie : ''
  const match = cookies.match(/access_token=([^;]+)/) || cookies.match(/sb:token=([^;]+)/)
  const accessToken = match && match[1] ? decodeURIComponent(match[1]) : null

  const res = await fetch('/api/upload-video', {
    method: 'POST',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    body: formData,
  })

  const result = await res.json()
  if (!res.ok) {
    error.value = result.statusMessage || 'Upload failed.'
  } else {
    success.value = true
    name.value = ''
    file.value = null
  }

  loading.value = false
}
</script>

<style scoped>
.upload-page {
  max-width: 600px;
  margin: auto;
  padding: 2rem;
}
label {
  display: block;
  margin-bottom: 1rem;
}
input[type="text"],
input[type="file"] {
  width: 100%;
  padding: 0.5rem;
}
button {
  padding: 0.75rem 1.5rem;
  background: #0070f3;
  color: white;
  border: none;
  cursor: pointer;
}
.error {
  color: red;
}
.success {
  color: green;
}
</style>