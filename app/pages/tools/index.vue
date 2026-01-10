<script setup>
import { ref } from 'vue'
useHead({
  title: 'Herramientas | PatchWork'
})
const categories = ref([
  {
    id: 'images',
    name: 'Herramientas de Imágenes',
    icon: '🖼️',
    tools: [
      { name: 'JPG a PNG', route: '/tools/img/jpg-to-png', icon: '🔄', description: 'Convierte imágenes JPG a PNG' },
      { name: 'PNG a JPG', route: '/tools/img/png-to-jpg', icon: '🔄', description: 'Convierte imágenes PNG a JPG' },
      { name: 'WEBP a PNG', route: '/tools/img/webp-to-png', icon: '🔄', description: 'Convierte imágenes WEBP a PNG' },
      { name: 'WEBP a JPG', route: '/tools/img/webp-to-jpg', icon: '🔄', description: 'Convierte imágenes WEBP a JPG' },
      { name: 'PNG a ICO', route: '/tools/img/png-to-ico', icon: '🔄', description: 'Convierte imágenes PNG a ICO' },
      { name: 'JPG A TIFF', route: '/tools/img/jpg-to-tiff', icon: '🔄', description: 'Convierte imágenes JPG a TIFF' },
      { name: 'TIFF A JPG', route: '/tools/img/tiff-to-jpg', icon: '🔄', description: 'Convierte imágenes TIFF a JPG' },
      { name: 'TIFF A PNG', route: '/tools/img/tiff-to-png', icon: '🔄', description: 'Convierte imágenes TIFF a PNG' },
      { name: 'PNG a TIFF', route: '/tools/img/png-to-tiff', icon: '🔄', description: 'Convierte imágenes PNG a TIFF' },
      { name: 'Comprimir Imagen', route: '/tools/img/compress-image', icon: '📦', description: 'Reduce el tamaño de tus imágenes' },
      { name: 'Redimensionar', route: '/tools/img/resize-image', icon: '📏', description: 'Cambia el tamaño de imágenes' },
      { name: 'Recortar Imagen', route: '/tools/img/crop-image', icon: '✂️', description: 'Recorta tus imágenes' },
    ]
  },
  {
    id: 'pdf',
    name: 'Herramientas PDF',
    icon: '📄',
    tools: [
      { name: 'Unir PDFs', route: '/tools/pdf/pdf-merge', icon: '🔗', description: 'Combina múltiples PDFs en uno' },
      { name: 'Dividir PDF', route: '/tools/pdf/pdf-split', icon: '✂️', description: 'Extrae páginas de un PDF' },
      { name: 'PDF a JPG', route: '#', icon: '🖼️', description: 'Convierte páginas PDF a imágenes' },
      { name: 'JPG a PDF', route: '#', icon: '📄', description: 'Crea PDF desde imágenes' },
      { name: 'Comprimir PDF', route: '#', icon: '📦', description: 'Reduce el tamaño de PDF (No disponible en demo)' },
      { name: 'Rotar PDF', route: '/tools/pdf/pdf-rotate', icon: '🔄', description: 'Rota páginas de PDF' },
      { name: 'Organizar PDF', route: '#', icon: '📑', description: 'Reorganiza páginas del PDF' },
    ]
  },
  {
    id: 'audio',
    name: 'Herramientas de Audio',
    icon: '🎵',
    tools: [
      { name: 'MP3 a WAV', route: '#', icon: '🔄', description: 'Convierte MP3 a WAV (No disponible en demo)' },
      { name: 'WAV a MP3', route: '#', icon: '🔄', description: 'Convierte WAV a MP3 (No disponible en demo)' },
      { name: 'MP3 a OGG', route: '#', icon: '🔄', description: 'Convierte MP3 a OGG (No disponible en demo)' },
      { name: 'OGG a MP3', route: '#', icon: '🔄', description: 'Convierte OGG a MP3 (No disponible en demo)' },
      { name: 'Comprimir Audio', route: '#', icon: '📦', description: 'Reduce el tamaño del audio (No disponible en demo)' },
      { name: 'Recortar Audio', route: '#', icon: '✂️', description: 'Recorta archivos de audio (No disponible en demo)' },
      { name: 'Unir Audios', route: '#', icon: '🔗', description: 'Combina múltiples audios (No disponible en demo)' },
    ]
  },
  {
    id: 'video',
    name: 'Herramientas de Video',
    icon: '🎬',
    tools: [
      { name: 'MP4 a AVI', route: '#', icon: '🔄', description: 'Convierte MP4 a AVI (No disponible en demo)' },
      { name: 'AVI a MP4', route: '#', icon: '🔄', description: 'Convierte AVI a MP4 (No disponible en demo)' },
      { name: 'MP4 a MOV', route: '#', icon: '🔄', description: 'Convierte MP4 a MOV (No disponible en demo)' },
      { name: 'MOV a MP4', route: '#', icon: '🔄', description: 'Convierte MOV a MP4 (No disponible en demo)' },
      { name: 'MKV a MP4', route: '#', icon: '🔄', description: 'Convierte MKV a MP4 (No disponible en demo)' },
      { name: 'MP4 a MKV', route: '#', icon: '🔄', description: 'Convierte MP4 a MKV (No disponible en demo)' },
      { name: 'Comprimir Video', route: '#', icon: '📦', description: 'Reduce el tamaño del video (No disponible en demo)' },
      { name: 'Recortar Video', route: '#', icon: '✂️', description: 'Recorta videos (No disponible en demo)' },
      { name: 'GIF a MP4', route: '#', icon: '🔄', description: 'Convierte GIF a video (No disponible en demo)' },
      { name: 'MP4 a GIF', route: '#', icon: '🔄', description: 'Convierte video a GIF (No disponible en demo)' },
    ]
  }
])


