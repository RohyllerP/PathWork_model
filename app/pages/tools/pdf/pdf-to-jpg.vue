<script setup lang="ts">
import { ref } from 'vue'
import JSZip from 'jszip'
let pdfjsLib: any
if (process.client) {
  pdfjsLib = await import('pdfjs-dist/legacy/build/pdf')
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/legacy/build/pdf.worker.min.js'
}
interface ImageItem {
  name: string
  url: string
}

const file = ref<File | null>(null)
const loading = ref(false)
const progress = ref(0)
const totalPages = ref(0)
const images = ref(<ImageItem[]>([]))

const onFileChange = (e: any) => {
  file.value = e.target.files[0]
  images.value = []
  progress.value = 0
}

const convertPdfToJpg = async () => {
  if (!file.value) return
  loading.value = true
  images.value = []
  progress.value = 0
  
  try {
    const arrayBuffer = await file.value.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    totalPages.value = pdf.numPages

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const viewport = page.getViewport({ scale: 2.0 })
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (!context) throw new Error('No se pudo obtener el contexto del canvas')

      canvas.width = viewport.width
      canvas.height = viewport.height

      await page.render({ canvasContext: context, viewport }).promise

      const imgData = canvas.toDataURL('image/jpeg', 0.9)
      images.value.push({ name: `pagina-${i}.jpg`, url: imgData })

      // Actualizar progreso en porcentaje
      progress.value = Math.round((i / pdf.numPages) * 100)
    }
  } catch (err) {
    console.error(err)
    alert('Error al convertir el PDF')
  } finally {
    loading.value = false
  }
}

const downloadAll = async () => {
  const zip: JSZip = new JSZip()
  images.value.forEach((img) => {
    const imageData = img.url.split(',')[1] 
    zip.file(img.name, imageData!, { base64: true })
  })

  const content = await zip.generateAsync({ type: 'blob' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(content)
  link.download = 'pdf_convertido.zip'
  link.click()
}
</script>

<template>
<section class="pdf-to-jpg">
  <h1>PDF a JPG</h1>
  <p>Convierte cada página de tu PDF en una imagen de alta resolución.</p>

  <div class="card">
    <div class="input-group">
      <label>Selecciona tu PDF</label>
      <input type="file" accept="application/pdf" @change="onFileChange" />
    </div>

    <div v-if="file && images.length === 0" class="actions">
      <button :disabled="loading" @click="convertPdfToJpg" class="btn-primary">
        {{ loading ? `Procesando... ${progress}%` : 'Convertir a JPG' }}
      </button>
    </div>

    <!-- Barra de progreso -->
    <div v-if="loading" class="progress-bar">
      <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      <span class="progress-text">{{ progress }}%</span>
    </div>

    <!-- Resultados -->
    <div v-if="images.length > 0" class="results fade-in">
      <div class="success-header">
        <span>✅ {{ totalPages }} páginas convertidas</span>
        <button @click="downloadAll" class="btn-zip">Descargar todo (.ZIP)</button>
      </div>

      <div class="preview-grid">
        <div v-for="(img, idx) in images" :key="idx" class="preview-item">
          <img :src="img.url" />
          <a :href="img.url" :download="img.name" class="btn-individual">
            Pág {{ idx + 1 }} ↓
          </a>
        </div>
      </div>
    </div>
  </div>
</section>
</template>

<style scoped>
  .pdf-to-jpg {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px;
}

.pdf-to-jpg h1 {
  font-size: 2.2rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
}

.pdf-to-jpg p {
  color: #475569;
  margin-bottom: 30px;
}

/* Card */
.card {
  background: #ffffff;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

/* Input */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-weight: 600;
  color: #334155;
}

.input-group input[type="file"] {
  padding: 14px;
  border-radius: 12px;
  border: 2px dashed #cbd5e1;
  background: #f8fafc;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.input-group input[type="file"]:hover {
  border-color: #004a8f;
  background: #f1f5f9;
}

/* Actions */
.actions {
  margin-top: 24px;
}

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg, #004a8f, #0066cc);
  color: white;
  border: none;
  padding: 14px 28px;
  font-weight: 600;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0, 74, 143, 0.25);
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(0, 74, 143, 0.35);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Progress bar */
.progress-bar {
  position: relative;
  width: 100%;
  height: 12px;
  background: #e5e7eb;
  border-radius: 999px;
  margin: 24px 0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #004a8f, #38bdf8);
  transition: width 0.25s ease;
}

.progress-text {
  margin-top: 8px;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: #004a8f;
}

/* Results */
.results {
  margin-top: 30px;
}

.fade-in {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Success header */
.success-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-weight: 600;
  color: #0f172a;
}

/* ZIP button */
.btn-zip {
  background: #0f172a;
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 999px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-zip:hover {
  background: #020617;
}

/* Preview grid */
.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
}

.preview-item {
  background: #f8fafc;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.08);
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.preview-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
}

.preview-item img {
  width: 100%;
  border-radius: 10px;
  margin-bottom: 10px;
}

/* Individual download */
.btn-individual {
  display: inline-block;
  margin-top: 6px;
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 600;
  color: #004a8f;
  background: #e0f2fe;
  border-radius: 999px;
  text-decoration: none;
  transition: background 0.2s;
}

.btn-individual:hover {
  background: #bae6fd;
}

.progress-bar {
  position: relative;
  width: 100%;
  height: 10px;
  background: #eee;
  border-radius: 5px;
  margin: 20px 0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #004A8F;
  transition: width 0.2s ease;
}

.progress-text {
  position: absolute;
  right: 10px;
  top: -24px;
  font-size: 14px;
  font-weight: bold;
  color: #004A8F;
}
</style>
