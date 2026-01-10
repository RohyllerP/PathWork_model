// server/api/crop-image.post.ts
import { readMultipartFormData, getQuery, sendError } from 'h3'
import sharp from 'sharp'
import os from 'os'
import path from 'path'
import { randomUUID } from 'crypto'
import fs from 'fs'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const left = parseInt(query.left?.toString() || '0')
  const top = parseInt(query.top?.toString() || '0')
  const width = parseInt(query.width?.toString() || '0')
  const height = parseInt(query.height?.toString() || '0')

  const formData = await readMultipartFormData(event)
  const file = formData?.find(f => f.name === 'file')

  if (!file || !file.data || !width || !height) {
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: 'Faltan parámetros o archivo'
    }))
  }

  const id = randomUUID()
  const tmpPath = path.join(os.tmpdir(), `${id}.png`)

  try {
    await sharp(file.data)
      .extract({ left, top, width, height })
      .png()
      .toFile(tmpPath)

    const buffer = await fs.promises.readFile(tmpPath)
    const base64 = `data:image/png;base64,${buffer.toString('base64')}`

    // Limpiar tmp
    fs.promises.unlink(tmpPath).catch(() => {})

    return {
      file: base64,
      ext: 'png',
      mimeType: 'image/png',
      fileLength: buffer.length
    }

  } catch (err) {
    console.error(err)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Error al recortar: asegúrate que el área esté dentro de la imagen'
    }))
  }
})
