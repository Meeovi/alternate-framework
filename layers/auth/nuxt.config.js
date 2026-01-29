import { defineNuxtConfig } from 'nuxt/config';
export default defineNuxtConfig({
    $meta: {
        name: 'auth',
    },
    runtimeConfig: {
        auth: {
            redirect: {
                login: '/login',
                home: '/'
            }
        }
    }
});