// Refs para los carruseles
const scrollContainers = ref({})

const scrollLeft = (categoryId) => {
  const container = scrollContainers.value[categoryId]
  if (container) {
    container.scrollBy({ left: -300, behavior: 'smooth' })
  }
}

const scrollRight = (categoryId) => {
  const container = scrollContainers.value[categoryId]
  if (container) {
    container.scrollBy({ left: 300, behavior: 'smooth' })
  }
}

const setScrollRef = (el, categoryId) => {
  if (el) {
    scrollContainers.value[categoryId] = el
  }
}
</script>

<template>
  <div class="tools-page">
    <main class="categories">
      <section 
        v-for="category in categories" 
        :key="category.id" 
        class="category"
      >
        <div class="category-header">
          <h2>
            <span class="category-icon">{{ category.icon }}</span>
            {{ category.name }}
          </h2>
        </div>

        <div class="carousel-wrapper">
          <button 
            class="carousel-btn prev" 
            @click="scrollLeft(category.id)"
            aria-label="Anterior"
          >
            <span>‹</span>
          </button>

          <div 
            :ref="el => setScrollRef(el, category.id)"
            class="tools-carousel"
          >
            <NuxtLink
              v-for="tool in category.tools"
              :key="tool.route"
              :to="tool.route"
              class="tool-card"
            >
              <div class="tool-icon">{{ tool.icon }}</div>
              <h3>{{ tool.name }}</h3>
              <p>{{ tool.description }}</p>
            </NuxtLink>
          </div>

          <button 
            class="carousel-btn next" 
            @click="scrollRight(category.id)"
            aria-label="Siguiente"
          >
            <span>›</span>
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
body {
    background-color:linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%) ;
}
.tools-page {
  width: 100%;
}

/* CATEGORÍAS */
.categories {
  max-width: 100%;
  padding: 40px 20px;
}

.category {
  margin-bottom: 60px;
}

.category-header {
  margin-bottom: 24px;
  padding: 0 20px;
}

.category-header h2 {
  font-size: 32px;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-icon {
  font-size: 36px;
}

/* CAROUSEL WRAPPER */
.carousel-wrapper {
  position: relative;
  padding: 0 60px;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: white;
  border: 2px solid #004A8F;
  color: #004A8F;
  font-size: 32px;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.carousel-btn span {
  position: relative;
  top: -1px;
  left: -1.5px;
}
.carousel-btn.next span{
    position: relative;
    right: -1.7px;
    left: 0px;
}
.carousel-btn:hover {
  background: #004A8F;
  color: white;
  transform: translateY(-50%) scale(1.1);
}

.carousel-btn.prev {
  left: 0;
}

.carousel-btn.next {
  right: 0;
}

/* CAROUSEL */
.tools-carousel {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 20px 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tools-carousel::-webkit-scrollbar {
  display: none;
}

/* TOOL CARD */
.tool-card {
  min-width: 260px;
  max-width: 170px;
  background: white;
  border-radius: 12px;
  padding: 12px 24px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.tool-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 74, 143, 0.15);
  border-color: #004A8F;
}

.tool-icon {
  font-size: 56px;
  margin-bottom: 16px;
  transition: transform 0.3s ease;
}

.tool-card:hover .tool-icon {
  transform: scale(1.15) rotate(5deg);
}

.tool-card h3 {
  font-size: 20px;
  color: #004A8F;
  margin-bottom: 12px;
  font-weight: 600;
}

.tool-card p {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .category-header h2 {
    font-size: 24px;
  }

  .carousel-wrapper {
    padding: 0 50px;
  }

  .carousel-btn {
    width: 40px;
    height: 40px;
    font-size: 28px;
  }

  .tool-card {
    min-width: 240px;
    max-width: 240px;
    padding: 24px 20px;
  }

  .tool-icon {
    font-size: 48px;
  }
}

@media (max-width: 480px) {
  .carousel-wrapper {
    padding: 0 40px;
  }

  .carousel-btn {
    width: 36px;
    height: 36px;
    font-size: 24px;
  }

  .tool-card {
    min-width: 200px;
    max-width: 200px;
  }
}
</style>