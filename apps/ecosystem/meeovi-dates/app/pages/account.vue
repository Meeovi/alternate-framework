<template>
  <v-container class="py-8" fluid>
    <v-row justify="center">
      <v-col cols="12" md="6" lg="4">
        <v-card>
          <v-card-title>Account</v-card-title>
          <v-divider />
          <v-card-text>
            <div v-if="user">
              <div class="mb-4">
                <strong>Email:</strong> {{ user.email }}
              </div>
              <v-btn color="primary" @click="logout">Logout</v-btn>
            </div>
            <div v-else>
              <v-tabs v-model="tab">
                <v-tab value="login">Login</v-tab>
                <v-tab value="register">Register</v-tab>
              </v-tabs>
              <v-window v-model="tab">
                <v-window-item value="login">
                  <v-form @submit.prevent="login">
                    <v-text-field v-model="loginForm.email" label="Email" required />
                    <v-text-field v-model="loginForm.password" label="Password" type="password" required />
                    <v-btn color="primary" type="submit">Login</v-btn>
                  </v-form>
                </v-window-item>
                <v-window-item value="register">
                  <v-form @submit.prevent="register">
                    <v-text-field v-model="registerForm.email" label="Email" required />
                    <v-text-field v-model="registerForm.password" label="Password" type="password" required />
                    <v-btn color="primary" type="submit">Register</v-btn>
                  </v-form>
                </v-window-item>
              </v-window>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useNuxtApp } from '#app'

const { $directus } = useNuxtApp()

const user = ref(null)
const tab = ref('login')
const loginForm = ref({ email: '', password: '' })
const registerForm = ref({ email: '', password: '' })

async function login() {
  try {
    const res = await $directus.auth.login({
      email: loginForm.value.email,
      password: loginForm.value.password
    })
    user.value = res.user
  } catch (e) {
    alert('Login failed')
  }
}

async function register() {
  try {
    await $directus.users.createOne({
      email: registerForm.value.email,
      password: registerForm.value.password
    })
    tab.value = 'login'
    alert('Registration successful! Please log in.')
  } catch (e) {
    alert('Registration failed')
  }
}

async function logout() {
  try {
    await $directus.auth.logout()
    user.value = null
  } catch (e) {}
}

// Check if already logged in
$directus.auth.me().then(res => {
  user.value = res
}).catch(() => {
  user.value = null
})
</script>
