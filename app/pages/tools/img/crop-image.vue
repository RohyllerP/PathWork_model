<script setup>
import { ref, onUnmounted } from 'vue'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const file = ref(null)
const imageSrc = ref(null)
const loading = ref(false)
const progress = ref(0)
const resultUrl = ref(null)
const cropperRef = ref(null)

useHead({ title: 'Recortar Imagen Visual | PatchWork' })

const onFileChange = (e) => {
  if (resultUrl.value) {
    URL.revokeObjectURL(resultUrl.value)
  }

  const selectedFile = e.target.files[0]
  if (!selectedFile) return

  file.value = selectedFile
  resultUrl.value = null
  progress.value = 0
  imageSrc.value = URL.createObjectURL(selectedFile)
}

const handleCrop = () => {
  if (!cropperRef.value || !file.value) return

  loading.value = true
  progress.value = 0
  resultUrl.value = null

  const { coordinates } = cropperRef.value.getResult()

  const params =
    `left=${Math.round(coordinates.left)}` +
    `&top=${Math.round(coordinates.top)}` +
    `&width=${Math.round(coordinates.width)}` +
    `&height=${Math.round(coordinates.height)}`

  const formData = new FormData()
  formData.append('file', file.value)

  const xhr = new XMLHttpRequest()
  xhr.open('POST', `/api/crop-image?${params}`)

  xhr.upload.onprogress = (event) => {
    if (event.lengthComputable) {
      progress.value = Math.round((event.loaded / event.total) * 100)
    }
  }

  xhr.onload = () => {
    loading.value = false

    if (xhr.status < 200 || xhr.status >= 300) {
      alert('Error al procesar el recorte')
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
    alert('Error de red al procesar el recorte')
  }

  xhr.send(formData)
}

onUnmounted(() => {
  if (resultUrl.value) {
    URL.revokeObjectURL(resultUrl.value)
  }
})
</script>


<template>
  <section class="crop-tool">
    <h1>Recortar Imagen</h1>
    <p>Ajusta el recuadro sobre la imagen para recortarla.</p>

    <div class="card">
      <div class="input-group">
        <div class="upload-wrapper" @click="$refs.fileInput.click()">
          <input type="file" ref="fileInput" @change="onFileChange" accept="image/*" class="hidden-input" />
          <div class="upload-design">
            <div class="icon-circle"><span>➕</span></div>
            <div class="text-content">
              <span v-if="!file" class="main-text">Elegir imagen</span>
              <span v-else class="file-ready">✅ {{ file.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="imageSrc && !resultUrl" class="cropper-container fade-in">
        <cropper
          ref="cropperRef"
          class="cropper"
          :src="imageSrc"
          :stencil-props="{ aspectRatio: null }"
        />
        
        <button class="btn-crop" :disabled="loading" @click="handleCrop">
          {{ loading ? `Recortando... ${progress}%` : 'Confirmar Recorte' }}
        </button>

        <!-- Barra de progreso -->
        <div v-if="loading" class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
      </div>

      <div v-if="resultUrl" class="result fade-in">
        <div class="divider"></div>
        <p>✓ Imagen recortada con éxito</p>
        <div class="preview-result">
            <img :src="resultUrl" alt="Resultado" />
        </div>
        <a :href="resultUrl" download class="btn-download">Descargar Recorte</a>
        <button class="btn-reset" @click="resultUrl = null; imageSrc = null; file = null">Subir otra</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.crop-tool { max-width: 600px; margin: 40px auto; text-align: center; }
.card { background: #fff; padding: 25px; border-radius: 16px; box-shadow: 0 4px 25px rgba(0,0,0,0.1); }

.cropper-container { margin-top: 20px; }
.cropper { max-height: 400px; background: #DDD; border-radius: 8px; margin-bottom: 20px; }

.btn-crop {
  width: 100%; background: #004A8F; color: white; border: none; padding: 14px;
  border-radius: 8px; font-weight: bold; cursor: pointer;
}

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

.preview-result img {
    max-width: 100%;
    border-radius: 8px;
    margin-bottom: 15px;
}

.btn-reset {
    background: transparent; border: 1px solid #ccc; margin-top: 10px;
    padding: 8px; border-radius: 6px; cursor: pointer; width: 100%;
}

.hidden-input { display: none; }
.upload-wrapper { border: 2px dashed #e2e8f0; border-radius: 12px; padding: 20px; cursor: pointer; display: flex; justify-content: center; }
.btn-download { display: block; background: #28a745; color: white; padding: 12px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-bottom: 10px; }
.divider { height: 1px; background: #eee; margin: 20px 0; }
.fade-in { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
