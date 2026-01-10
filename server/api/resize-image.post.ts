// server/api/resize-image.post.ts
import { readMultipartFormData, sendError, getQuery } from 'h3'
import sharp from 'sharp'
import os from 'os'
import path from 'path'
import { randomUUID } from 'crypto'
import fs from 'fs'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const format = (query.format?.toString() || 'png').toLowerCase()
  const width = query.width ? parseInt(query.width.toString()) : null
  const height = query.height ? parseInt(query.height.toString()) : null
  const fitMode = (query.fit?.toString() || 'inside') as keyof sharp.FitEnum

  const formData = await readMultipartFormData(event)
  const file = formData?.find(f => f.name === 'file')

  if (!file || !file.data) {
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: 'No file uploaded'
    }))
  }

  const id = randomUUID()
  const ext = format === 'jpg' ? 'jpeg' : format
  const tmpPath = path.join(os.tmpdir(), `${id}.${ext}`)

  try {
    let transformer = sharp(file.data)

    // Redimensionado
    if (width || height) {
      transformer = transformer.resize(width, height, {
        fit: fitMode,
        withoutEnlargement: true,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
    }

    // Formato de salida
    switch (ext) {
      case 'jpeg':
        transformer = transformer.jpeg({ quality: 95 })
        break
      case 'png':
        transformer = transformer.png()
        break
      case 'webp':
        transformer = transformer.webp()
        break
    }

    await transformer.toFile(tmpPath)

    const buffer = await fs.promises.readFile(tmpPath)
    const base64 = `data:image/${ext};base64,${buffer.toString('base64')}`

    // Limpiar tmp
    fs.promises.unlink(tmpPath).catch(() => {})

    return {
      file: base64,
      ext,
      mimeType: `image/${ext}`,
      fileLength: buffer.length
    }

  } catch (err) {
    console.error(err)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Error processing image'
    }))
  }
})
