<script setup lang="ts">
import { ref } from 'vue'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
import { PDFDocument } from 'pdf-lib'

if (process.client) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/legacy/build/pdf.worker.min.js'
}


// --- STATE ---
const file = ref<File | null>(null)
const pages = ref<{ pageNumber: number; preview: string }[]>([])
const loading = ref(false)
const processing = ref(false)
const resultUrl = ref<string | null>(null)
const progress = ref(0)

// --- SELECCIONAR PDF ---
const onChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  file.value = input.files[0]!
  pages.value = []
  resultUrl.value = null
  loading.value = true
  progress.value = 0

  try {
    const arrayBuffer = await file.value.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const totalPages = pdf.numPages

    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i)
      const viewport = page.getViewport({ scale: 0.5 })

      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height

      const context = canvas.getContext('2d')
      if (!context) throw new Error('No se pudo obtener el contexto 2D')

      await page.render({ canvasContext: context, viewport }).promise

      pages.value.push({
        pageNumber: i,
        preview: canvas.toDataURL()
      })

      // 🔹 PROGRESO
      progress.value = Math.round((i / totalPages) * 100)
      await new Promise(r => setTimeout(r, 30))
    }
  } catch (err) {
    console.error(err)
    alert('Error al leer el PDF')
  } finally {
    loading.value = false
    setTimeout(() => (progress.value = 0), 800)
  }
}

// --- REORDENAR ---
const movePage = (from: number, to: number) => {
  if (to < 0 || to >= pages.value.length) return
  const item = pages.value.splice(from, 1)[0]
  pages.value.splice(to, 0, item!)
}

// --- GENERAR PDF FINAL ---
const generatePdf = async () => {
  if (!file.value || pages.value.length === 0) return

  processing.value = true
  progress.value = 0

  try {
    const originalArrayBuffer = await file.value.arrayBuffer()
    const pdfDoc = await PDFDocument.load(originalArrayBuffer)
    const newPdf = await PDFDocument.create()

    const total = pages.value.length

    for (let i = 0; i < total; i++) {
      const page = pages.value[i]
      const [copied] = await newPdf.copyPages(pdfDoc, [page!.pageNumber - 1])
      newPdf.addPage(copied)

      // 🔹 PROGRESO
      progress.value = Math.round(((i + 1) / total) * 100)
      await new Promise(r => setTimeout(r, 30))
    }

    const pdfBytes = await newPdf.save()
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
    resultUrl.value = URL.createObjectURL(blob)
  } catch (err) {
    console.error(err)
    alert('Error al generar el PDF')
  } finally {
    processing.value = false
    setTimeout(() => (progress.value = 0), 800)
  }
}
</script>

<template>
  <section class="pdf-organizer">
    <h1>Organizador de PDF</h1>

    <input type="file" accept="application/pdf" @change="onChange" />

    <!-- PROGRESO CARGA -->
    <div v-if="loading && progress > 0" class="progress-container fade-in">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <p class="progress-text">Cargando páginas — {{ progress }}%</p>
    </div>

    <div v-if="pages.length" class="pages-grid">
      <div
        v-for="(page, index) in pages"
        :key="page.pageNumber"
        class="page-item"
      >
        <div class="page-number">Página {{ page.pageNumber }}</div>
        <img :src="page.preview" class="page-preview" />
        <div class="controls">
          <button @click="movePage(index, index - 1)" :disabled="index === 0">⬆</button>
          <button @click="movePage(index, index + 1)" :disabled="index === pages.length - 1">⬇</button>
        </div>
      </div>
    </div>

    <!-- PROGRESO GENERACIÓN -->
    <div v-if="processing && progress > 0" class="progress-container fade-in">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <p class="progress-text">Generando PDF — {{ progress }}%</p>
    </div>

    <button
      v-if="pages.length"
      @click="generatePdf"
      :disabled="processing"
      class="btn-generate"
    >
      {{ processing ? 'Generando PDF...' : 'Generar PDF final' }}
    </button>

    <a
      v-if="resultUrl"
      :href="resultUrl"
      download="organizado.pdf"
      class="btn-download"
    >
      Descargar PDF
    </a>
  </section>
</template>

<style scoped>
.pdf-organizer { max-width: 900px; margin: 40px auto; text-align: center; }

.pages-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
  margin: 20px 0;
}

.page-item {
  width: 220px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: #fff;
}

.page-number { font-weight: bold; margin-bottom: 5px; }
.page-preview { width: 100%; border-radius: 6px; }

.controls button {
  margin: 4px;
  padding: 6px 10px;
  cursor: pointer;
}

.btn-generate {
  padding: 14px 24px;
  background: #004A8F;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.btn-download {
  display: inline-block;
  margin-top: 15px;
  background: #28a745;
  color: white;
  padding: 12px 18px;
  border-radius: 8px;
  font-weight: bold;
  text-decoration: none;
}

/* PROGRESS */
.progress-container {
  margin: 20px 0;
  padding: 15px;
  background: #f8fafc;
  border-radius: 8px;
}

.progress-bar {
  width: 100%;
  height: 26px;
  background: #e0e0e0;
  border-radius: 13px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #004A8F, #0066CC);
  transition: width 0.3s ease;
}

.progress-text {
  margin-top: 8px;
  font-weight: 600;
  color: #004A8F;
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
