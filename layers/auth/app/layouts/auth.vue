<template>
  <v-app class="auth-app">
    <v-main class="auth-layout">
      <!-- Animated gradient background -->
      <div class="auth-background">
      <div class="gradient-sphere sphere-1"></div>
      <div class="gradient-sphere sphere-2"></div>
      <div class="gradient-sphere sphere-3"></div>
      <svg class="background-pattern" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
      </svg>
    </div>

      <!-- Content container -->
      <div class="auth-container">
        <!-- Left decorative section -->
        <div class="auth-left">
          <div class="brand-section">
            <div class="logo-placeholder">
              <v-icon size="64" color="white" icon="fas fa-shield"></v-icon>
            </div>
            <h1 class="brand-title">Welcome to {{ siteName }}</h1>
            <p class="brand-subtitle">{{ siteDescription }}</p>
          </div>

          <div class="features-list">
            <div class="feature-item">
              <v-icon size="24" color="rgba(255,255,255,0.9)" icon="fas fa-circle-check"></v-icon>
              <span>Fast & Secure Login</span>
            </div>
            <div class="feature-item">
              <v-icon size="24" color="rgba(255,255,255,0.9)" icon="fas fa-lock"></v-icon>
              <span>Enterprise Grade Security</span>
            </div>
            <div class="feature-item">
              <v-icon size="24" color="rgba(255,255,255,0.9)" icon="fas fa-shop"></v-icon>
              <span>Privacy First Social Marketplace</span>
            </div>
          </div>
        </div>

        <!-- Right form section -->
        <div class="auth-right">
          <div class="form-wrapper">
            <slot />
          </div>
        </div>
      </div>

    </v-main>
  </v-app>
</template>

<script setup>
const runtimeConfig = useRuntimeConfig()
const siteName = String(runtimeConfig.public?.siteName || runtimeConfig.public?.appName || 'Meeovi')
const siteDescription = String(
  runtimeConfig.public?.siteDescription ||
  'The Decentralized Social Shopping Network'
)
</script>