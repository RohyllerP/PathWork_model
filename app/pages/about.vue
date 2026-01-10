<script setup>
useHead({
  title: 'Acerca de | PatchWork'
})
</script>

<template>
  <section class="about-page">
    <div class="container">
      <h1>Acerca de PatchWork: Imágenes y PDFs</h1>

      <p class="intro">
        Este proyecto es una versión especializada de PatchWork que permite trabajar únicamente
        con <strong>imágenes y archivos PDF</strong>.  
        Está diseñado para mostrar las principales funcionalidades de carga, previsualización,
        edición y descarga de estos archivos de manera rápida y sencilla.
      </p>

      <!-- Paso a Paso -->
      <div class="steps">
        <h2>Instalación y uso paso a paso</h2>
        <ol>
          <li>
            <strong>Clona el repositorio:</strong>
            Descarga el proyecto desde GitHub y accede a la carpeta del proyecto.
          </li>
          <li>
            <strong>Instala las dependencias:</strong>
            Ejecuta <code>npm install</code>.  
            Todas las librerías utilizadas están listadas en <code>package.json</code>.
          </li>
          <li>
            <strong>Ejecuta el proyecto:</strong>
            Inicia el servidor con <code>npm run dev</code> y abre el navegador en la URL indicada.
          </li>
          <li>
            <strong>Utiliza las herramientas:</strong>
            Accede a las secciones de imágenes y PDFs para cargar archivos, generar
            previsualizaciones, editar páginas y descargar los resultados.
          </li>
        </ol>
      </div>

      <!-- Librerías -->
      <div class="examples">
        <h2>Librerías principales utilizadas</h2>
        <ul>
          <li><strong>pdf-lib / pdfjs-dist:</strong> Creación, edición y visualización de PDFs.</li>
          <li><strong>sharp:</strong> Procesamiento y optimización de imágenes.</li>
          <li><strong>jszip:</strong> Compresión y descarga de múltiples archivos.</li>
          <li><strong>sortablejs / vuedraggable:</strong> Ordenamiento dinámico de archivos.</li>
          <li><strong>formidable:</strong> Manejo de subida de archivos en el backend.</li>
        </ul>

        <p>
          Para funcionalidades de audio o video, se recomienda consultar la versión completa
          de PatchWork, donde también se incluyen esas capacidades.
        </p>
      </div>

      <!-- Arquitectura -->
      <div class="examples">
        <h2>Arquitectura y extensibilidad</h2>
        <p>
          Este proyecto mantiene la misma filosofía de componentes reutilizables y separación
          clara entre frontend y backend, lo que permite:
        </p>
        <ul>
          <li>Adaptar rápidamente la lógica a nuevos tipos de archivos en el futuro.</li>
          <li>Reutilizar componentes de carga, ordenamiento y previsualización de imágenes y PDFs.</li>
          <li>Agregar nuevas funciones sin modificar la base existente.</li>
          <li>Probar y mostrar acciones concretas sobre imágenes y PDFs de forma aislada.</li>
        </ul>
        <a href="https://github.com/RohyllerP/Pathwork_full" target="_blank" class="more-link">Ir a PatchWork FULL</a>
      </div>

      <!-- Nota -->
      <div class="examples">
        <p class="note">
          ⚠️ Nota: Este proyecto está pensado para ejecutarse en entornos locales o servidores
          que permitan el manejo de binarios y procesos del sistema (como Sharp para imágenes).  
          Algunas funciones avanzadas de PDF podrían no estar disponibles en hosting compartido.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.more-link {
  display: inline-block;
  margin-top: 15px;
  color: var(--primary);
  text-decoration: underline;
  font-weight: 600;
}
.about-page {
  padding: 50px 20px;
  background-color: var(--bg);
  color: var(--text-main);
  min-height: 100vh;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  background-color: var(--card);
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.1);
}

h1 {
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 20px;
  color: var(--primary);
}

.intro {
  font-size: 16px;
  color: var(--text-muted);
  text-align: center;
  margin-bottom: 40px;
}

.steps h2, .examples h2 {
  font-size: 22px;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 15px;
}

.steps ol {
  padding-left: 20px;
  margin-bottom: 40px;
}

.steps li {
  margin-bottom: 15px;
  font-size: 16px;
  line-height: 1.6;
}

.examples ul {
  list-style: disc;
  padding-left: 20px;
  margin-bottom: 20px;
}

.examples li {
  margin-bottom: 10px;
  font-size: 16px;
}

.note {
  font-size: 15.5px;
  color: #dc3545;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 640px) {
  .container {
    padding: 20px;
  }

  h1 {
    font-size: 26px;
  }

  .steps h2, .examples h2 {
    font-size: 20px;
  }
}
</style>
