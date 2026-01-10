<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

let pdfjsLib: any

onMounted(async () => {
  if (process.client) {
    pdfjsLib = await import('pdfjs-dist/legacy/build/pdf')
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/legacy/build/pdf.worker.min.js'
  }
})

const file = ref<File | null>(null)
const pages = ref<{ pageNumber: number; preview: string }[]>([])
const selectedPages = ref<Set<number>>(new Set())
const loading = ref(false)
const processing = ref(false)
const resultUrl = ref<string | null>(null)
const totalPages = ref(0)
const progress = ref(0)

useHead({ title: 'Dividir PDF | PatchWork' })

const generatePreviews = async (pdfFile: File) => {
  loading.value = true
  pages.value = []
  selectedPages.value.clear()
  progress.value = 0

  const buffer = await pdfFile.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  totalPages.value = pdf.numPages

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 0.5 })

    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height

    const ctx = canvas.getContext('2d')!
    await page.render({ canvasContext: ctx, viewport }).promise

    pages.value.push({
      pageNumber: i,
      preview: canvas.toDataURL()
    })

    progress.value = Math.round((i / pdf.numPages) * 100)
    await new Promise(r => setTimeout(r, 0))
  }

  loading.value = false
  setTimeout(() => (progress.value = 0), 600)
}

const onChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  if (!input.files?.[0]) return

  file.value = input.files[0]
  resultUrl.value = null
  await generatePreviews(file.value)
}

const togglePage = (page: number) => {
  selectedPages.value.has(page)
    ? selectedPages.value.delete(page)
    : selectedPages.value.add(page)
}

const selectAll = () => {
  if (selectedPages.value.size === totalPages.value) {
    selectedPages.value.clear()
  } else {
    selectedPages.value = new Set(pages.value.map(p => p.pageNumber))
  }
}
const selectRange = () => {
  const input = prompt('Ingresa el rango de páginas (ej: 1-5, 7, 9-12):')
  if (!input) return

  selectedPages.value.clear()

  const ranges = input.split(',').map(r => r.trim())

  ranges.forEach(range => {
    const selectRange = () => {
      const rangeInput = prompt('Ingresa el rango de páginas (ej: 1-5, 7, 9-12):')
      if (!rangeInput) return

      selectedPages.value.clear()
      const ranges = rangeInput.split(',').map(r => r.trim())

      ranges.forEach(range => {
        if (range.includes('-')) {
          const [startStr, endStr] = range.split('-').map(n => n.trim())
          const start = parseInt(startStr!)
          const end = parseInt(endStr!)

          // ✅ Validación estricta: start y end deben ser números válidos
          if (Number.isInteger(start) && Number.isInteger(end) && start > 0 && end > 0 && start <= end) {
            for (let i = start; i <= end && i <= totalPages.value; i++) {
              selectedPages.value.add(i)
            }
          }
        } else {
          const pageNum = parseInt(range)
          if (Number.isInteger(pageNum) && pageNum > 0 && pageNum <= totalPages.value) {
            selectedPages.value.add(pageNum)
          }
        }
      })
    }


  })
}

