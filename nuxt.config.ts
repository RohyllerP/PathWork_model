export default defineNuxtConfig({
  typescript: {
    tsConfig: {
      compilerOptions: {
        types: ['node']
      }
    }
  },
  runtimeConfig: {
    apiSecretKey: process.env.FULL_API_TOKEN,
    public: {
      APP_MODE: process.env.NUXT_APP_MODE,
      apiSecretKey: process.env.FULL_API_TOKEN
    }
  },
  css: ['~/assets/css/main.css'],
})