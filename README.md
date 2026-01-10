🧩 PatchWork Model

PatchWork Model es una versión especializada de PatchWork centrada en la conversión y procesamiento de imágenes. Esta versión está pensada para entornos de demostración o con hosting limitado, y no incluye soporte completo para PDFs, audio o video.

✨ Características principales

🖼️ Conversión y manipulación de imágenes
📄 Algunas funciones limitadas para PDFs
❌ Procesamiento de audio y video no disponible en esta versión

🧱 Arquitectura basada en componentes reutilizables

🔌 Fácil de extender si deseas agregar nuevas herramientas en un entorno local o full-stack

🛠️ Tecnologías utilizadas

Nuxt 4

Vue 3

TypeScript

Nitro (Backend de Nuxt)

📦 Librerías principales

sharp – Procesamiento de imágenes

jszip – Compresión y descarga múltiple

sortablejs, vuedraggable – Organización de archivos

📌 Para la lista completa y versiones exactas, revisa el archivo package.json.

⚙️ Requisitos del sistema

Requerido:

Node.js 18+

Opcional (solo para la versión FULL, no necesario aquí):

FFmpeg

Ghostscript

🚀 Instalación

# Clonar el repositorio
git clone https://github.com/tu-usuario/patchwork-model.git

# Entrar al proyecto
cd patchwork-model

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev


Luego abre tu navegador en:

http://localhost:3000

🧭 Estructura y arquitectura

PatchWork Model está organizado de forma modular:

Componentes reutilizables para carga y previsualización de imágenes

Separación clara entre frontend y backend

APIs en server/api para procesamiento de imágenes

Esto permite:

Escalar funcionalidades en el futuro

Adaptar la lógica a nuevos tipos de archivos si se migra a la versión FULL

⚠️ Notas importantes

Esta es una versión limitada (Model).

No incluye soporte completo para audio, video o PDFs avanzados.

Ideal para demostraciones o entornos con hosting limitado.

📄 Licencia

Distribuido bajo licencia MIT.

⭐ Cierre

Si esta versión te resulta útil, considera dejar una ⭐ en el repositorio.
