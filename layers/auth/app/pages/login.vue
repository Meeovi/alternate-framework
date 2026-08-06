<template>
  <div class="login-form">
    <v-card class="login-card" elevation="0">
      <v-card-title class="pb-2">
        <h2 class="text-h5 font-weight-600">Sign In</h2>
      </v-card-title>
      <v-card-subtitle class="pb-4">Enter your email and password to continue</v-card-subtitle>

      <v-card-text class="pt-4">
        <!-- Vuetify Alert Component -->
        <v-alert
          v-if="alertMessage"
          :type="alertType"
          variant="tonal"
          closable
          class="mb-4"
          @click:close="alertMessage = ''"
        >
          {{ alertMessage }}
        </v-alert>

        <v-form ref="form" class="login-form-content" @submit.prevent="signIn">
          <v-text-field v-model="email" label="Email" type="email" placeholder="you@example.com" required
            autocomplete="email" variant="outlined" :rules="emailRules" class="mb-4" />

          <v-text-field v-model="password" label="Password" type="password" placeholder="Enter your password"
            autocomplete="current-password" required variant="outlined" :rules="passwordRules" class="mb-4" />

          <div class="d-flex justify-space-between align-center mb-4">
            <v-checkbox v-model="rememberMe" label="Remember Me" density="compact" class="my-0 loginCheckbox" />
            <NuxtLink to="/forgot-password" class="text-caption text-decoration-none text-primary">
              Forgot password?
            </NuxtLink>
          </div>

          <v-btn type="submit" block color="primary" :disabled="loading" :loading="loading" size="large" class="mb-4">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </v-btn>
        </v-form>

        <div v-if="socialProviders.length > 0" class="d-flex align-center my-4">
          <v-divider />
          <span class="mx-3 text-medium-emphasis">OR</span>
          <v-divider />
        </div>

        <div v-if="socialProviders.length > 0" class="auth-buttons">
          <v-btn
            v-for="provider in socialProviders"
            :key="provider.id"
            block
            :title="lastMethod === provider.id ? `Continue with ${provider.label}` : `Sign in with ${provider.label}`"
            :text="`Sign in with ${provider.label}`"
            variant="outlined"
            :disabled="loading"
            :color="provider.color"
            :prepend-icon="provider.icon"
            @click="signInWithProvider(provider.id)">
          </v-btn>
        </div>

        <div class="mt-6 text-center">
          <span class="text-caption">Don't have an account?</span>
          <NuxtLink to="/register" class="text-caption text-decoration-none text-primary font-weight-medium">
            Sign Up
          </NuxtLink>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
  definePageMeta({
    layout: 'auth',
  })

  import {
    onMounted,
    ref,
    useHead,
    useRuntimeConfig
  } from '#imports';
  import {
    useAuth
  } from '../composables/useAuth';
  import { useSupportedSocialProviders } from '../composables/plugins/useSupportSocialProviders';
  import { authClient } from "../../lib/auth-client"

  const auth = useAuth();
  const runtimeConfig = useRuntimeConfig();
  const { providers: socialProviders, load: loadSocialProviders } = useSupportedSocialProviders();
  const lastMethod = authClient.getLastUsedLoginMethod();

  const form = ref(null);
  const email = ref("");
  const password = ref("");
  const loading = ref(false);
  const rememberMe = ref(false);

  // Alert local states
  const alertMessage = ref("");
  const alertType = ref("error"); // 'error' or 'success'

  const emailRules = [
    (v) => !!v || 'Email is required',
    (v) => /.+@.+\..+/.test(v) || 'Email must be valid',
  ];

  const passwordRules = [
    (v) => !!v || 'Password is required',
    (v) => v.length >= 6 || 'Password must be at least 6 characters',
  ];

  onMounted(() => {
    void loadSocialProviders();
  });

  async function signIn() {
    if (loading.value) return;
    alertMessage.value = ""; // Reset alert on new attempt

    const validationResult = await form.value?.validate?.();
    const valid = typeof validationResult === 'object'
      ? Boolean(validationResult?.valid)
      : validationResult !== false;
    if (!valid) return;

    loading.value = true;
    try {
      const {
        error
      } = await auth.signIn.email({
        email: email.value,
        password: password.value,
        rememberMe: rememberMe.value,
      });
      if (error) {
        alertType.value = "error";
        alertMessage.value = error.message;
      } else {
        await auth.fetchSession();
        alertType.value = "success";
        alertMessage.value = 'You have been signed in!';
        await navigateTo('/');
      }
    } catch (err) {
      alertType.value = "error";
      alertMessage.value = 'An error occurred during sign in';
      console.error('Sign in error:', err);
    } finally {
      loading.value = false;
    }
  }

  const signInWithProvider = async (provider) => {
    if (loading.value) return;
    loading.value = true;
    alertMessage.value = '';
    try {
      const res = await auth.signIn.social({ provider, callbackURL: '/' });
      if (res?.error) {
        alertType.value = 'error';
        alertMessage.value = res.error.message || `Failed to sign in with ${provider}`;
      }
      // On success the Better-Auth redirect plugin performs window.location.href
      // to the OAuth provider automatically when res.data.redirect === true.
    } catch (err) {
      alertType.value = 'error';
      alertMessage.value = err?.message || `Failed to sign in with ${provider}`;
      console.error('Social sign in error:', err);
    } finally {
      loading.value = false;
    }
  };

useHead({
  title: `Sign In - ${String(runtimeConfig.public?.siteName || runtimeConfig.public?.appName || 'Meeovi')}`,
})
</script>