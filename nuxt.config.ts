export default defineNuxtConfig({
  typescript: {
    tsConfig: {
      compilerOptions: {
        types: ['node']
      }
    }
  },
  css: ['~/assets/css/main.css'],
})