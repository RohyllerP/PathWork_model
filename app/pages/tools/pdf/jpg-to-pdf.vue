<script setup>
import { jsPDF } from "jspdf";

const files = ref([]);
const loading = ref(false);
const resultUrl = ref(null);
const progress = ref(0);

useHead({ title: 'JPG a PDF | PatchWork' });

const onFileChange = (e) => {
  const selectedFiles = Array.from(e.target.files);
  
  // Mapeamos los archivos nuevos a nuestro formato de objeto
  const newFiles = selectedFiles.map(file => ({
    file,
    preview: URL.createObjectURL(file),
    name: file.name
  }));

  // CONCATENAMOS: Mantenemos los anteriores y sumamos los nuevos
  files.value = [...files.value, ...newFiles];
  
  // Limpiamos el resultado anterior porque la lista cambió
  resultUrl.value = null;
  progress.value = 0;

  // Limpiar el valor del input para permitir subir el mismo archivo dos veces si se desea
  e.target.value = '';
};

const generatePdf = async () => {
  if (files.value.length === 0) return;
  loading.value = true;
  progress.value = 0;

  try {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'px',
    });

    const totalImages = files.value.length;

    for (let i = 0; i < files.value.length; i++) {
      const imgData = await getBase64(files.value[i].file);
      
      // Obtener dimensiones reales de la imagen para que el PDF calce perfecto
      const imgProps = doc.getImageProperties(imgData);
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Si no es la primera página, añadir una nueva
      if (i > 0) doc.addPage();
      
      doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

      // Actualizar progreso
      progress.value = Math.round(((i + 1) / totalImages) * 100);
      
      // Pequeña pausa para que se vea la animación
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const pdfBlob = doc.output('blob');
    resultUrl.value = URL.createObjectURL(pdfBlob);

    // Ocultar barra de progreso después de un momento
    setTimeout(() => {
      progress.value = 0;
    }, 1000);
  } catch (err) {
    console.error(err);
    alert('Error al generar el PDF');
    progress.value = 0;
  } finally {
    loading.value = false;
  }
};

// Utilidad para convertir archivo a Base64
const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

const removeFile = (index) => {
  // Liberar la memoria de la URL del preview
  URL.revokeObjectURL(files.value[index].preview);
  
  // Eliminar del arreglo
  files.value.splice(index, 1);
  
  // Si nos quedamos sin archivos, resetear el resultado
  if (files.value.length === 0) {
    resultUrl.value = null;
    progress.value = 0;
  }
};
</script>

<template>
  <section class="jpg-to-pdf">
    <h1>JPG a PDF</h1>
    <p>Convierte tus imágenes en un único documento PDF profesional.</p>

    <div class="card">
      <div class="input-group">
        <div class="upload-wrapper" @click="$refs.fileInput.click()">
          <input 
            type="file" 
            ref="fileInput" 
            @change="onFileChange" 
            accept="image/jpeg,image/png" 
            multiple 
            class="hidden-input" 
          />
          <div class="upload-design">
            <div class="icon-circle"><span>➕</span></div>
            <div class="text-content">
              <span class="sub-text">Puedes elegir varias imagenes a la vez</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="files.length > 0" class="preview-section fade-in">
        <div class="grid-previews">
          <div v-for="(f, index) in files" :key="index" class="thumb">
            <img :src="f.preview" />
            <button class="btn-remove" @click="removeFile(index)">×</button>
          </div>
        </div>

        <button :disabled="loading" @click="generatePdf" class="btn-primary">
          {{ loading ? 'Generando PDF...' : `Convertir ${files.length} imágenes a PDF` }}
        </button>

        <!-- Barra de progreso -->
        <div v-if="loading && progress > 0 && !resultUrl" class="progress-container fade-in">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
          <p class="progress-text">Procesando imagen {{ Math.ceil((progress * files.length) / 100) }} de {{ files.length }} - {{ progress }}%</p>
        </div>
      </div>

      <div v-if="resultUrl" class="result-action fade-in">
        <div class="divider"></div>
        <p class="success-message">✓ PDF generado correctamente</p>
        <a :href="resultUrl" download="PatchWork_Convertido.pdf" class="btn-download">
          Descargar Documento PDF
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.jpg-to-pdf { max-width: 700px; margin: 40px auto; text-align: center; }
.card { background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }

/* Grid de miniaturas */
.grid-previews { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); 
  gap: 10px; 
  margin: 20px 0; 
  padding: 10px;
  background: #f8fafc;
  border-radius: 8px;
}

.thumb { position: relative; border-radius: 6px; overflow: hidden; height: 100px; border: 1px solid #ddd; }
.thumb img { width: 100%; height: 100%; object-fit: cover; }

.btn-remove { 
  position: absolute; top: 2px; right: 2px; background: rgba(255,0,0,0.8); 
  color: white; border: none; border-radius: 50%; width: 20px; height: 20px; 
  cursor: pointer; font-size: 14px; line-height: 1;
}

/* Barra de progreso */
.progress-container {
  margin: 20px 0;
  padding: 15px;
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
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #004A8F, #0066CC);
  transition: width 0.3s ease;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-text {
  margin-top: 10px;
  font-weight: 600;
  color: #004A8F;
  font-size: 14px;
  text-align: center;
}

.success-message {
  color: #28a745;
  font-weight: 600;
  font-size: 16px;
  margin: 10px 0;
}

/* Reutilización de estilos */
.upload-wrapper { border: 2px dashed #e2e8f0; border-radius: 12px; padding: 20px; cursor: pointer; display: flex; justify-content: center; transition: border-color 0.2s; }
.upload-wrapper:hover { border-color: #004A8F; }
.hidden-input { display: none; }
.btn-primary { 
  width: 100%; 
  padding: 15px; 
  background: #004A8F; 
  color: white; 
  border: none; 
  border-radius: 8px; 
  font-weight: bold; 
  cursor: pointer; 
  margin-top: 10px;
  transition: all 0.2s;
  font-size: 16px;
}
.btn-primary:hover:not(:disabled) { 
  background: #003870;
  transform: translateY(-1px);
}
.btn-primary:disabled { 
  opacity: 0.6; 
  cursor: not-allowed;
  transform: none;
}
.btn-download { 
  display: block; 
  background: #28a745; 
  color: white; 
  padding: 15px; 
  border-radius: 8px; 
  text-decoration: none; 
  font-weight: bold;
  font-size: 16px;
  transition: all 0.2s;
}
.btn-download:hover {
  background: #218838;
  transform: translateY(-1px);
}
.divider { height: 1px; background: #eee; margin: 20px 0; }
.fade-in { animation: fadeIn 0.3s ease-in; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.icon-circle {
  width: 60px;
  height: 60px;
  background: #004A8F;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.icon-circle span {
  font-size: 28px;
  color: white;
}

.upload-design {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.text-content {
  text-align: center;
}

.sub-text {
  color: #64748b;
  font-size: 14px;
}
</style>