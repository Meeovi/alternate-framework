<template>
  <div class="max-w-md">
    <v-toolbar color="transparent">
      <v-toolbar-title class="text-xs md:text-sm">Sign In</v-toolbar-title>
      <v-toolbar-subtitle>
        Enter your email below to login to your account
      </v-toolbar-subtitle>
    </v-toolbar>

    <v-card>
      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required v-model="email" />
        </div>

        <div class="grid gap-2">
          <div class="flex items-center">
            <Label for="password">Password</Label>
            <NuxtLink to="#" class="ml-auto inline-block text-sm underline">
              Forgot your password?
            </NuxtLink>
          </div>

          <Input id="password" type="password" placeholder="password" autoComplete="password" v-model="password" />
        </div>
        <div class="flex items-center gap-2">
          <Checkbox id="remember" v-model="rememberMe" />
          <Label for="remember">Remember me</Label>
        </div>
        <v-btn type="submit" class="w-full" :disabled="loading" @click="handleSignIn">
          <Loader2 size="16" class="animate-spin" v-if="loading" />
          <p v-else>Login</p>
        </v-btn>
        <v-btn variant="secondary" :disabled="loading" class="gap-2" @click="handlePasskey">
          <Key size="16" />
          Sign-in with Passkey
        </v-btn>
        <div :class="cn(
					'w-full gap-2 flex items-center',
					'justify-between flex-col'
				)">
          <v-btn variant="outlined" :class="cn(
							'w-full gap-2'
						)" :disabled="loading" @click="handleSocialSignIn('github')">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
              <path fill="currentColor"
                d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2">
              </path>
            </svg>
            Sign in with Github
          </v-btn>
          <v-btn variant="outlined" :class="cn(
							'w-full gap-2'
						)" :disabled="loading" @click="handleSocialSignIn('microsoft')">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
              <path fill="#00A4EF" d="M2 3h9v9H2zm9 19H2v-9h9zM21 3v9h-9V3zm0 19h-9v-9h9z"></path>
            </svg>
            Sign in with Microsoft
          </v-btn>
          <v-btn variant="outlined" :class="cn(
							'w-full gap-2'
						)" :disabled="loading" @click="handleSocialSignIn('twitter')">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 448 512">
              <path fill="currentColor"
                d="M64 32C28.7 32 0 60.7 0 96v320c0 35.3 28.7 64 64 64h320c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64zm297.1 84L257.3 234.6L379.4 396h-95.6L209 298.1L123.3 396H75.8l111-126.9L69.7 116h98l67.7 89.5l78.2-89.5zm-37.8 251.6L153.4 142.9h-28.3l171.8 224.7h26.3z">
              </path>
            </svg>
            Sign in with Twitter
          </v-btn>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script setup>
  import {
    ref
  } from '#imports';
  import { useAuth } from "../composables/useAuth";

  const { signIn } = useAuth();

  const email = ref("");
  const password = ref("");
  const loading = ref(false);
  const rememberMe = ref(false);
  const toast = useToast();
  
  // simple classnames helper used in the template
  const cn = (...classes) =>
    classes.filter(Boolean).join(" ");

  const handleSignIn = async () => {
    await signIn.email({
      email: email.value,
      password: password.value,
      rememberMe: rememberMe.value,
      fetchOptions: {
        onRequest: () => {
          loading.value = true;
        },
        onResponse: () => {
          loading.value = false;
        },
      },
    });
  };

  const handlePasskey = async () => {
    await signIn.passkey({
      fetchOptions: {
        onRequest: () => {
          loading.value = true;
        },
        onResponse: () => {
          loading.value = false;
        },
      },
    });
  };

  const handleSocialSignIn = async (provider) => {
    await signIn.social({
      provider,
      callbackURL: "/",
      fetchOptions: {
        onRequest: () => {
          loading.value = true;
        },
        onResponse: () => {
          loading.value = false;
        },
      },
    });
  }
</script>