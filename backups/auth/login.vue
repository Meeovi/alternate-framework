<template>
    <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
            <v-col cols="12" sm="6" md="4">
                <v-card>
                    <v-card-title>Login</v-card-title>
                    <v-card-subtitle>
                        Don't have an account? <NuxtLink to="/auth/signup">Sign up</NuxtLink>.
                    </v-card-subtitle>
                    <v-card-text>
                        <v-form @submit.prevent="onSubmit">
                            <v-text-field v-model="email" label="Email" type="email" required
                                :error-messages="emailError" />
                            <v-text-field v-model="password" label="Password" type="password" required
                                :error-messages="passwordError" />
                            <v-btn :loading="loading" type="submit" block color="primary">
                                Login
                            </v-btn>
                            <v-alert v-if="error" type="error" class="mt-2">
                                {{ error }}
                            </v-alert>
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-card-text class="text-caption">
                            By logging in, you agree to our <NuxtLink to="/terms">Terms of Service</NuxtLink>.
                        </v-card-text>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
    useSeoMeta({
        title: 'Login',
        description: 'Login to your account'
    })

    const email = ref('')
    const password = ref('')
    const emailError = ref('')
    const passwordError = ref('')

    const {
        login,
        loading,
        error
    } = useAuth()

    const validateForm = () => {
        emailError.value = ''
        passwordError.value = ''

        let isValid = true

        if (!email.value || !email.value.includes('@')) {
            emailError.value = 'Invalid email'
            isValid = false
        }

        if (!password.value || password.value.length < 1) {
            passwordError.value = 'Password is required'
            isValid = false
        }

        return isValid
    }

    const onSubmit = async () => {
        if (!validateForm()) {
            return
        }

        await login(email.value, password.value)
    }

    definePageMeta({
        layout: "auth",
    });
</script>