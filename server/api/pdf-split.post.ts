import { PDFDocument } from 'pdf-lib'
import { readMultipartFormData, createError } from 'h3'
import path from 'path'
import fs from 'fs/promises'
import os from 'os'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event)
    if (!formData) throw createError({ statusCode: 400, statusMessage: 'Formulario inválido' })

    const fileEntry = formData.find(e => e.name === 'file')
    const pagesEntry = formData.find(e => e.name === 'pages')

    if (!fileEntry?.data) throw createError({ statusCode: 400, statusMessage: 'Archivo PDF no encontrado' })
    if (!pagesEntry?.data) throw createError({ statusCode: 400, statusMessage: 'Páginas no especificadas' })

    const selectedPages: number[] = JSON.parse(pagesEntry.data.toString())
    if (!Array.isArray(selectedPages) || selectedPages.length === 0) 
      throw createError({ statusCode: 400, statusMessage: 'Debe seleccionar al menos una página' })

    const pdfDoc = await PDFDocument.load(fileEntry.data)
    const newPdf = await PDFDocument.create()
    const pageCount = pdfDoc.getPageCount()

    for (const pageNum of selectedPages) {
      const index = pageNum - 1
      if (index < 0 || index >= pageCount) continue
      const [page] = await newPdf.copyPages(pdfDoc, [index])
      newPdf.addPage(page)
    }

    const pdfBuffer = await newPdf.save()

    // Guardar en tmp (Vercel)
    const id = randomUUID()
    const tmpPath = path.join(os.tmpdir(), `split-${id}.pdf`)
    await fs.writeFile(tmpPath, pdfBuffer)

    // Enviar archivo directamente al cliente con nombre
    const res = event.res
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="split-${id}.pdf"`)
    res.setHeader('Content-Length', pdfBuffer.length.toString())
    res.end(pdfBuffer)

    // Opcional: limpiar tmp más tarde
    cleanOldFiles(os.tmpdir(), 60 * 60 * 1000).catch(console.error)

  } catch (err) {
    console.error(err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al procesar el PDF'
    })
  }
})

async function cleanOldFiles(dir: string, maxAge: number) {
  const files = await fs.readdir(dir)
  const now = Date.now()

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = await fs.stat(filePath)
    if (now - stat.mtimeMs > maxAge) {
      await fs.unlink(filePath).catch(() => {})
    }
  }
}
