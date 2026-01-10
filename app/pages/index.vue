<script setup>
useHead({
  title: 'Inicio | PatchWork'
})
</script>
<template>
  <section class="home">
    <h2>Herramientas para trabajar con archivos</h2>
    <p class="subtitle">
      Convierte, une y divide archivos de forma rápida y sencilla.
    </p>

    <div class="tools">
      <div class="tool-card">
       <NuxtLink to="/tools/img/jpg-to-png" class="more-link">
        <h3>JPG → PNG</h3>
       </NuxtLink>
        <p>Convierte imágenes sin perder calidad.</p>
      </div>

      <div class="tool-card">
        <NuxtLink to="/tools/pdf/pdf-merge" class="more-link">
        <h3> Unir PDFs </h3>
        </NuxtLink>
        <p>Combina varios PDFs en uno solo.</p>
      </div>

      <div class="tool-card">
        <NuxtLink to="/tools/pdf/pdf-split" class="more-link">
          <h3>Dividir PDFs</h3>
        </NuxtLink>
        <p>Extrae páginas específicas fácilmente.</p>
      </div>
      <div class="tool-card more">
        <h3>Más opciones</h3>
        <p>Explora todas las herramientas disponibles.</p>
        <NuxtLink to="/tools" class="more-link">
          Ver todas →
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home {
  text-align: center;
}

.home h2 {
  font-size: 32px;
  margin-bottom: 12px;
}

.subtitle {
  color: var(--text-muted);
  margin-bottom: 40px;
}

.tools {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}

.tool-card {
  background-color: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 24px;
  text-align: left;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.tool-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
}

.tool-card h3 {
  margin: 0 0 8px;
  color: var(--primary);
}
.more {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.more-link {
  margin-top: 16px;
  font-weight: 600;
  color: var(--primary);
}

</style>
