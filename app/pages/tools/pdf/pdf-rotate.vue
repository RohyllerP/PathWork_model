<script setup lang="ts">
import { ref } from 'vue'

const file = ref<File | null>(null)
const angle = ref(0)
const loading = ref(false)
const result = ref<any>(null)
const previewUrl = ref<string | null>(null)
const progress = ref(0)

const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  file.value = input.files?.[0] ?? null
  result.value = null
  progress.value = 0

  if (file.value) {
    previewUrl.value = URL.createObjectURL(file.value)
  }
}

const rotatePdf = async () => {
  if (!file.value) return
  loading.value = true
  progress.value = 0

  const formData = new FormData()
  formData.append('file', file.value)
  formData.append('angle', angle.value.toString())

  try {
    // Enviar a la API
    const res: any = await $fetch('/api/pdf-rotate', {
      method: 'POST',
      body: formData
    })

    // Decodificar Base64 y mostrar progreso
    const bytes = atob(res.file)
    const arr = new Uint8Array(bytes.length)

    for (let i = 0; i < bytes.length; i++) {
      arr[i] = bytes.charCodeAt(i)
      // 🔹 Actualizamos progreso cada 500 bytes
      if (i % 500 === 0) {
        progress.value = Math.round((i / bytes.length) * 100)
        await new Promise(r => setTimeout(r, 0)) // permite renderizar
      }
    }

    result.value = { file: res.file }
    progress.value = 100
    setTimeout(() => (progress.value = 0), 800)
  } catch {
    alert('Error al rotar el PDF')
    progress.value = 0
  } finally {
    loading.value = false
  }
}

const downloadPdf = () => {
  if (!result.value?.file) return

  const bytes = atob(result.value.file)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) {
    arr[i] = bytes.charCodeAt(i)
  }

  const blob = new Blob([arr.buffer], { type: 'application/pdf' }) // <-- buffer para TS
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'rotated.pdf'
  a.click()

  URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="tool">
    <h1>Rotar PDF</h1>
    <p>Visualiza la rotación antes de descargar.</p>

    <div class="card">
      <input type="file" accept="application/pdf" @change="onFileChange" />

      <div v-if="file" class="rotate-controls fade-in">
        <button
          v-for="deg in [0, 90, 180, 270]"
          :key="deg"
          :class="{ active: angle === deg }"
          @click="angle = deg"
        >
          {{ deg }}°
        </button>
      </div>

      <div v-if="previewUrl" class="preview-wrapper fade-in">
        <embed
          :src="previewUrl"
          type="application/pdf"
          class="pdf-preview"
          :style="{ transform: `rotate(${angle}deg)` }"
        />
      </div>

      <!-- BARRA DE PROGRESO -->
      <div v-if="loading && progress > 0" class="progress-container fade-in">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <p class="progress-text">Procesando PDF — {{ progress }}%</p>
      </div>

      <button
        v-if="file"
        class="btn-main"
        :disabled="loading"
        @click="rotatePdf"
      >
        {{ loading ? 'Procesando…' : 'Aplicar rotación y descargar' }}
      </button>

      <div v-if="result" class="result fade-in">
        <button class="download-btn" @click="downloadPdf">
          Descargar PDF rotado
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tool {
  max-width: 550px;
  margin: 60px auto;
  text-align: center;
}

.tool h1 {
  font-size: 28px;
  margin-bottom: 10px;
}

.tool p {
  color: #555;
  font-size: 14px;
}

.card {
  background: #ffffff;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  margin-top: 30px;
}

input[type="file"] {
  margin-top: 20px;
}

.rotate-controls {
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
  gap: 10px;
}

.rotate-controls button {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background: #f5f5f5;
  cursor: pointer;
  font-weight: bold;
}

.rotate-controls button.active {
  background: #004A8F;
  color: white;
  border-color: #004A8F;
}

.preview-wrapper {
  margin: 20px 0;
  height: 400px;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid #ddd;
}

.pdf-preview {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
  transform-origin: center center;
}

.btn-main {
  width: 100%;
  background: #004A8F;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.btn-main:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.result {
  margin-top: 30px;
  padding: 20px;
  background: #f0f7ff;
  border-radius: 12px;
  border: 1px solid #d0e3ff;
}

.download-btn {
  background: #28a745;
  color: white;
  padding: 12px 18px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.download-btn:hover {
  background: #1e7e34;
}

.fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* BARRA DE PROGRESO */
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
</style>
