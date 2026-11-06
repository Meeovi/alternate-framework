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

          <NuxtTurnstile v-if="captchaEnabled" ref="captchaWidget" v-model="captchaToken" class="mb-2" />
          <v-alert v-if="captchaBlocked" type="warning" variant="tonal" density="compact" class="mb-3">
            The security check didn't load, so Sign In stays off. If you use an ad or privacy blocker,
            allow challenges.cloudflare.com for this site, then
            <a href="#" class="font-weight-medium" @click.prevent="retryCaptcha">try again</a>.
          </v-alert>

          <v-btn type="submit" block color="primary" :disabled="loading || captchaMissing" :loading="loading" size="large" class="mb-4">
            {{ redirecting ? 'Redirecting…' : (loading ? 'Signing in...' : 'Sign In') }}
          </v-btn>
        </v-form>

        <div class="d-flex align-center my-4">
          <v-divider />
          <span class="mx-3 text-medium-emphasis">OR</span>
          <v-divider />
        </div>

        <div class="auth-buttons mb-2">
          <v-btn block variant="outlined" prepend-icon="fas fa-fingerprint" class="mb-3"
            :disabled="loading || !!passwordless" :loading="passwordless === 'passkey'" @click="signInWithPasskey">
            Sign in with a passkey
          </v-btn>
          <!-- Uses the Email field; behind the same Turnstile check as the password sign-in. -->
          <v-btn block variant="outlined" prepend-icon="fas fa-envelope" class="mb-3"
            :disabled="loading || !!passwordless || captchaMissing" :loading="passwordless === 'link'" @click="sendSignInLink">
            Email me a sign-in link
          </v-btn>
          <!-- Bluesky (any PDS) through AT Protocol OAuth; only where the site includes Bluesky. -->
          <template v-if="hasBluesky">
            <v-btn v-if="!showBluesky" block variant="outlined" prepend-icon="fab fa-bluesky" class="mb-3"
              :disabled="loading || !!passwordless" @click="showBluesky = true">
              Sign in with Bluesky
            </v-btn>
            <BlueskyOAuth v-else class="mb-3" :callbackURL="redirectTarget" />
          </template>
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
    computed,
    onMounted,
    ref,
    useHead,
    useRoute,
    useRuntimeConfig
  } from '#imports';
  import { useSupportedSocialProviders } from '../composables/plugins/useSupportSocialProviders';
  import BlueskyOAuth from '../components/features/plugins/BlueskyOAuth.vue';
  import { authClient } from "../../lib/auth-client"
  import { safeRedirectPath } from '../utils/safeRedirectPath'

  const route = useRoute();
  const { providers: socialProviders, load: loadSocialProviders } = useSupportedSocialProviders();
  const lastMethod = authClient.getLastUsedLoginMethod();

  const redirectTarget = computed(() => safeRedirectPath(route.query.redirect));

  const form = ref(null);
  const email = ref("");
  const password = ref("");
  const loading = ref(false);
  // Separate from `loading`: sign-in itself is already done at this point,
  // we're just waiting on navigateTo() to finish loading the destination
  // page. Distinct label + the layout's <NuxtLoadingIndicator> together
  // give the user feedback for that whole wait instead of the page just
  // appearing to hang after the "Signing in..." spinner already stopped.
  const redirecting = ref(false);
  // Password sign-in is behind Turnstile (server: captcha endpoints in
  // shared/utils/plugins.ts).
  const { captchaEnabled, captchaToken, captchaWidget, captchaMissing, captchaFetchOptions, resetCaptcha, captchaBlocked, retryCaptcha } = useAuthCaptcha();
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
    if (route.query.verified) {
      alertType.value = 'success';
      alertMessage.value = 'Your email address is verified. Sign in to continue.';
    }
    // Bluesky OAuth that didn't finish lands back here (meeovi-atproto auth/plugin.ts).
    const blueskyErrors = {
      bluesky_denied: 'Bluesky sign-in was cancelled.',
      bluesky_failed: "Bluesky sign-in didn't finish. Please try again.",
      bluesky_linked_elsewhere: 'That Bluesky account is already connected to another Meeovi account.',
    };
    if (blueskyErrors[route.query.error]) {
      alertType.value = 'error';
      alertMessage.value = blueskyErrors[route.query.error];
      showBluesky.value = true;
    }
    // A magic link that failed (expired, already used) lands back here.
    if (route.query.error === 'magic-link') {
      alertType.value = 'error';
      alertMessage.value = 'That sign-in link has expired or was already used. Send yourself a new one.';
    }
  });

  // "Sign in with Bluesky": the atproto module puts its settings in public config.
  const hasBluesky = Boolean(useRuntimeConfig().public?.atproto);
  const showBluesky = ref(false);

  // Password-free sign-in in progress: 'passkey' | 'link' | ''.
  const passwordless = ref('');

  async function signInWithPasskey() {
    if (loading.value || passwordless.value) return;
    alertMessage.value = '';
    passwordless.value = 'passkey';
    try {
      const { data, error } = await authClient.signIn.passkey();
      if (error) {
        // The passkey client reports every failure (a cancelled prompt, no
        // passkey for this site, …) as "auth cancelled", so the message
        // covers both.
        alertType.value = 'info';
        alertMessage.value = "Passkey sign-in didn't finish. If you haven't added a passkey yet, sign in another way, then add one under Workspace → Settings → Accounts.";
        return;
      }
      alertType.value = 'success';
      alertMessage.value = "You're signed in — redirecting you now…";
      redirecting.value = true;
      if (data?.redirect && data?.url) {
        window.location.href = data.url;
        return;
      }
      await navigateTo(redirectTarget.value);
    } catch (err) {
      alertType.value = 'error';
      alertMessage.value = 'Passkey sign-in failed. Please try again.';
      console.error('Passkey sign in error:', err);
    } finally {
      passwordless.value = '';
      redirecting.value = false;
    }
  }

  async function sendSignInLink() {
    if (loading.value || passwordless.value) return;
    alertMessage.value = '';
    if (!/.+@.+\..+/.test(email.value)) {
      alertType.value = 'info';
      alertMessage.value = 'Enter your email address in the Email field, then choose "Email me a sign-in link".';
      return;
    }
    passwordless.value = 'link';
    try {
      const { error } = await authClient.signIn.magicLink({
        email: email.value,
        callbackURL: redirectTarget.value,
        errorCallbackURL: '/login?error=magic-link',
      }, captchaFetchOptions());
      if (error) {
        alertType.value = 'error';
        alertMessage.value = error.message || "We couldn't send a sign-in link. Please try again.";
      } else {
        // The same answer whether or not the address has an account.
        alertType.value = 'success';
        alertMessage.value = `If ${email.value} has a Meeovi account, a sign-in link is on its way. It works once and expires soon.`;
      }
    } catch (err) {
      alertType.value = 'error';
      alertMessage.value = "We couldn't send a sign-in link. Please try again.";
      console.error('Magic link error:', err);
    } finally {
      passwordless.value = '';
      // Turnstile tokens are single-use.
      resetCaptcha();
    }
  }

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
      // authClient (not the bare useAuth() client) carries the
      // oauthProviderClient plugin, which attaches the signed OAuth query
      // when this page was reached from an SSO authorize request (e.g.
      // "Log in with Meeovi" on Pixanomy).
      const {
        data,
        error
      } = await authClient.signIn.email({
        email: email.value,
        password: password.value,
        rememberMe: rememberMe.value,
      }, captchaFetchOptions());
      if (error) {
        const unverified = error.code === 'EMAIL_NOT_VERIFIED'
          || error.status === 403
          || /not verified|verify your email/i.test(error.message || '');
        alertType.value = "error";
        alertMessage.value = unverified
          ? "Your email isn't verified yet. We've sent a new verification link — check your inbox, then sign in."
          : error.message;
      } else if (data?.twoFactorRedirect) {
        // 2FA account: no session yet. twoFactorClient's onTwoFactorRedirect
        // (lib/auth-client.ts) is already taking the browser to /2fa.
        alertType.value = "info";
        alertMessage.value = "Password accepted — enter your verification code next.";
        redirecting.value = true;
        return;
      } else {
        alertType.value = "success";
        alertMessage.value = "You're signed in — redirecting you now…";
        redirecting.value = true;
        // SSO: the OAuth provider answers with the client's callback URL
        // (an external site), so follow it with a full navigation.
        if (data?.redirect && data?.url) {
          window.location.href = data.url;
          return;
        }
        await navigateTo(redirectTarget.value);
      }
    } catch (err) {
      alertType.value = "error";
      alertMessage.value = 'An error occurred during sign in';
      console.error('Sign in error:', err);
    } finally {
      loading.value = false;
      redirecting.value = false;
      // Turnstile tokens are single-use.
      resetCaptcha();
    }
  }

  const signInWithProvider = async (provider) => {
    if (loading.value) return;
    loading.value = true;
    alertMessage.value = '';
    try {
      const res = await authClient.signIn.social({ provider, callbackURL: redirectTarget.value });
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

// The app's nuxt.config sets titleTemplate '%s - <site name>', so this is
// just the page part — no site name here or it doubles ("Sign In - X - X").
useHead({
  title: 'Sign In',
})
</script>