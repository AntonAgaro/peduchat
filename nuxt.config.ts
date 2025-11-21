// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    process.env.APP_ENV === 'dev' ? '@nuxt/eslint' : '',
    '@nuxt/ui',
    process.env.APP_ENV === 'dev' ? '@nuxt/test-utils' : '',
  ],
  css: ['~/assets/css/main.css'],
});
