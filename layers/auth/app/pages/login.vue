<template>
  <div class="login-form">
    <v-card class="login-card" elevation="0">
      <v-card-title class="pb-2">
        <h2 class="text-h5 font-weight-600">Sign In</h2>
      </v-card-title>
      <v-card-subtitle class="pb-4">Enter your email and password to continue</v-card-subtitle>

      <v-card-text class="pt-4">
        <v-form ref="form" class="login-form-content" @submit.prevent="signIn">
          <v-text-field v-model="email" label="Email" type="email" placeholder="you@example.com" required
            variant="outlined" :rules="emailRules" class="mb-4" />

          <v-text-field v-model="password" label="Password" type="password" placeholder="Enter your password"
            autocomplete="current-password" required variant="outlined" :rules="passwordRules" class="mb-4" />

          <div class="d-flex justify-space-between align-center mb-4">
            <v-checkbox v-model="rememberMe" label="Remember Me" density="compact" class="my-0 loginCheckbox" />
            <NuxtLink :to="localePath('/forgot-password')" class="text-caption text-decoration-none text-primary">
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
            variant="outlined"
            :disabled="loading"
            :color="provider.color"
            :prepend-icon="provider.icon"
            @click="signInWithProvider(provider.id)">
            Sign in with {{ provider.label }}
          </v-btn>
        </div>

        <div class="mt-6 text-center">
          <span class="text-caption">Don't have an account?</span>
          <NuxtLink :to="localePath('/register')" class="text-caption text-decoration-none text-primary font-weight-medium">
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
  import { useSupportedSocialProviders } from '../composables/useSupportedSocialProviders';
  import useAppLocalePath from '../utils/useAppLocalePath';
  import {
    useAlert
  } from '#shared/app/composables/useAlert';

  const auth = useAuth();
  const alert = useAlert();
  const localePath = useAppLocalePath();
  const runtimeConfig = useRuntimeConfig();
  const { providers: socialProviders, load: loadSocialProviders } = useSupportedSocialProviders();

  const form = ref(null);
  const email = ref("");
  const password = ref("");
  const loading = ref(false);
  const rememberMe = ref(false);

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
        alert.error(error.message);
      } else {
        await auth.fetchSession();
        alert.success('You have been signed in!');
        await navigateTo('/');
      }
    } catch (err) {
      alert.error('An error occurred during sign in');
      console.error('Sign in error:', err);
    } finally {
      loading.value = false;
    }
  }

  const signInWithProvider = async (provider) => {
    if (loading.value) return;
    await auth.signIn.social({ provider, callbackURL: '/' });
  };

useHead({
  title: `Sign In - ${String(runtimeConfig.public?.siteName || runtimeConfig.public?.appName || 'Meeovi')}`,
})
</script>