<template>
  <v-container class="d-flex align-center justify-center" style="min-height: 100vh">
    <v-card class="w-100" style="max-width: 400px">
      <v-card-title>Sign In</v-card-title>
      <v-card-subtitle>Enter your email below to login to your account</v-card-subtitle>

      <v-card-text>
        <v-form class="space-y-4">
          <v-text-field v-model="email" label="Email" type="email" placeholder="m@example.com" required
            variant="outlined" />

          <div class="d-flex justify-space-between align-center mb-2">
            <v-text-field v-model="password" label="Password" type="password" placeholder="Enter your password"
              autocomplete="password" required variant="outlined" class="grow" />
          </div>

          <NuxtLink :to="localePath('/forgot-password')" class="text-caption text-decoration-none">
            Forgot your password?
          </NuxtLink>

          <v-checkbox v-model="rememberMe" label="Remember me" />

          <v-btn type="submit" block color="primary" :disabled="loading" :loading="loading" size="large" @click="signIn"
            :text="loading ? 'Signing in...' : 'Sign In'" />
        </v-form>

        <div class="d-flex align-center my-4">
          <v-divider />
          <span class="mx-3 text-medium-emphasis">OR</span>
          <v-divider />
        </div>

        <div class="space-y-2">
          <v-btn block variant="outlined" :disabled="loading" @click="handlePasskey" color="indigo"
            prepend-icon="mdi-key" text="Sign in with Passkey" />

          <v-btn block variant="outlined" :disabled="loading" @click="auth.signIn.social({ provider: 'github', callbackURL: '/' })" color="green"
            prepend-icon="mdi-github" text="Sign in with GitHub" />

          <v-btn block variant="outlined" :disabled="loading" @click="auth.signIn.social({ provider: 'microsoft', callbackURL: '/' })" color="blue"
            prepend-icon="mdi-microsoft" text="Sign in with Microsoft" />

          <v-btn block variant="outlined" :disabled="loading" @click="auth.signIn.social({ provider: 'twitter', callbackURL: '/' })" color="light-blue"
            prepend-icon="mdi-twitter" text="Sign in with Twitter" />
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
  import {
    ref
  } from '#imports';
  import {
    useAuth
  } from '../composables/useAuth';
  import useAppLocalePath from '../utils/useAppLocalePath';
  import {
    useAlert
  } from '#shared/app/composables/useAlert';

  const auth = useAuth();
  const alert = useAlert();
  const localePath = useAppLocalePath();

  const email = ref("");
  const password = ref("");
  const loading = ref(false);
  const rememberMe = ref(false);

  async function signIn() {
    if (loading.value) return
    loading.value = true
    const {
      error
    } = await auth.signIn.email({
      email: email.value,
      password: password.value,
    })
    if (error) {
      alert.error(error.message);
    } else {
      await navigateTo('/')
      alert.success('You have been signed in!');
    }
    loading.value = false
  }

  const handlePasskey = async () => {
    alert.info('Passkey sign-in is not yet available.');
  };

  const handleSocialSignIn = async (provider) => {
    alert.info(`Sign in with ${provider} is not yet available.`);
  };
</script>