const extractPages = async () => {
  if (!file.value || selectedPages.value.size === 0) return

  processing.value = true
  resultUrl.value = null

  const formData = new FormData()
  formData.append('file', file.value)
  formData.append(
    'pages',
    JSON.stringify([...selectedPages.value].sort((a, b) => a - b))
  )

  try {
    // Fetch en modo 'arrayBuffer'
    const response = await fetch('/api/pdf-split', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) throw new Error('Error al extraer PDF')

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)

    // Crear un enlace temporal para descargar
    const a = document.createElement('a')
    a.href = url
    a.download = `split.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

  } catch (err) {
    console.error(err)
    alert('Error al extraer PDF')
  } finally {
    processing.value = false
  }
}


const isSelected = (p: number) => selectedPages.value.has(p)
const hasSelection = computed(() => selectedPages.value.size > 0)
</script>


<template>
  <section class="tool">
    <h1>Dividir PDF</h1>
    <p class="subtitle">Selecciona las páginas que deseas extraer</p>

    <input type="file" accept="application/pdf" @change="onChange" />

    <div v-if="loading" class="loading">
      Cargando páginas...
    </div>

    <!-- Barra de progreso -->
    <div v-if="loading && progress > 0" class="progress-container fade-in">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <p class="progress-text">Procesando páginas {{ progress }}%</p>
    </div>

    <div v-if="pages.length > 0" class="controls">
      <button @click="selectAll" class="btn-secondary">
        {{ selectedPages.size === totalPages ? 'Deseleccionar todo' : 'Seleccionar todo' }}
      </button>
      <button @click="selectRange" class="btn-secondary">
        Seleccionar rango
      </button>
      <span class="counter">
        {{ selectedPages.size }} de {{ totalPages }} páginas seleccionadas
      </span>
    </div>

    <div v-if="pages.length > 0" class="pages-grid">
      <div v-for="page in pages" :key="page.pageNumber"
        :class="['page-item', { selected: isSelected(page.pageNumber) }]" @click="togglePage(page.pageNumber)">
        <div class="page-number">{{ page.pageNumber }}</div>
        <img :src="page.preview" class="page-preview" />
        <div v-if="isSelected(page.pageNumber)" class="check-mark">✓</div>
      </div>
    </div>

    <button v-if="hasSelection" :disabled="processing" @click="extractPages" class="btn-primary">
      {{ processing ? 'Extrayendo...' : `Extraer ${selectedPages.size} página${selectedPages.size > 1 ? 's' : ''}` }}
    </button>

    <a v-if="resultUrl" :href="resultUrl" download class="download-link">
      Descargar PDF extraído
    </a>
  </section>
</template>

<style scoped>
/* --- TODO ESTILO ANTERIOR --- */
.tool {
  max-width: 1200px;
  margin: 40px auto;
  padding: 24px;
  text-align: center;
}

h1 {
  color: #004A8F;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  margin-bottom: 20px;
  font-size: 15px;
}

input[type="file"] {
  margin: 20px 0;
  padding: 10px;
}

.loading {
  padding: 40px;
  color: #004A8F;
  font-size: 18px;
}

/* Barra de progreso */
.progress-container {
  margin: 20px 0;
  padding: 12px;
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
  transition: width 0.2s ease;
}

.progress-text {
  margin-top: 8px;
  font-weight: 600;
  color: #004A8F;
  font-size: 14px;
  text-align: center;
}

/* CONTROLES Y GRID DE PÁGINAS */
.controls {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
  flex-wrap: wrap;
}

.counter {
  color: #004A8F;
  font-weight: 600;
  padding: 8px 16px;
  background: #e4ecf7;
  border-radius: 6px;
}

.pages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
  margin: 24px 0;
  padding: 8px;
}

.page-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: #f0f4f8;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  border: 2px solid transparent;
  user-select: none;
}

.page-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.page-item.selected {
  background: #d4e3f7;
  border-color: #004A8F;
  box-shadow: 0 4px 12px rgba(0, 74, 143, 0.2);
}

.page-number {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  z-index: 2;
}

.page-preview {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  pointer-events: none;
}

.check-mark {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #004A8F;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  z-index: 2;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.btn-primary,
.btn-secondary {
  border: none;
  padding: 10px 18px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s, transform 0.1s;
  font-weight: 500;
}

.btn-primary {
  background: #004A8F;
  color: white;
  margin-top: 16px;
}

.btn-primary:hover:not(:disabled) {
  background: #003a73;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e4ecf7;
  color: #004A8F;
}

.btn-secondary:hover {
  background: #d4dce7;
  transform: translateY(-1px);
}

.download-link {
  display: inline-block;
  margin-top: 20px;
  margin-left: 20px;
  padding: 12px 24px;
  background: #28a745;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  transition: background 0.2s;
}

.download-link:hover {
  background: #218838;
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
