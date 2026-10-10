<script setup lang="ts">
import type { NuxtError } from '#app'
import errorBg from '~/assets/images/maintenance/img-error-bg.svg'
import errorBlue from '~/assets/images/maintenance/img-error-blue.svg'
import errorText from '~/assets/images/maintenance/img-error-text.svg'
import errorPurple from '~/assets/images/maintenance/img-error-purple.svg'

const props = defineProps<{ error: NuxtError }>()

const themeName = useWorkspaceTheme()
const notFound = computed(() => props.error?.statusCode === 404)

useHead({ title: notFound.value ? 'Page not found' : 'Error' })
</script>

<template>
  <v-app :theme="themeName">
    <v-row no-gutters class="h-screen">
      <v-col class="d-flex align-center justify-center">
        <div class="text-center">
          <div class="CardMediaWrapper">
            <img :src="errorBg" alt="grid" class="w-100">
            <img :src="errorBlue" alt="grid" class="CardMediaParts">
            <img :src="errorText" alt="build" class="CardMediaBuild">
            <img :src="errorPurple" alt="build" class="CardMediaBuild">
          </div>
          <h1 class="text-h1">Something is wrong</h1>
          <p v-if="notFound">
            <small>The page you are looking was moved, removed, <br>renamed, or might never exist! </small>
          </p>
          <p v-else>
            <small>{{ error?.statusMessage || error?.message || 'An unexpected error occurred.' }}</small>
          </p>
          <v-btn variant="flat" color="primary" class="mt-4" prepend-icon="fas fa-house" @click="clearError({ redirect: '/' })">
            Home
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-app>
</template>

<style>
.CardMediaWrapper {
  max-width: 720px;
  margin: 0 auto;
  position: relative;
}
.CardMediaBuild {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  animation: 5s bounce ease-in-out infinite;
}
.CardMediaParts {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  animation: 10s blink ease-in-out infinite;
}
.text-h1 {
  font-size: 2.125rem !important;
  font-weight: 700;
  line-height: 3.5rem;
}
@keyframes blink {
  50% { opacity: 0; }
  100% { opacity: 1; }
}
@keyframes bounce {
  0%, 20%, 53%, to {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translateZ(0);
  }
  40%, 43% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -5px, 0);
  }
  70% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -7px, 0);
  }
  80% {
    transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translateZ(0);
  }
  90% { transform: translate3d(0, -2px, 0); }
}
</style>
