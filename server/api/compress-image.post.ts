// server/api/compress-image.post.ts
import { readMultipartFormData, sendError, getQuery } from 'h3'
import sharp from 'sharp'
import os from 'os'
import path from 'path'
import { randomUUID } from 'crypto'
import pngToIco from 'png-to-ico'
import fs from 'fs'

type SupportedFormat = 'png' | 'jpg' | 'jpeg' | 'webp' | 'tiff' | 'ico'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const format: SupportedFormat =
    typeof query.format === 'string'
      ? (query.format.toLowerCase() as SupportedFormat)
      : 'png'

  const quality = Math.min(
    Math.max(parseInt(query.quality?.toString() || '80'), 1),
    100
  )

  const formData = await readMultipartFormData(event)
  if (!formData) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'No file uploaded' }))
  }

  const file = formData.find(f => f.name === 'file')
  if (!file || !file.data) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Archivo no válido' }))
  }

  const supportedFormats: SupportedFormat[] = ['png', 'jpg', 'jpeg', 'webp', 'tiff', 'ico']
  if (!supportedFormats.includes(format)) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Formato no soportado' }))
  }

  const id = randomUUID()
  const ext = format === 'jpg' ? 'jpeg' : format
  const tmpPath = path.join(os.tmpdir(), `${id}.${ext}`)

  let transformer = sharp(file.data)

  try {
    if (format === 'ico') {
      // ICO → PNG → ICO
      const pngBuffer = await transformer
        .resize(256, 256, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toBuffer()

      const icoBuffer = await pngToIco(pngBuffer)
      await fs.promises.writeFile(tmpPath, icoBuffer)
    } else {
      // Compresión normal
      switch (format) {
        case 'jpeg':
        case 'jpg':
          transformer = transformer.jpeg({ quality })
          break
        case 'png':
          transformer = transformer.png({ quality: Math.min(quality, 90) })
          break
        case 'webp':
          transformer = transformer.webp({ quality })
          break
        case 'tiff':
          transformer = transformer.tiff({ quality })
          break
      }

      await transformer.toFile(tmpPath)
    }

    // Leer archivo comprimido
    const buffer = await fs.promises.readFile(tmpPath)

    const base64 = `data:image/${ext};base64,${buffer.toString('base64')}`

    // Limpiar archivo temporal
    fs.promises.unlink(tmpPath).catch(() => {})

    return {
      file: base64,
      ext,
      mimeType: `image/${ext}`,
      fileLength: buffer.length
    }

  } catch (err) {
    console.error(err)
    return sendError(event, createError({ statusCode: 500, statusMessage: 'Error procesando imagen' }))
  }
})
