<script setup>
import { ref, onUnmounted } from 'vue'

const file = ref(null)
const width = ref(null)
const height = ref(null)
const fitMode = ref('inside')
const loading = ref(false)
const progress = ref(0)
const resultUrl = ref(null)

const originalInfo = ref({ w: 0, h: 0, ext: '' })

useHead({ title: 'Redimensionar Imagen | PatchWork' })

/* ----------------------------
   File change
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

  originalInfo.value.ext =
    selectedFile.name.split('.').pop().toLowerCase()

  const reader = new FileReader()
  reader.onload = (event) => {
    const img = new Image()
    img.onload = () => {
      originalInfo.value.w = img.width
      originalInfo.value.h = img.height
      width.value = img.width
      height.value = img.height
    }
    img.src = event.target.result
  }
  reader.readAsDataURL(selectedFile)
}

/* ----------------------------
   Resize
-----------------------------*/
const handleResize = () => {
  if (!file.value || !width.value) return

  loading.value = true
  progress.value = 0
  resultUrl.value = null

  const formData = new FormData()
  formData.append('file', file.value)

  const format =
    originalInfo.value.ext === 'jpeg'
      ? 'jpg'
      : originalInfo.value.ext

  const params =
    `format=${format}` +
    `&width=${width.value}` +
    `&height=${height.value || ''}` +
    `&fit=${fitMode.value}`

  const xhr = new XMLHttpRequest()
  xhr.open('POST', `/api/resize-image?${params}`)

  xhr.upload.onprogress = (event) => {
    if (event.lengthComputable) {
      progress.value = Math.round(
        (event.loaded / event.total) * 100
      )
    }
  }

  xhr.onload = () => {
    loading.value = false

    if (xhr.status < 200 || xhr.status >= 300) {
      alert('Error al redimensionar')
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
    alert('Error al redimensionar')
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
<section class="resize-tool">
    <h1>Redimensionar Imagen</h1>
    <p>Cambia el tamaño de tu imagen con control total.</p>

    <div class="card">
        <div class="input-group">
            <label>1. Selecciona tu imagen</label>
            <div class="upload-wrapper" @click="$refs.fileInput.click()">
                <input type="file" ref="fileInput" @change="onFileChange" accept="image/*" class="hidden-input" />
                <div class="upload-design">
                    <div class="icon-circle"><span class="icon">➕</span></div>
                    <div class="text-content">
                        <span v-if="!file" class="main-text">Elegir archivo o arrastrar</span>
                        <span v-else class="file-ready">✅ {{ file.name }}</span>
                        <span class="sub-text">PNG, JPG, WEBP o TIFF</span>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="file" class="controls fade-in">
            <div class="info-badge">
                Tamaño original: {{ originalInfo.w }}px x {{ originalInfo.h }}px
            </div>

            <div class="field" style="margin-bottom: 20px; text-align: left;">
                <label>2. Modo de ajuste</label>
                <select v-model="fitMode" class="select-fit">
                    <option value="inside">Mantener Proporción (Recomendado)</option>
                    <option value="fill">Estirar (Cubre exacto - deforma)</option>
                    <option value="cover">Recortar (Cubre exacto - no deforma)</option>
                    <option value="contain">Bordes (Ver entera - no deforma)</option>
                </select>
            </div>

            <div class="dimension-fields">
                <div class="field">
                    <label>Ancho (px)</label>
                    <input type="number" v-model="width" placeholder="Ej: 1200" />
                </div>
                <div class="separator">x</div>
                <div class="field">
                    <label>Alto (px)</label>
                    <input type="number" v-model="height" placeholder="Opcional" />
                </div>
            </div>
            <p class="hint">Si dejas el alto vacío, se calculará automáticamente según el ancho.</p>

            <button class="btn-resize" :disabled="loading" @click="handleResize">
                {{ loading ? `Procesando... ${progress}%` : 'Aplicar Cambios' }}
            </button>

            <!-- Barra de progreso -->
            <div v-if="loading" class="progress-bar">
                <div class="progress-fill" :style="{ width: progress + '%' }"></div>
            </div>
        </div>

        <div v-if="resultUrl" class="result fade-in">
            <div class="divider"></div>
            <p>✓ Imagen lista para descargar</p>
            <a :href="resultUrl" download class="btn-download">Descargar Imagen</a>
        </div>
    </div>
</section>
</template>

<style scoped>
    .resize-tool { max-width: 480px; margin: 60px auto; text-align: center; font-family: sans-serif; }
    .card { background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); } .input-group { margin-bottom: 20px; text-align: left; } .info-badge { background: #f0f7ff; color: #004A8F; padding: 8px; border-radius: 6px; font-size: 0.9rem; margin-bottom: 20px; font-weight: 500; } .dimension-fields { display: flex; align-items: flex-end; gap: 15px; margin-bottom: 10px; }
    .field { flex: 1; text-align: left; display: flex; flex-direction: column; gap: 5px; } .field label { font-size: 0.85rem; font-weight: bold; color: #444; } .field input, .select-fit { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; } .separator { padding-bottom: 10px; font-weight: bold; color: #999; }
    .hint { font-size: 0.75rem; color: #666; margin-bottom: 20px; text-align: left; } .btn-resize { width: 100%; background: #004A8F; color: white; border: none; padding: 14px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: background 0.2s; } .btn-resize:hover { background: #003669; } .btn-resize:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-download { display: block; margin-top: 15px; background: #28a745; color: white; padding: 12px; border-radius: 8px; text-decoration: none; font-weight: bold; } .divider { height: 1px; background: #eee; margin: 25px 0; }
    .fade-in { animation: fadeIn 0.3s ease-in; } @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    /* Contenedor del Input oculto y el Wrapper visual */ .input-group { margin-bottom: 25px; text-align: left; } .input-group label { display: block; font-weight: 700; margin-bottom: 10px; color: #333; font-size: 0.9rem; } .hidden-input { display: none; }
    /* El área de carga estilizada */ .upload-wrapper { border: 2px dashed #e2e8f0; border-radius: 12px; background-color: #f8fafc; padding: 24px; cursor: pointer; transition: all 0.2s ease-in-out; display: flex; justify-content: center; } .upload-wrapper:hover { border-color: #004A8F; background-color: #f0f7ff; }
    /* Diseño interno */ .upload-design { display: flex; align-items: center; gap: 15px; } .icon-circle { width: 45px; height: 45px; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); font-size: 1.2rem; }
    .sub-text { font-size: 0.75rem; color: #64748b; } /* Feedback táctil */ .upload-wrapper:active { transform: scale(0.98); }
    .text-content { display: flex; flex-direction: column; } .main-text { font-weight: 600; color: #1e293b; font-size: 0.95rem; } .file-ready { font-weight: 600; color: #004A8F; font-size: 0.95rem; max-width: 200px; /* Evita que nombres largos rompan el diseño */ white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.progress-bar { width: 100%; height: 8px; background: #eee; border-radius: 4px; margin: 12px 0; overflow: hidden; }
.progress-fill { height: 100%; background: #004A8F; transition: width 0.2s ease; }
</style>
