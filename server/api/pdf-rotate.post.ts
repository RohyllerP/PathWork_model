import { readMultipartFormData, createError } from 'h3'
import { PDFDocument, degrees } from 'pdf-lib'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  const file = formData?.find(f => f.name === 'file')
  const angleParam = formData?.find(f => f.name === 'angle')?.data.toString()

  if (!file || !file.data) {
    throw createError({ statusCode: 400, statusMessage: 'Archivo no válido' })
  }

  const angle = Number(angleParam)
  if (![90, 180, 270].includes(angle)) {
    throw createError({ statusCode: 400, statusMessage: 'Ángulo inválido' })
  }

  try {
    const pdfDoc = await PDFDocument.load(file.data)
    const pages = pdfDoc.getPages()

    pages.forEach(page => {
      const currentRotation = page.getRotation().angle
      page.setRotation(degrees(currentRotation + angle))
    })

    const pdfBytes = await pdfDoc.save()

    return {
      file: Buffer.from(pdfBytes).toString('base64'),
      angle,
      pages: pages.length
    }
  } catch (err) {
    console.error(err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error rotando PDF'
    })
  }
})
