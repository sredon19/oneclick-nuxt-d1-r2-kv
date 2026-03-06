// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-01-15',
  devtools: { enabled: true },

  modules: ['@nuxt/eslint', 'nitro-cloudflare-dev'],

  // Nitro configuration for Cloudflare Workers deployment
  nitro: {
    preset: 'cloudflare-module',
  },

  runtimeConfig: {
    betterAuthSecret: '',
    betterAuthUrl: '',
    googleClientId: '',
    googleClientSecret: '',
  },
})
