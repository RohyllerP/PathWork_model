import { PDFDocument } from 'pdf-lib'

export default defineEventHandler(async (event) => {
  const body = await readMultipartFormData(event)

  if (!body) {
    throw createError({ statusCode: 400, statusMessage: 'Archivo inválido' })
  }

  const file = body.find(f => f.name === 'file')
  const order = body.find(f => f.name === 'order')

  if (!file || !order) {
    throw createError({ statusCode: 400, statusMessage: 'Datos incompletos' })
  }

  const pageOrder = JSON.parse(order.data.toString())

  const pdfDoc = await PDFDocument.load(file.data)
  const newPdf = await PDFDocument.create()

  const pages = await newPdf.copyPages(
    pdfDoc,
    pageOrder.map((i: number) => i)
  )

  pages.forEach(p => newPdf.addPage(p))

  const pdfBytes = await newPdf.save()

  return {
    file: Buffer.from(pdfBytes).toString('base64')
  }
})
