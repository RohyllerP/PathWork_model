<script setup>
import { ref, onMounted, nextTick } from 'vue'
useHead
  ({
    title: 'Unir PDFs | PatchWork'
  })
// Importaciones dinámicas para evitar errores en el hosting
const Sortable = process.client ? (await import('sortablejs')).default : null
const config = useRuntimeConfig() // Acceso a la API Key

const items = ref([])
const listRef = ref(null)
const loading = ref(false)
const resultUrl = ref(null)
const progress = ref(0)
const loadingPreviews = ref(false)

/* Generar preview - Ajustado para Hosting */
const generatePreview = async (file) => {

  if (!process.client) return

  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf')
  // Usamos CDN para el worker para evitar problemas de rutas en Vercel
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/legacy/build/pdf.worker.min.js`
 
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  const page = await pdf.getPage(1)
  const viewport = page.getViewport({ scale: 0.3 })
  
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.width = viewport.width
  canvas.height = viewport.height
  console.log("Generate preview");
  await page.render({ canvasContext: context, viewport }).promise
  return canvas.toDataURL()
}

/* Selección de archivos */
const onChange = async (e) => {
  const files = Array.from(e.target.files)
  loadingPreviews.value = true
  console.log("en el onchange");
  for (const file of files) {
    try {
      const preview = await generatePreview(file)
      items.value.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview
      })
    } catch (err) {
      console.error("Error en preview:", err)
    }
  }

  loadingPreviews.value = false
  e.target.value = ''

  await nextTick()
  initSortable()
}

/* Inicializar Sortable no paso*/
const initSortable = () => {
  if (!process.client || !listRef.value || listRef.value._sortable) return

  listRef.value._sortable = Sortable.create(listRef.value, {
    animation: 200,
    ghostClass: 'sortable-ghost',
    onEnd: (evt) => {
      const newItems = [...items.value]
      const movedItem = newItems.splice(evt.oldIndex, 1)[0]
      newItems.splice(evt.newIndex, 0, movedItem)
      items.value = newItems
    }
  })
}

onMounted(() => {
  if (items.value.length > 0) initSortable()
})

/* Merge - CON PROTECCIÓN API KEY */
const merge = async () => {
  if (!items.value.length) return
  loading.value = true

  const formData = new FormData()
  items.value.forEach(i => formData.append('files', i.file))

  try {
    const response = await $fetch('/api/pdf-merge', {
      method: 'POST',
      body: formData,
      responseType: 'arrayBuffer'
    })

    const blob = new Blob([response], { type: 'application/pdf' })
    resultUrl.value = URL.createObjectURL(blob)
    progress.value = 100


    progress.value = 100
  } catch (err) {
    console.error(err)
    alert('Error al unir los PDFs')
  } finally {
    loading.value = false
  }
}
</script>
<template>
  <section class="tool">
    <h1>Unir PDFs</h1>
    <p>Selecciona varios archivos PDF y únelos en un solo documento</p>

    <div class="upload-section">
      <label for="file-input" class="file-label">
        <span class="upload-icon">📄</span>
        <span class="upload-text">Seleccionar PDFs</span>
        <input id="file-input" type="file" accept="application/pdf" multiple @change="onChange" class="hidden-input" />
      </label>
      <p v-if="loadingPreviews" class="loading-previews">Generando previsualizaciones...</p>
    </div>

    <div v-if="items.length > 0" class="content-wrapper">
      <div class="instructions">
        <p>📌 Arrastra los archivos para cambiar el orden</p>
      </div>

      <div ref="listRef" class="list">
        <!-- IMPORTANTE: :data-id para que Sortable trackee correctamente -->
        <div v-for="(item, i) in items" :key="item.id" :data-id="i" class="item">
          <div class="item-number">{{ i + 1 }}</div>
          <img :src="item.preview" class="preview" />
          <span class="file-name">{{ item.file.name }}</span>
          <button @click.stop="remove(i)" class="btn-remove">✖</button>
        </div>
      </div>

      <button :disabled="!items.length || loading" @click="merge" class="btn-merge">
        {{ loading ? 'Uniendo PDFs...' : `Unir ${items.length} PDF${items.length > 1 ? 's' : ''}` }}
      </button>

      <!-- Barra de progreso -->
      <div v-if="loading && progress > 0 && !resultUrl" class="progress-container fade-in">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <p class="progress-text">Uniendo documentos... {{ Math.round(progress) }}%</p>
      </div>

      <div v-if="resultUrl" class="result-section fade-in">
        <div class="success-message">
          <span class="success-icon">✓</span>
          <span>PDFs unidos correctamente</span>
        </div>
        <a :href="resultUrl" download="documento_unido.pdf" class="btn-download">
          Descargar PDF Unido
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tool {
  max-width: 1000px;
  margin: 40px auto;
  padding: 24px;
  text-align: center;
}

h1 {
  color: #004A8F;
  margin-bottom: 8px;
  font-size: 32px;
}

.tool>p {
  color: #666;
  margin-bottom: 30px;
}

.upload-section {
  margin: 30px 0;
}

.file-label {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  background: #004A8F;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.2s;
}

.file-label:hover {
  background: #003870;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 74, 143, 0.3);
}

.upload-icon {
  font-size: 24px;
}

.hidden-input {
  display: none;
}

.loading-previews {
  margin-top: 15px;
  color: #004A8F;
  font-weight: 500;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.content-wrapper {
  margin-top: 30px;
}

.instructions {
  background: #f0f7ff;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #004A8F;
}

.instructions p {
  margin: 0;
  color: #004A8F;
  font-weight: 500;
  font-size: 14px;
}

/* CONTENEDOR DE ARCHIVOS - GRID */
.list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
  position: relative;
  padding: 8px;
}

/* Durante drag, mantener espacio fijo */
.list.is-dragging {
  min-height: 250px;
}

.list.is-dragging .item:not(.sortable-chosen):not(.sortable-ghost) {
  transition: transform 0.3s ease, opacity 0.2s ease;
}

/* Para pantallas medianas */
@media (max-width: 900px) {
  .list {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

@media (max-width: 600px) {
  .list {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}

/* ITEM DRAGGABLE */
.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s ease;
  user-select: none;
  -webkit-user-select: none;
  position: relative;
}

.item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #004A8F;
}

.item:active {
  cursor: grabbing;
}

.item-number {
  position: absolute;
  top: 8px;
  left: 8px;
  background: #004A8F;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  pointer-events: none;
}

/* PREVIEW PDF */
.preview {
  width: 100%;
  height: 180px;
  object-fit: contain;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: #f8fafc;
  pointer-events: none;
}

/* NOMBRE ARCHIVO */
.file-name {
  font-size: 13px;
  text-align: center;
  word-break: break-word;
  pointer-events: none;
  color: #333;
  line-height: 1.3;
  max-height: 40px;
  overflow: hidden;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* BOTÓN ELIMINAR */
.btn-remove {
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4px;
}

.btn-remove:hover {
  background: #ff7875;
  transform: scale(1.1);
}

/* BOTÓN UNIR */
.btn-merge {
  background: #004A8F;
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  display: block;
}

.btn-merge:hover:not(:disabled) {
  background: #003870;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 74, 143, 0.3);
}

.btn-merge:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Barra de progreso */
.progress-container {
  margin: 25px auto;
  max-width: 500px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
}

.progress-bar {
  width: 100%;
  height: 30px;
  background: #e0e0e0;
  border-radius: 15px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #004A8F, #0066CC);
  transition: width 0.3s ease;
  border-radius: 15px;
}

.progress-text {
  margin-top: 12px;
  font-weight: 600;
  color: #004A8F;
  font-size: 15px;
  text-align: center;
}

/* Sección de resultado */
.result-section {
  margin-top: 30px;
  padding: 20px;
  background: #f0f7ff;
  border-radius: 12px;
  border: 2px solid #d0e3ff;
}

.success-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
  color: #28a745;
  font-weight: 600;
  font-size: 16px;
}

.success-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #28a745;
  color: white;
  border-radius: 50%;
  font-size: 16px;
}

.btn-download {
  display: block;
  background: #28a745;
  color: white;
  padding: 16px 32px;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.2s;
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
}

.btn-download:hover {
  background: #218838;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

/* CLASES SORTABLE (mejora UX drag) */
.sortable-ghost {
  opacity: 0.4;
  background: #e4ecf7;
  border-color: #004A8F;
}

.sortable-chosen {
  background: #f0f7ff;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  border-color: #004A8F;
}

.sortable-drag {
  opacity: 1;
  transform: rotate(2deg) scale(1.05);
  cursor: grabbing !important;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>