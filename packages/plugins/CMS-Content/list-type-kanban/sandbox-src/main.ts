import { createApp } from 'vue'
import '@svar-ui/vue-kanban/all.css'
// SVAR's icon font, served from this folder: the sandbox CSP blocks its CDN.
import './fonts/wx-icons.css'
import App from './App.vue'

createApp(App).mount('#app')
