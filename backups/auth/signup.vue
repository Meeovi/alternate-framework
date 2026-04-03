<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="6" md="4">
        <v-card>
          <v-card-title>Create an account</v-card-title>
          <v-card-subtitle>
            Already have an account? <NuxtLink to="/auth/login">Login</NuxtLink>.
          </v-card-subtitle>
          <v-card-text>
            <v-form @submit.prevent="onSubmit">
              <v-text-field
                v-model="name"
                label="Name"
                type="text"
                required
                :error-messages="nameError"
              />
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                required
                :error-messages="emailError"
              />
              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                required
                :error-messages="passwordError"
              />
              <v-btn
                :loading="loading"
                type="submit"
                block
                color="primary"
              >
                Create account
              </v-btn>
              <v-alert v-if="error" type="error" class="mt-2">
                {{ error }}
              </v-alert>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-card-text class="text-caption">
              By signing up, you agree to our <NuxtLink to="/">Terms of Service</NuxtLink>.
            </v-card-text>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Sign up',
  description: 'Create an account to get started'
})

const name = ref('')
const email = ref('')
const password = ref('')
const nameError = ref('')
const emailError = ref('')
const passwordError = ref('')

const { signup, loading, error } = useAuth()

const validateForm = () => {
  nameError.value = ''
  emailError.value = ''
  passwordError.value = ''
  
  let isValid = true
  
  if (!name.value || name.value.trim().length === 0) {
    nameError.value = 'Name is required'
    isValid = false
  }
  
  if (!email.value || !email.value.includes('@')) {
    emailError.value = 'Invalid email'
    isValid = false
  }
  
  if (!password.value || password.value.length < 8) {
    passwordError.value = 'Must be at least 8 characters'
    isValid = false
  }
  
  return isValid
}

const onSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  await signup({
    name: name.value,
    email: email.value,
    password: password.value
  })
}

	definePageMeta({
		layout: "auth",
	});
</script>
