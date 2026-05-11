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
              <v-icon size="64" color="white">mdi-shield-account</v-icon>
            </div>
            <h1 class="brand-title">Welcome to {{ siteName }}</h1>
            <p class="brand-subtitle">{{ siteDescription }}</p>
          </div>

          <div class="features-list">
            <div class="feature-item">
              <v-icon size="24" color="rgba(255,255,255,0.9)">mdi-check-circle</v-icon>
              <span>Fast & Secure Login</span>
            </div>
            <div class="feature-item">
              <v-icon size="24" color="rgba(255,255,255,0.9)">mdi-lock</v-icon>
              <span>Enterprise Grade Security</span>
            </div>
            <div class="feature-item">
              <v-icon size="24" color="rgba(255,255,255,0.9)">mdi-devices</v-icon>
              <span>Multi-Device Support</span>
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

<style scoped>
.auth-app {
  background: transparent;
}

.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica',
    'Arial', sans-serif;
}

/* Background gradient and effects */
.auth-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #667eea 100%);
  background-size: 400% 400%;
  animation: gradient-shift 15s ease infinite;
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.gradient-sphere {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.3;
}

.sphere-1 {
  width: 300px;
  height: 300px;
  background: rgba(255, 182, 193, 0.4);
  top: -100px;
  left: -100px;
  animation: float 20s infinite ease-in-out;
}

.sphere-2 {
  width: 400px;
  height: 400px;
  background: rgba(135, 206, 235, 0.3);
  top: 50%;
  right: -150px;
  animation: float 25s infinite ease-in-out 2s;
}

.sphere-3 {
  width: 250px;
  height: 250px;
  background: rgba(255, 215, 0, 0.2);
  bottom: -50px;
  left: 50%;
  animation: float 22s infinite ease-in-out 4s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(30px, -30px); }
  50% { transform: translate(-20px, 20px); }
  75% { transform: translate(20px, 30px); }
}

.background-pattern {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.1;
}

/* Main container */
.auth-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  max-width: 1000px;
  width: 90%;
  height: 600px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 10;
}

/* Left section */
.auth-left {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.auth-left::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23ffffff" fill-opacity="0.05"><path d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/></g></g></svg>');
  pointer-events: none;
}

.brand-section {
  position: relative;
  z-index: 1;
}

.logo-placeholder {
  margin-bottom: 24px;
  background: rgba(255, 255, 255, 0.2);
  width: 80px;
  height: 80px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.brand-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 12px 0;
  letter-spacing: -0.5px;
}

.brand-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  z-index: 1;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  opacity: 0.95;
}

.feature-item :deep(.v-icon) {
  flex-shrink: 0;
}

/* Right section */
.auth-right {
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafbfc;
  overflow-y: auto;
}

.form-wrapper {
  width: 100%;
  max-width: 100%;
}

/* Responsive design */
@media (max-width: 900px) {
  .auth-container {
    grid-template-columns: 1fr;
    height: auto;
  }

  .auth-left {
    padding: 40px;
    min-height: 300px;
  }

  .auth-right {
    padding: 40px 30px;
  }

  .brand-title {
    font-size: 28px;
  }

  .features-list {
    gap: 16px;
  }
}

@media (max-width: 600px) {
  .auth-container {
    width: 95%;
    border-radius: 16px;
  }

  .auth-left {
    padding: 30px;
    min-height: 250px;
  }

  .auth-right {
    padding: 30px 20px;
  }

  .logo-placeholder {
    width: 60px;
    height: 60px;
  }

  .brand-title {
    font-size: 24px;
  }

  .brand-subtitle {
    font-size: 14px;
  }

  .feature-item {
    font-size: 13px;
  }

  .sphere-1 {
    width: 200px;
    height: 200px;
  }

  .sphere-2 {
    width: 250px;
    height: 250px;
  }

  .sphere-3 {
    width: 150px;
    height: 150px;
  }
}
</style>
