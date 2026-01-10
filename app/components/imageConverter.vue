<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

const props = defineProps<{
  title: string
  description: string
  fromFormat: string
  toFormat: string
  accept: string
}>()

useHead({
  title: `${props.title} | PatchWork`
})

const file = ref<File | null>(null)
const loading = ref(false)
const resultUrl = ref<string | null>(null)
const progress = ref(0)

const onFileChange = (e: Event) => {
  if (resultUrl.value) {
    URL.revokeObjectURL(resultUrl.value)
  }

  const input = e.target as HTMLInputElement
  file.value = input.files?.[0] ?? null
  resultUrl.value = null
  progress.value = 0
}

const upload = async () => {
  if (!file.value) return

  loading.value = true
  resultUrl.value = null
  progress.value = 0

  try {
    const formData = new FormData()
    formData.append('file', file.value)

    const response = await fetch(`/api/convert-image?format=${props.toFormat}`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const data = await response.json()

    if (!data.file) throw new Error('El servidor no devolvió el archivo convertido')

    // 🔹 Quitar prefijo "data:image/...;base64,"
    const base64Data = data.file.split(',')[1]
    const mimeType = data.file.split(';')[0].split(':')[1] || 'image/png'

    const binaryString = atob(base64Data)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    const blob = new Blob([bytes], { type: mimeType })
    resultUrl.value = URL.createObjectURL(blob)

    console.log('✅ Imagen convertida y lista para descargar')

  } catch (err) {
    console.error(err)
    alert('Error al procesar la imagen')
  } finally {
    loading.value = false
  }
}

// Revocar URL temporal al desmontar
onUnmounted(() => {
  if (resultUrl.value) {
    URL.revokeObjectURL(resultUrl.value)
  }
})
</script>

<template>
  <section class="tool">
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>

    <input type="file" :accept="accept" @change="onFileChange" />

    <button :disabled="loading || !file" @click="upload">
      {{ loading ? `Convirtiendo... ${progress}%` : 'Convertir' }}
    </button>

    <div v-if="loading" class="progress-bar">
      <div class="progress-fill" :style="{ width: progress + '%' }"></div>
    </div>

    <div v-if="resultUrl" class="result">
      <img :src="resultUrl" alt="Resultado" class="preview" />
      <a :href="resultUrl" :download="`converted.${props.toFormat}`" class="btn-download">
        Descargar Imagen
      </a>
    </div>
  </section>
</template>

<style scoped>
.tool { max-width: 420px; margin: 60px auto; padding: 24px; text-align: center; }
h1 { color: #004A8F; margin-bottom: 8px; }
input { margin: 20px 0; }
button { background: #004A8F; color: white; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; }
button:disabled { opacity: 0.6; cursor: not-allowed; }
a { display: block; margin-top: 20px; color: #004A8F; font-weight: 500; }
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