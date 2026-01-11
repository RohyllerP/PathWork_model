<script setup>
useHead({
  title: 'PatchWork | Conversión de Archivos',
  meta: [
    { name: 'description', content: 'Plataforma de conversión de imágenes, PDFs, audio y video.' },
    { name: 'keywords', content: 'convertir archivos, pdf, imagenes, audio, video, nuxt' },
    { name: 'author', content: 'Rohyller' },

    // Open Graph (Facebook, WhatsApp, etc.)
    { property: 'og:title', content: 'PatchWork - Conversión de Archivos' },
    { property: 'og:description', content: 'Convierte imágenes y PDFs desde una interfaz moderna. Proyecto open-source.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://path-work-model.vercel.app/' },
    { property: 'og:image', content: 'https://path-work-model.vercel.app/public/recortar_audio.png' },

    // Twitter
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'PatchWork - Conversión de Archivos' },
    { name: 'twitter:description', content: 'Herramienta open-source para conversiones de archivos.' },
    { name: 'twitter:image', content: 'https://path-work-model.vercel.app/public/recortar_audio.png' }
  ]
})
</script>
<template>
  <div class="layout">
    <!-- HEADER -->
    <header class="header">
      <div class="container header-content">
        <h1 class="logo">PatchWork</h1>

        <nav class="nav">
          <NuxtLink to="/" class="more-link">Herramientas</NuxtLink>
          <a href="/about">Sobre</a>
        </nav>
      </div>
    </header>

    <!-- BODY -->
    <main class="main container">
      <NuxtPage />
    </main>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="container">
        <p>© 2026 PatchWork — Herramientas simples para archivos</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 16px;
}

/* HEADER */
.header {
  background-color: var(--primary);
  color: white;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.logo {
  font-size: 20px;
  font-weight: 700;
}

.nav a {
  margin-left: 20px;
  font-size: 14px;
  opacity: 0.9;
}

.nav a:hover {
  opacity: 1;
}

/* MAIN */
.main {
  flex: 1;
  padding: 48px 0;
}

/* FOOTER */
.footer {
  background-color: #E9EEF3;
  padding: 20px 0;
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
}
</style>
