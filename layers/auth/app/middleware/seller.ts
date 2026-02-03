import { defineNuxtRouteMiddleware } from "nuxt/app";

export default defineNuxtRouteMiddleware((to) => {
  if (to.path.startsWith('/dashboard/')) {
    // seller check here
  }
})
