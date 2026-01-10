<script setup>
import { ref, onUnmounted } from 'vue'
useHead({
  title: 'Compressor de Imagen | PatchWork'
})
const formats = [
  { id: 'jpg', name: 'JPG (Fotos)', accept: 'image/jpeg' },
  { id: 'png', name: 'PNG (Transparencia)', accept: 'image/png' },
  { id: 'webp', name: 'WebP (Web Optimizada)', accept: 'image/webp' },
  { id: 'tiff', name: 'TIFF (Alta Calidad)', accept: 'image/tiff' },
  { id: 'ico', name: 'ICO (Iconos)', accept: 'image/x-icon,image/png' },
]

const file = ref(null)
const targetFormat = ref('jpg')
const quality = ref(80)
const loading = ref(false)
const progress = ref(0)
const resultUrl = ref(null)

/* ----------------------------
   File selection
-----------------------------*/
const onFileChange = (e) => {
  if (resultUrl.value) {
    URL.revokeObjectURL(resultUrl.value)
  }

  const selectedFile = e.target.files?.[0]
  if (!selectedFile) return

  file.value = selectedFile
  resultUrl.value = null
  progress.value = 0

  // Auto-detectar formato
  const ext = selectedFile.name.split('.').pop().toLowerCase()
  if (['jpg', 'jpeg'].includes(ext)) targetFormat.value = 'jpg'
  else if (ext === 'png') targetFormat.value = 'png'
  else if (ext === 'webp') targetFormat.value = 'webp'
}

/* ----------------------------
   Process image
-----------------------------*/
const processImage = () => {
  if (!file.value) return

  loading.value = true
  progress.value = 0
  resultUrl.value = null

  const formData = new FormData()
  formData.append('file', file.value)

  const xhr = new XMLHttpRequest()
  xhr.open(
    'POST',
    `/api/compress-image?format=${targetFormat.value}&quality=${quality.value}`
  )

  // Progreso de subida
  xhr.upload.onprogress = (event) => {
    if (event.lengthComputable) {
      progress.value = Math.round((event.loaded / event.total) * 100)
    }
  }

  xhr.onload = () => {
    loading.value = false

    if (xhr.status < 200 || xhr.status >= 300) {
      alert('Error al procesar la imagen')
      return
    }

    const data = JSON.parse(xhr.responseText)

    if (!data.file) {
      alert('El servidor no devolvió el archivo')
      return
    }

    // Base64 → Blob
    const base64Data = data.file.split(',')[1]
    const mimeType =
      data.file.split(';')[0].split(':')[1] || 'image/png'

    const binaryString = atob(base64Data)
    const bytes = new Uint8Array(binaryString.length)

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    const blob = new Blob([bytes], { type: mimeType })
    resultUrl.value = URL.createObjectURL(blob)
  }

  xhr.onerror = () => {
    loading.value = false
    alert('Error de red al procesar la imagen')
  }

  xhr.send(formData)
}

/* ----------------------------
   Cleanup
-----------------------------*/
onUnmounted(() => {
  if (resultUrl.value) {
    URL.revokeObjectURL(resultUrl.value)
  }
})
</script>

<template>
  <section class="universal-tool">
    <h1>Convertidor y Compresor Pro</h1>
    <p>Sube cualquier imagen y elige el formato de salida.</p>

    <div class="card">
      <div class="step">
        <label>1. Selecciona tu imagen</label>
        <input type="file" @change="onFileChange" accept="image/*" />
      </div>

      <div v-if="file" class="step fade-in">
        <label>2. Formato de salida</label>
        <select v-model="targetFormat">
          <option v-for="f in formats" :key="f.id" :value="f.id">
            Convertir a {{ f.name }}
          </option>
        </select>

        <div v-if="targetFormat !== 'ico'" class="quality-box">
          <label>Calidad / Compresión: {{ quality }}%</label>
          <input type="range" v-model="quality" min="5" max="100" />
        </div>
      </div>

      <button
        v-if="file"
        class="btn-primary"
        :disabled="loading"
        @click="processImage"
      >
        {{ loading ? `Procesando... ${progress}%` : 'Comenzar ahora' }}
      </button>

      <!-- Barra de progreso -->
      <div v-if="loading" class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>

      <div v-if="resultUrl" class="result fade-in">
        <p>¡Listo! Tu imagen ha sido procesada.</p>
        <a
          :href="resultUrl"
          :download="`compressed.${targetFormat}`"
          class="btn-download"
        >
          Descargar Archivo .{{ targetFormat }}
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.universal-tool { max-width: 500px; margin: 40px auto; padding: 20px; text-align: center; }
.card { background: white; padding: 30px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
.step { margin-bottom: 25px; text-align: left; display: flex; flex-direction: column; gap: 8px; }
label { font-weight: bold; color: #333; }
select, input[type="file"] { padding: 10px; border: 1px solid #ddd; border-radius: 8px; }
.quality-box { margin-top: 15px; }
.btn-primary { 
  width: 100%; background: #004A8F; color: white; border: none; 
  padding: 14px; border-radius: 8px; cursor: pointer; font-weight: bold;
}
.btn-download {
  display: block; background: #28a745; color: white; padding: 12px;
  text-decoration: none; border-radius: 8px; margin-top: 15px;
}
.fade-in { animation: fadeIn 0.4s ease-in; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Barra de progreso */
.progress-bar {
  width: 100%;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  margin: 12px 0;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: #004A8F;
  transition: width 0.2s ease;
}
</style>
